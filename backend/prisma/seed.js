/**
 * Seed Data — Sistema de Gestión de Inventario (GestorPOS)
 * Genera datos de prueba asignados a @admin (Juan Alfonso Arcila Castilla)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos para @admin (Juan Alfonso Arcila Castilla)...\n');

  // Obtener/Crear Empresa
  let empresa = await prisma.empresa.findFirst();
  if (!empresa) {
    empresa = await prisma.empresa.create({
      data: {
        nombre: 'Empresa Demo C.A.',
        rif: 'J-12345678-9',
        direccion: 'Caracas, Venezuela',
        telefono: '04127723148'
      }
    });
  }

  // Buscar usuario admin
  let adminUser = await prisma.usuario.findFirst({
    where: {
      OR: [
        { username: 'admin' },
        { nombre: { contains: 'Juan Alfonso', mode: 'insensitive' } }
      ]
    }
  });

  if (!adminUser) {
    adminUser = await prisma.usuario.create({
      data: {
        username: 'admin',
        nombre: 'Juan Alfonso Arcila Castilla',
        rol: 'EMPRESA',
        passwordHash: '$2b$10$xyz',
        activo: true
      }
    });
  }

  const targetEmpresaId = adminUser.id; // Para productos/clientes que usan usuario.id como empresaId
  const realEmpresaId = empresa.id;     // Para facturas/cotizaciones con FK a empresas.id

  console.log(`✓ Usuario objetivo: @${adminUser.username} (${adminUser.nombre})`);
  console.log(`✓ Empresa Relacionada: "${empresa.nombre}" (${realEmpresaId})`);

  // Limpiar datos
  await prisma.pago.deleteMany().catch(() => {});
  await prisma.itemFactura.deleteMany().catch(() => {});
  await prisma.factura.deleteMany().catch(() => {});
  await prisma.itemCotizacion.deleteMany().catch(() => {});
  await prisma.cotizacion.deleteMany().catch(() => {});
  await prisma.producto.deleteMany().catch(() => {});
  await prisma.cliente.deleteMany().catch(() => {});

  // ─── 1. Clientes de Prueba ────────────────────────────────────────────────
  const clientesData = [
    {
      razonSocial: 'Tecnología Avanzada S.A.',
      rifCedula: 'J-29876543-2',
      direccion: 'Av. Francisco de Miranda, Torre Europa, Caracas',
      telefono: '+58 212-265-4400',
      correo: 'compras@tecavanzada.com',
      empresaId: targetEmpresaId,
    },
    {
      razonSocial: 'Distribuidora El Progreso C.A.',
      rifCedula: 'J-31456789-0',
      direccion: 'Calle 5, Zona Industrial Los Cortijos, Caracas',
      telefono: '+58 212-241-8800',
      correo: 'administracion@elprogreso.com.ve',
      empresaId: targetEmpresaId,
    },
    {
      razonSocial: 'Inversiones Caribe Global S.R.L.',
      rifCedula: 'J-40123456-5',
      direccion: 'Centro Comercial Las Mercedes, Local 3B, Caracas',
      telefono: '+58 212-993-1200',
      correo: 'gerencia@caribeglobal.net',
      empresaId: targetEmpresaId,
    },
    {
      razonSocial: 'Constructora Horizonte C.A.',
      rifCedula: 'J-08765432-1',
      direccion: 'Urb. La Trinidad, Av. Sorbona, Baruta',
      telefono: '+58 212-945-6700',
      correo: 'licitaciones@horizonteca.com',
      empresaId: targetEmpresaId,
    },
    {
      razonSocial: 'Carlos Alberto González',
      rifCedula: 'V-14325678',
      direccion: 'Res. El Bosque, Apto 4B, Maracay',
      telefono: '+58 412-772-3148',
      correo: 'carlosgonzalez@gmail.com',
      empresaId: targetEmpresaId,
    },
  ];

  const clientes = [];
  for (const c of clientesData) {
    const created = await prisma.cliente.create({ data: c });
    clientes.push(created);
  }
  console.log(`✓ ${clientes.length} clientes creados para @admin`);

  // ─── 2. Productos de Prueba con Imágenes ─────────────────────────────────
  const productosData = [
    {
      sku: 'BEB-001',
      nombre: 'Refresco Coca Cola 1.5L',
      descripcion: 'Bebida gaseosa sabor cola botella 1.5 litros',
      imagenUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
      stockActual: 48,
      stockMinimo: 10,
      precioVenta: '2.50',
      costoCompra: '1.40',
      tasaImpuesto: '16.00',
      categoria: 'Bebidas',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'BEB-002',
      nombre: 'Jugo de Naranja Natural 1L',
      descripcion: 'Jugo pasteurizado sin azúcar añadida',
      imagenUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80',
      stockActual: 30,
      stockMinimo: 8,
      precioVenta: '3.00',
      costoCompra: '1.80',
      tasaImpuesto: '16.00',
      categoria: 'Bebidas',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'ELEC-001',
      nombre: 'Laptop HP ProBook 450 G10',
      descripcion: 'Intel Core i7 13va gen, 16GB RAM, 512GB SSD, 15.6" FHD',
      imagenUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
      stockActual: 12,
      stockMinimo: 3,
      precioVenta: '850.00',
      costoCompra: '600.00',
      tasaImpuesto: '16.00',
      categoria: 'Tecnología',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'ELEC-002',
      nombre: 'Monitor LG 27" 4K IPS UltraSharp',
      descripcion: 'Monitor IPS 3840x2160 60Hz HDMI/DisplayPort',
      imagenUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
      stockActual: 8,
      stockMinimo: 2,
      precioVenta: '320.00',
      costoCompra: '220.00',
      tasaImpuesto: '16.00',
      categoria: 'Tecnología',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'ELEC-003',
      nombre: 'Teclado Mecánico Inalámbrico RGB',
      descripcion: 'Teclado mecánico retroiluminado Bluetooth/USB-C',
      imagenUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
      stockActual: 25,
      stockMinimo: 5,
      precioVenta: '75.00',
      costoCompra: '45.00',
      tasaImpuesto: '16.00',
      categoria: 'Tecnología',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'ELEC-004',
      nombre: 'Mouse Ergonómico Inalámbrico MX',
      descripcion: 'Mouse recargable 4000 DPI con botón lateral multidireccional',
      imagenUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80',
      stockActual: 30,
      stockMinimo: 5,
      precioVenta: '45.00',
      costoCompra: '25.00',
      tasaImpuesto: '16.00',
      categoria: 'Tecnología',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'ELEC-005',
      nombre: 'UPS APC Regulador de Voltaje 1000VA',
      descripcion: 'Sistema de protección ininterrumpida 8 tomas',
      imagenUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      stockActual: 2, // Alerta stock bajo
      stockMinimo: 5,
      precioVenta: '180.00',
      costoCompra: '110.00',
      tasaImpuesto: '16.00',
      categoria: 'Tecnología',
      empresaId: targetEmpresaId,
    },
    {
      sku: 'OFIC-001',
      nombre: 'Resma Papel Bond Carta 75g (500 Hojas)',
      descripcion: 'Paquete de papel bond blanco multitarget carta',
      imagenUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
      stockActual: 120,
      stockMinimo: 20,
      precioVenta: '5.50',
      costoCompra: '3.20',
      tasaImpuesto: '16.00',
      categoria: 'Oficina',
      empresaId: targetEmpresaId,
    },
  ];

  const productos = [];
  for (const p of productosData) {
    const created = await prisma.producto.create({ data: p });
    productos.push(created);
  }
  console.log(`✓ ${productos.length} productos con imágenes creados para @admin`);

  // ─── 3. Facturas de Prueba (Ventas) ───────────────────────────────────────
  const hoy = new Date();
  const hace15 = new Date(hoy); hace15.setDate(hoy.getDate() - 15);
  const hace5  = new Date(hoy); hace5.setDate(hoy.getDate() - 5);
  const en30   = new Date(hoy); en30.setDate(hoy.getDate() + 30);

  const laptop = productos.find(p => p.sku === 'ELEC-001');
  const mouse = productos.find(p => p.sku === 'ELEC-004');
  const coca = productos.find(p => p.sku === 'BEB-001');

  // Factura 1 — PAGADA (Pago Móvil)
  const fac1 = await prisma.factura.create({
    data: {
      numeroFactura: 5001,
      clienteId: clientes[0].id,
      usuarioId: adminUser.id,
      empresaId: realEmpresaId,
      fechaEmision: hace15,
      fechaVencimiento: en30,
      subtotal: '897.50',
      impuestoTotal: '143.60',
      total: '1041.10',
      estado: 'PAID',
      moneda: 'USD',
      tasaCambio: '36.50',
      items: {
        create: [
          {
            productoId: laptop.id,
            descripcionHistorica: laptop.nombre,
            cantidad: 1,
            precioUnitarioHistorico: '850.00',
            tasaImpuestoAplicada: '16.00',
            subtotalLinea: '850.00',
            impuestoLinea: '136.00',
            totalLinea: '986.00',
          },
          {
            productoId: mouse.id,
            descripcionHistorica: mouse.nombre,
            cantidad: 1,
            precioUnitarioHistorico: '45.00',
            tasaImpuestoAplicada: '16.00',
            subtotalLinea: '45.00',
            impuestoLinea: '7.20',
            totalLinea: '52.20',
          },
          {
            productoId: coca.id,
            descripcionHistorica: coca.nombre,
            cantidad: 1,
            precioUnitarioHistorico: '2.50',
            tasaImpuestoAplicada: '16.00',
            subtotalLinea: '2.50',
            impuestoLinea: '0.40',
            totalLinea: '2.90',
          },
        ],
      },
    },
  });

  await prisma.pago.create({
    data: {
      facturaId: fac1.id,
      monto: '1041.10',
      metodoPago: 'PAGO_MOVIL',
      referenciaTransaccion: 'PM-BANESCO-30054384',
      fechaPago: hace15,
      notas: 'Pago Móvil confirmado Banesco tlf 04127723148',
    },
  });

  // Factura 2 — PENDIENTE
  const monitor = productos.find(p => p.sku === 'ELEC-002');
  const teclado = productos.find(p => p.sku === 'ELEC-003');

  await prisma.factura.create({
    data: {
      numeroFactura: 5002,
      clienteId: clientes[1].id,
      usuarioId: adminUser.id,
      empresaId: realEmpresaId,
      fechaEmision: hace5,
      fechaVencimiento: en30,
      subtotal: '395.00',
      impuestoTotal: '63.20',
      total: '458.20',
      estado: 'PENDING',
      moneda: 'USD',
      tasaCambio: '36.50',
      observaciones: 'Pendiente pago Binance / Paypal',
      items: {
        create: [
          {
            productoId: monitor.id,
            descripcionHistorica: monitor.nombre,
            cantidad: 1,
            precioUnitarioHistorico: '320.00',
            tasaImpuestoAplicada: '16.00',
            subtotalLinea: '320.00',
            impuestoLinea: '51.20',
            totalLinea: '371.20',
          },
          {
            productoId: teclado.id,
            descripcionHistorica: teclado.nombre,
            cantidad: 1,
            precioUnitarioHistorico: '75.00',
            tasaImpuestoAplicada: '16.00',
            subtotalLinea: '75.00',
            impuestoLinea: '12.00',
            totalLinea: '87.00',
          },
        ],
      },
    },
  });

  // ─── 4. Cotización de Prueba para @admin ──────────────────────────────────
  await prisma.cotizacion.create({
    data: {
      numero: 3001,
      clienteId: clientes[2].id,
      usuarioId: adminUser.id,
      empresaId: realEmpresaId,
      fechaEmision: hoy,
      fechaValidez: en30,
      subtotal: '850.00',
      impuestoTotal: '136.00',
      total: '986.00',
      estado: 'PENDIENTE',
      items: {
        create: [
          {
            productoId: laptop.id,
            descripcion: laptop.nombre,
            cantidad: 1,
            precioUnitario: '850.00',
            totalLinea: '986.00',
          }
        ]
      }
    }
  });

  console.log('✓ Facturas, pagos y cotizaciones creados para @admin');
  console.log(`\n✅ ¡Pruebas de registro asignadas a @admin (Juan Alfonso Arcila Castilla) cargadas con éxito!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
