const express = require('express');
const prisma   = require('../db/prisma');
const { authMiddleware } = require('../middleware/auth');
const { getFiscalMachine } = require('../services/fiscalMachine');

const router = express.Router();

// Todas las rutas fiscales requieren autenticación (aplicada globalmente en app.js)

/**
 * GET /api/fiscal/status
 * Retorna estado de conexión y configuración de la máquina fiscal.
 */
router.get('/status', (req, res) => {
  const fm = getFiscalMachine();
  res.json(fm.getStatus());
});

/**
 * GET /api/fiscal/config
 * Retorna configuración guardada.
 */
router.get('/config', (req, res) => {
  const fm = getFiscalMachine();
  res.json(fm.getConfig());
});

/**
 * POST /api/fiscal/connect
 * Cuerpo: { port, baudRate, marca }
 * Conecta al puerto serial de la máquina fiscal y guarda la configuración.
 */
router.post('/connect', async (req, res, next) => {
  try {
    const { port, baudRate, marca } = req.body;
    const fm = getFiscalMachine();
    const result = await fm.connect(port, baudRate, marca);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/fiscal/disconnect
 * Cierra la conexión al puerto serial.
 */
router.post('/disconnect', async (req, res) => {
  try {
    const fm = getFiscalMachine();
    const result = await fm.disconnect();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fiscal/imprimir/:facturaId
 * Busca la factura en la BD e imprime el comprobante fiscal completo.
 */
router.post('/imprimir/:facturaId', async (req, res) => {
  try {
    const { facturaId } = req.params;
    const empresaId = req.user?.empresaId || req.user?.id;

    const factura = await prisma.factura.findFirst({
      where: {
        id: facturaId,
        OR: [
          { usuarioId: empresaId },
          { usuario: { empresaId } },
        ],
      },
      include: {
        cliente: true,
        items: true,
      },
    });

    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada o no pertenece a tu empresa' });
    }

    const fm = getFiscalMachine();
    const result = await fm.imprimirVenta({
      cliente:       factura.cliente,
      items:         factura.items,
      subtotal:      parseFloat(factura.subtotal),
      impuesto:      parseFloat(factura.impuestoTotal),
      total:         parseFloat(factura.total),
      tasaIva:       parseFloat(factura.tasaIva || 16),
      numeroFactura: factura.numeroFactura,
    });

    res.json(result);
  } catch (err) {
    res.status(err.message.includes('no conectada') ? 503 : 500).json({ error: err.message });
  }
});

/**
 * POST /api/fiscal/reporte-x
 * Genera el Reporte X (parcial, no cierra el período).
 */
router.post('/reporte-x', async (req, res) => {
  try {
    const fm = getFiscalMachine();
    const result = await fm.reporteX();
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

/**
 * POST /api/fiscal/reporte-z
 * Genera el Reporte Z (cierre fiscal diario - IRREVERSIBLE).
 */
router.post('/reporte-z', async (req, res) => {
  try {
    const fm = getFiscalMachine();
    const result = await fm.reporteZ();
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

module.exports = router;
