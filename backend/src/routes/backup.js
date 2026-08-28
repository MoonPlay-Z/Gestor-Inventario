const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const fs      = require('fs');
const path    = require('path');
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
const configPath = path.join(dataDir, 'config.json');

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
const facturaTenantFilter = (empresaId) => ({
  OR: [
    { usuarioId: empresaId },
    { usuario: { empresaId } }
  ]
});

// GET /api/backup/export — Export database and configuration
router.get('/export', async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.rol === 'SUPER_ADMIN';
    const empresaId = getEmpresaId(req);

    let clientes, productos, facturas, itemsFactura, pagos, correlativos;

    if (isSuperAdmin) {
      [clientes, productos, facturas, itemsFactura, pagos, correlativos] = await Promise.all([
        prisma.cliente.findMany(),
        prisma.producto.findMany(),
        prisma.factura.findMany(),
        prisma.itemFactura.findMany(),
        prisma.pago.findMany(),
        prisma.correlativo.findMany(),
      ]);
    } else {
      const fFilter = facturaTenantFilter(empresaId);
      [clientes, productos, facturas, itemsFactura, pagos] = await Promise.all([
        prisma.cliente.findMany({ where: { empresaId } }),
        prisma.producto.findMany({ where: { empresaId } }),
        prisma.factura.findMany({ where: fFilter }),
        prisma.itemFactura.findMany({ where: { factura: fFilter } }),
        prisma.pago.findMany({ where: { factura: fFilter } }),
      ]);
      correlativos = [];
    }

    let config = null;
    try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (err) {
      console.error('Error exporting config:', err);
    }

    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      empresaId: isSuperAdmin ? 'GLOBAL' : empresaId,
      config,
      data: {
        clientes,
        productos,
        facturas,
        itemsFactura,
        pagos,
        correlativos,
      }
    };

    res.setHeader('Content-disposition', `attachment; filename=backup_${new Date().toISOString().slice(0, 10)}.json`);
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(backupData, null, 2));
    res.end();
  } catch (err) {
    next(err);
  }
});

// POST /api/backup/import — Import database from JSON backup file
router.post('/import', async (req, res, next) => {
  try {
    const { version, config, data } = req.body;
    const isSuperAdmin = req.user?.rol === 'SUPER_ADMIN';
    const empresaId = getEmpresaId(req);

    if (!data || !data.clientes || !data.productos || !data.facturas || !data.itemsFactura || !data.pagos) {
      return res.status(400).json({ error: 'El archivo de respaldo no es válido o está corrupto.' });
    }

    // Restauración de registros aislados
    await prisma.$transaction(async (tx) => {
      const fFilter = facturaTenantFilter(empresaId);

      if (isSuperAdmin) {
        // Super admin puede reiniciar globalmente
        await tx.pago.deleteMany();
        await tx.itemFactura.deleteMany();
        await tx.factura.deleteMany();
        await tx.producto.deleteMany();
        await tx.cliente.deleteMany();
        if (data.correlativos) {
          await tx.correlativo.deleteMany();
        }
      } else {
        // Empresa solo elimina y reemplaza SUS propios registros
        await tx.pago.deleteMany({ where: { factura: fFilter } });
        await tx.itemFactura.deleteMany({ where: { factura: fFilter } });
        await tx.factura.deleteMany({ where: fFilter });
        await tx.producto.deleteMany({ where: { empresaId } });
        await tx.cliente.deleteMany({ where: { empresaId } });
      }

      // Insert Clientes
      for (const item of data.clientes) {
        await tx.cliente.create({
          data: {
            id: item.id,
            razonSocial: item.razonSocial,
            rifCedula: item.rifCedula,
            direccion: item.direccion,
            telefono: item.telefono,
            correo: item.correo,
            empresaId: isSuperAdmin ? (item.empresaId || empresaId) : empresaId,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          }
        });
      }

      // Insert Productos
      for (const item of data.productos) {
        await tx.producto.create({
          data: {
            id: item.id,
            sku: item.sku,
            nombre: item.nombre,
            descripcion: item.descripcion,
            stockActual: item.stockActual,
            stockMinimo: item.stockMinimo,
            precioVenta: item.precioVenta,
            costoCompra: item.costoCompra || 0.00,
            tasaImpuesto: item.tasaImpuesto,
            categoria: item.categoria || 'General',
            empresaId: isSuperAdmin ? (item.empresaId || empresaId) : empresaId,
            activo: item.activo,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          }
        });
      }

      // Insert Facturas
      for (const item of data.facturas) {
        await tx.factura.create({
          data: {
            id: item.id,
            numeroFactura: item.numeroFactura,
            clienteId: item.clienteId,
            usuarioId: item.usuarioId || req.user.id,
            fechaEmision: new Date(item.fechaEmision).toISOString(),
            fechaVencimiento: new Date(item.fechaVencimiento).toISOString(),
            subtotal: item.subtotal,
            impuestoTotal: item.impuestoTotal,
            total: item.total,
            estado: item.estado,
            moneda: item.moneda || 'USD',
            tasaCambio: item.tasaCambio || 1,
            cuotasTotales: item.cuotasTotales || 1,
            observaciones: item.observaciones,
            createdAt: new Date(item.createdAt).toISOString(),
            updatedAt: new Date(item.updatedAt).toISOString(),
          }
        });
      }

      // Insert Items Factura
      for (const item of data.itemsFactura) {
        await tx.itemFactura.create({
          data: {
            id: item.id,
            facturaId: item.facturaId,
            productoId: item.productoId,
            descripcionHistorica: item.descripcionHistorica,
            cantidad: item.cantidad,
            precioUnitarioHistorico: item.precioUnitarioHistorico,
            tasaImpuestoAplicada: item.tasaImpuestoAplicada,
            subtotalLinea: item.subtotalLinea,
            impuestoLinea: item.impuestoLinea,
            totalLinea: item.totalLinea,
            createdAt: new Date(item.createdAt).toISOString(),
          }
        });
      }

      // Insert Pagos
      for (const item of data.pagos) {
        await tx.pago.create({
          data: {
            id: item.id,
            facturaId: item.facturaId,
            monto: item.monto,
            metodoPago: item.metodoPago,
            referenciaTransaccion: item.referenciaTransaccion,
            fechaPago: new Date(item.fechaPago).toISOString(),
            notas: item.notas,
            createdAt: new Date(item.createdAt).toISOString(),
          }
        });
      }

      if (isSuperAdmin && data.correlativos) {
        for (const item of data.correlativos) {
          await tx.correlativo.create({
            data: {
              id: item.id,
              nombre: item.nombre,
              valor: item.valor,
            }
          });
        }
      }
    });

    if (config) {
      const dataDir = path.dirname(configPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    }

    res.json({ message: 'Respaldo restaurado con éxito de forma aislada y segura.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
