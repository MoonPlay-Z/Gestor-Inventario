/**
 * Seed Data — Sistema de Gestión de Inventario
 * Genera datos ficticios para pruebas inmediatas tras la instalación
 */

const { PrismaClient: PostgreSqlClient } = require('@prisma/client');
const { PrismaClient: SqliteClient } = require('../src/generated/prisma-sqlite');
const { Decimal } = require('decimal.js');

const PrismaClient = process.env.DB_PROVIDER === 'sqlite' || process.env.DATABASE_URL?.startsWith('file:')
  ? SqliteClient
  : PostgreSqlClient;
const prisma = new PrismaClient();
const sqlite = PrismaClient === SqliteClient;
const amount = (value) => sqlite ? Number(value.toFixed(2)) : value.toFixed(2);

async function main() {
  console.log('🌱 Iniciando seed de datos...\n');

  // ─── Limpiar datos existentes ─────────────────────────────────────────────
  await prisma.pago.deleteMany();
  await prisma.itemFactura.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.cliente.deleteMany();
  console.log('✓ Datos anteriores eliminados');

  // ─── Clientes ─────────────────────────────────────────────────────────────
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        razonSocial: 'Tecnología Avanzada S.A.',
        rifCedula: 'J-29876543-2',
        direccion: 'Av. Francisco de Miranda, Torre Europa, Piso 8, Chacao, Caracas',
        telefono: '+58 212-265-4400',
        correo: 'compras@tecavanzada.com',
      },
    }),
    prisma.cliente.create({
      data: {
        razonSocial: 'Distribuidora El Progreso C.A.',
        rifCedula: 'J-31456789-0',
        direccion: 'Calle 5, Zona Industrial Los Cortijos, Caracas',
        telefono: '+58 212-241-8800',
        correo: 'administracion@elprogreso.com.ve',
      },
    }),
    prisma.cliente.create({
      data: {
        razonSocial: 'Inversiones Caribe Global S.R.L.',
        rifCedula: 'J-40123456-5',
        direccion: 'Centro Comercial Las Mercedes, Local 3B, Caracas',
        telefono: '+58 212-993-1200',
        correo: 'gerencia@caribeglobal.net',
      },
    }),
    prisma.cliente.create({
      data: {
        razonSocial: 'Constructora Horizonte C.A.',
        rifCedula: 'J-08765432-1',
        direccion: 'Urb. La Trinidad, Av. Sorbona, Edificio Arco, Baruta, Miranda',
        telefono: '+58 212-945-6700',
        correo: 'licitaciones@horizonteca.com',
      },
    }),
    prisma.cliente.create({
      data: {
        razonSocial: 'González Rodríguez, Carlos Alberto',
        rifCedula: 'V-14325678',
        direccion: 'Res. El Bosque, Piso 4, Apto 4B, Maracay, Aragua',
        telefono: '+58 414-447-9900',
        correo: 'carlosgonzalez@gmail.com',
      },
    }),
  ]);
  console.log(`✓ ${clientes.length} clientes creados`);

  // ─── Empresa (dueña de los productos) ───────────────────────────────────
  const empresa = await prisma.usuario.upsert({
    where: { username: 'empresa_demo' },
    update: {},
    create: {
      username: 'empresa_demo',
      passwordHash: 'seed',
      nombre: 'Empresa Demo',
      rol: 'ADMIN',
      activo: true,
    },
  });
  console.log(`✓ Empresa de prueba creada/reutilizada: ${empresa.id}`);
  // ─── Productos ────────────────────────────────────────────────────────────
  const productosData = [
    {
      sku: 'ELEC-001',
      nombre: 'Laptop HP ProBook 450 G10',
      descripcion: 'Laptop empresarial Intel Core i7, 16GB RAM, 512GB SSD, 15.6" FHD',
      stockActual: 12,
      stockMinimo: 3,
      precioVenta: '1850.00',
      costoCompra: '1200.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'ELEC-002',
      nombre: 'Monitor LG 27" 4K UltraSharp',
      descripcion: 'Monitor IPS 3840x2160, 60Hz, HDMI/DisplayPort, ajustable en altura',
      stockActual: 8,
      stockMinimo: 2,
      precioVenta: '520.00',
      costoCompra: '350.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'ELEC-003',
      nombre: 'Teclado Inalámbrico Logitech MX Keys',
      descripcion: 'Teclado retroiluminado Bluetooth/USB, compatible Win/Mac',
      stockActual: 25,
      stockMinimo: 5,
      precioVenta: '85.00',
      costoCompra: '50.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'ELEC-004',
      nombre: 'Mouse Inalámbrico Logitech MX Master 3',
      descripcion: 'Mouse ergonómico 4000 DPI, Bluetooth, batería recargable',
      stockActual: 30,
      stockMinimo: 5,
      precioVenta: '75.00',
      costoCompra: '40.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'ELEC-005',
      nombre: 'UPS APC Back-UPS 1000VA',
      descripcion: 'Sistema de alimentación ininterrumpida 1000VA/600W, 8 tomas',
      stockActual: 4,
      stockMinimo: 5,  // Bajo stock mínimo — generará alerta
      precioVenta: '180.00',
      costoCompra: '110.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'OFIC-001',
      nombre: 'Resma de Papel Bond Carta 75g',
      descripcion: 'Paquete 500 hojas, papel bond blanco, tamaño carta',
      stockActual: 150,
      stockMinimo: 20,
      precioVenta: '8.50',
      costoCompra: '5.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'OFIC-002',
      nombre: 'Cartucho Tinta HP 664 Negro',
      descripcion: 'Cartucho original HP 664, color negro, ~120 páginas',
      stockActual: 3,
      stockMinimo: 8,  // Bajo stock mínimo
      precioVenta: '22.00',
      costoCompra: '12.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'OFIC-003',
      nombre: 'Bolígrafo BIC Cristal (Caja x12)',
      descripcion: 'Caja de 12 bolígrafos punto medio, color azul',
      stockActual: 60,
      stockMinimo: 10,
      precioVenta: '6.00',
      costoCompra: '3.50',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'SOFT-001',
      nombre: 'Licencia Microsoft Office 365 Business',
      descripcion: 'Suscripción anual por usuario, incluye Word, Excel, PowerPoint, Teams',
      stockActual: 50,
      stockMinimo: 5,
      precioVenta: '120.00',
      costoCompra: '80.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'SERV-001',
      nombre: 'Servicio de Soporte Técnico (Hora)',
      descripcion: 'Servicio de soporte técnico presencial o remoto, facturado por hora',
      stockActual: 999,
      stockMinimo: 1,
      precioVenta: '35.00',
      costoCompra: '10.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'SERV-002',
      nombre: 'Mantenimiento Preventivo PC (Equipo)',
      descripcion: 'Limpieza física, revisión de componentes y optimización de SO por equipo',
      stockActual: 999,
      stockMinimo: 1,
      precioVenta: '55.00',
      costoCompra: '15.00',
      tasaImpuesto: '16.00',
    },
    {
      sku: 'RED-001',
      nombre: 'Switch Cisco SG110-16 16 Puertos',
      descripcion: 'Switch no administrable Gigabit Ethernet 16 puertos, montaje en rack',
      stockActual: 2,
      stockMinimo: 3,  // Bajo stock mínimo
      precioVenta: '210.00',
      costoCompra: '140.00',
      tasaImpuesto: '16.00',
    },
  ];

  const productos = await Promise.all(
    productosData.map((p) =>
      prisma.producto.create({
        data: {
          ...p,
          precioVenta: sqlite ? Number(p.precioVenta) : p.precioVenta,
          costoCompra: sqlite ? Number(p.costoCompra) : p.costoCompra,
          tasaImpuesto: sqlite ? Number(p.tasaImpuesto) : p.tasaImpuesto,
          empresaId: empresa.id,
        },
      })
    )
  );
  console.log(`✓ ${productos.length} productos creados`);

  // ─── Facturas con Items y Pagos ───────────────────────────────────────────

  const hoy = new Date();
  const hace30 = new Date(hoy); hace30.setDate(hoy.getDate() - 30);
  const hace15 = new Date(hoy); hace15.setDate(hoy.getDate() - 15);
  const hace5  = new Date(hoy); hace5.setDate(hoy.getDate() - 5);
  const en30   = new Date(hoy); en30.setDate(hoy.getDate() + 30);
  const enMenos10 = new Date(hoy); enMenos10.setDate(hoy.getDate() - 10); // Vencida
  let facturaNumero = 1;

  // ─── Factura 1: PAID ──────────────────────────────────────────────────────
  {
    const laptop = productos.find(p => p.sku === 'ELEC-001');
    const monitor = productos.find(p => p.sku === 'ELEC-002');

    const precioLaptop = new Decimal(laptop.precioVenta.toString());
    const precioMonitor = new Decimal(monitor.precioVenta.toString());
    const tasaLaptop = new Decimal(laptop.tasaImpuesto.toString()).div(100);
    const tasaMonitor = new Decimal(monitor.tasaImpuesto.toString()).div(100);
    const cantLaptop = new Decimal(2);
    const cantMonitor = new Decimal(3);

    const subLinea1 = precioLaptop.mul(cantLaptop);
    const impLinea1 = subLinea1.mul(tasaLaptop);
    const totLinea1 = subLinea1.add(impLinea1);

    const subLinea2 = precioMonitor.mul(cantMonitor);
    const impLinea2 = subLinea2.mul(tasaMonitor);
    const totLinea2 = subLinea2.add(impLinea2);

    const subtotal = subLinea1.add(subLinea2);
    const impTotal = impLinea1.add(impLinea2);
    const total = subtotal.add(impTotal);

    const factura1 = await prisma.factura.create({
      data: {
        numeroFactura: facturaNumero++,
        clienteId: clientes[0].id,
        fechaEmision: hace30,
        fechaVencimiento: hace15,
        subtotal: amount(subtotal),
        impuestoTotal: amount(impTotal),
        total: amount(total),
        estado: 'PAID',
        items: {
          create: [
            {
              productoId: laptop.id,
              descripcionHistorica: laptop.nombre,
              cantidad: 2,
              precioUnitarioHistorico: amount(precioLaptop),
              tasaImpuestoAplicada: sqlite ? Number(laptop.tasaImpuesto) : laptop.tasaImpuesto.toString(),
              subtotalLinea: amount(subLinea1),
              impuestoLinea: amount(impLinea1),
              totalLinea: amount(totLinea1),
            },
            {
              productoId: monitor.id,
              descripcionHistorica: monitor.nombre,
              cantidad: 3,
              precioUnitarioHistorico: amount(precioMonitor),
              tasaImpuestoAplicada: sqlite ? Number(monitor.tasaImpuesto) : monitor.tasaImpuesto.toString(),
              subtotalLinea: amount(subLinea2),
              impuestoLinea: amount(impLinea2),
              totalLinea: amount(totLinea2),
            },
          ],
        },
      },
    });

    await prisma.pago.create({
      data: {
        facturaId: factura1.id,
        monto: amount(total),
        metodoPago: 'BANK_TRANSFER',
        referenciaTransaccion: 'TRF-2024-00145',
        fechaPago: hace15,
        notas: 'Pago completo recibido por transferencia bancaria',
      },
    });
    console.log(`✓ Factura #1 (PAID) creada — Total: ${amount(total)}`);
  }

  // ─── Factura 2: PARTIALLY_PAID ────────────────────────────────────────────
  {
    const office = productos.find(p => p.sku === 'SOFT-001');
    const soporte = productos.find(p => p.sku === 'SERV-001');
    const papel = productos.find(p => p.sku === 'OFIC-001');

    const pO = new Decimal(office.precioVenta.toString());
    const pS = new Decimal(soporte.precioVenta.toString());
    const pP = new Decimal(papel.precioVenta.toString());
    const tO = new Decimal(office.tasaImpuesto.toString()).div(100);
    const tS = new Decimal(soporte.tasaImpuesto.toString()).div(100);
    const tP = new Decimal(papel.tasaImpuesto.toString()).div(100);

    const cO = new Decimal(5);
    const cS = new Decimal(8);
    const cP = new Decimal(10);

    const sl1 = pO.mul(cO); const il1 = sl1.mul(tO); const tl1 = sl1.add(il1);
    const sl2 = pS.mul(cS); const il2 = sl2.mul(tS); const tl2 = sl2.add(il2);
    const sl3 = pP.mul(cP); const il3 = sl3.mul(tP); const tl3 = sl3.add(il3);

    const subtotal = sl1.add(sl2).add(sl3);
    const impTotal = il1.add(il2).add(il3);
    const total = subtotal.add(impTotal);

    const abono = total.div(2).toDecimalPlaces(2);

    const factura2 = await prisma.factura.create({
      data: {
        numeroFactura: facturaNumero++,
        clienteId: clientes[1].id,
        fechaEmision: hace15,
        fechaVencimiento: en30,
        subtotal: amount(subtotal),
        impuestoTotal: amount(impTotal),
        total: amount(total),
        estado: 'PARTIALLY_PAID',
        items: {
          create: [
            {
              productoId: office.id,
              descripcionHistorica: office.nombre,
              cantidad: 5,
              precioUnitarioHistorico: amount(pO),
              tasaImpuestoAplicada: sqlite ? Number(office.tasaImpuesto) : office.tasaImpuesto.toString(),
              subtotalLinea: amount(sl1),
              impuestoLinea: amount(il1),
              totalLinea: amount(tl1),
            },
            {
              productoId: soporte.id,
              descripcionHistorica: soporte.nombre,
              cantidad: 8,
              precioUnitarioHistorico: amount(pS),
              tasaImpuestoAplicada: sqlite ? Number(soporte.tasaImpuesto) : soporte.tasaImpuesto.toString(),
              subtotalLinea: amount(sl2),
              impuestoLinea: amount(il2),
              totalLinea: amount(tl2),
            },
            {
              productoId: papel.id,
              descripcionHistorica: papel.nombre,
              cantidad: 10,
              precioUnitarioHistorico: amount(pP),
              tasaImpuestoAplicada: sqlite ? Number(papel.tasaImpuesto) : papel.tasaImpuesto.toString(),
              subtotalLinea: amount(sl3),
              impuestoLinea: amount(il3),
              totalLinea: amount(tl3),
            },
          ],
        },
      },
    });

    await prisma.pago.create({
      data: {
        facturaId: factura2.id,
        monto: amount(abono),
        metodoPago: 'CASH',
        referenciaTransaccion: null,
        fechaPago: hace5,
        notas: 'Abono del 50%',
      },
    });
    console.log(`✓ Factura #2 (PARTIALLY_PAID) creada — Total: ${amount(total)}, Abono: ${amount(abono)}`);
  }

  // ─── Factura 3: PENDING (vencida) ─────────────────────────────────────────
  {
    const ups = productos.find(p => p.sku === 'ELEC-005');
    const sw  = productos.find(p => p.sku === 'RED-001');

    const pU = new Decimal(ups.precioVenta.toString());
    const pS = new Decimal(sw.precioVenta.toString());
    const tU = new Decimal(ups.tasaImpuesto.toString()).div(100);
    const tS = new Decimal(sw.tasaImpuesto.toString()).div(100);

    const sl1 = pU.mul(2); const il1 = sl1.mul(tU); const tl1 = sl1.add(il1);
    const sl2 = pS.mul(1); const il2 = sl2.mul(tS); const tl2 = sl2.add(il2);

    const subtotal = sl1.add(sl2);
    const impTotal = il1.add(il2);
    const total = subtotal.add(impTotal);

    await prisma.factura.create({
      data: {
        numeroFactura: facturaNumero++,
        clienteId: clientes[3].id,
        fechaEmision: hace30,
        fechaVencimiento: enMenos10,  // Ya vencida
        subtotal: amount(subtotal),
        impuestoTotal: amount(impTotal),
        total: amount(total),
        estado: 'PENDING',
        observaciones: 'Cliente pendiente de contactar para gestión de cobro',
        items: {
          create: [
            {
              productoId: ups.id,
              descripcionHistorica: ups.nombre,
              cantidad: 2,
              precioUnitarioHistorico: amount(pU),
              tasaImpuestoAplicada: sqlite ? Number(ups.tasaImpuesto) : ups.tasaImpuesto.toString(),
              subtotalLinea: amount(sl1),
              impuestoLinea: amount(il1),
              totalLinea: amount(tl1),
            },
            {
              productoId: sw.id,
              descripcionHistorica: sw.nombre,
              cantidad: 1,
              precioUnitarioHistorico: amount(pS),
              tasaImpuestoAplicada: sqlite ? Number(sw.tasaImpuesto) : sw.tasaImpuesto.toString(),
              subtotalLinea: amount(sl2),
              impuestoLinea: amount(il2),
              totalLinea: amount(tl2),
            },
          ],
        },
      },
    });
    console.log(`✓ Factura #3 (PENDING vencida) creada — Total: ${amount(total)}`);
  }

  // ─── Factura 4: PENDING (vigente) ─────────────────────────────────────────
  {
    const teclado = productos.find(p => p.sku === 'ELEC-003');
    const mouse   = productos.find(p => p.sku === 'ELEC-004');
    const bic     = productos.find(p => p.sku === 'OFIC-003');

    const pT = new Decimal(teclado.precioVenta.toString());
    const pM = new Decimal(mouse.precioVenta.toString());
    const pB = new Decimal(bic.precioVenta.toString());
    const tT = new Decimal(teclado.tasaImpuesto.toString()).div(100);
    const tM = new Decimal(mouse.tasaImpuesto.toString()).div(100);
    const tB = new Decimal(bic.tasaImpuesto.toString()).div(100);

    const sl1 = pT.mul(3); const il1 = sl1.mul(tT); const tl1 = sl1.add(il1);
    const sl2 = pM.mul(3); const il2 = sl2.mul(tM); const tl2 = sl2.add(il2);
    const sl3 = pB.mul(5); const il3 = sl3.mul(tB); const tl3 = sl3.add(il3);

    const subtotal = sl1.add(sl2).add(sl3);
    const impTotal = il1.add(il2).add(il3);
    const total = subtotal.add(impTotal);

    await prisma.factura.create({
      data: {
        numeroFactura: facturaNumero++,
        clienteId: clientes[2].id,
        fechaEmision: hace5,
        fechaVencimiento: en30,
        subtotal: amount(subtotal),
        impuestoTotal: amount(impTotal),
        total: amount(total),
        estado: 'PENDING',
        items: {
          create: [
            {
              productoId: teclado.id,
              descripcionHistorica: teclado.nombre,
              cantidad: 3,
              precioUnitarioHistorico: amount(pT),
              tasaImpuestoAplicada: sqlite ? Number(teclado.tasaImpuesto) : teclado.tasaImpuesto.toString(),
              subtotalLinea: amount(sl1),
              impuestoLinea: amount(il1),
              totalLinea: amount(tl1),
            },
            {
              productoId: mouse.id,
              descripcionHistorica: mouse.nombre,
              cantidad: 3,
              precioUnitarioHistorico: amount(pM),
              tasaImpuestoAplicada: sqlite ? Number(mouse.tasaImpuesto) : mouse.tasaImpuesto.toString(),
              subtotalLinea: amount(sl2),
              impuestoLinea: amount(il2),
              totalLinea: amount(tl2),
            },
            {
              productoId: bic.id,
              descripcionHistorica: bic.nombre,
              cantidad: 5,
              precioUnitarioHistorico: amount(pB),
              tasaImpuestoAplicada: sqlite ? Number(bic.tasaImpuesto) : bic.tasaImpuesto.toString(),
              subtotalLinea: amount(sl3),
              impuestoLinea: amount(il3),
              totalLinea: amount(tl3),
            },
          ],
        },
      },
    });
    console.log(`✓ Factura #4 (PENDING vigente) creada — Total: ${amount(total)}`);
  }

  console.log('\n✅ Seed completado exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
