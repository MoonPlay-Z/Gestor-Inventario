const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categorias = ['Bebidas', 'Alimentos', 'Tecnología', 'Oficina', 'Limpieza', 'Farmacia', 'Ferretería', 'Hogar'];

const imagenesCat = {
  Bebidas: [
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80',
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80'
  ],
  Alimentos: [
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80'
  ],
  Tecnología: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80'
  ],
  Oficina: [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'
  ],
  Limpieza: [
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80'
  ],
  Farmacia: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80'
  ],
  Ferretería: [
    'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&q=80',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80'
  ],
  Hogar: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80'
  ]
};

const nombresBase = [
  'Refresco Cola Premium 1.5L', 'Jugo Natural Naranja 1L', 'Agua Mineral Manantial 500ml', 'Bebida Energizante 250ml',
  'Té Helado Durazno 1.5L', 'Galletas Dulces Chocolate 200g', 'Pan Tajado Integral 500g', 'Café Tostado Molido 250g',
  'Leche Entera Larga Vida 1L', 'Queso Paisa Tajado 500g', 'Jamón de Pavo Premium 250g', 'Pasta Plumas 500g',
  'Salsa de Tomate 397g', 'Mayonesa Real 450g', 'Aceite Vegetal Canola 1L', 'Arroz Blanco Grano Largo 1kg',
  'Harina de Maíz Blanco 1kg', 'Azúcar Refinada 1kg', 'Sal Marina Fina 500g', 'Atún en Aceite de Oliva 170g',
  'Laptop Pro Core i5 8GB 256GB', 'Monitor 24 IPS FHD 75Hz', 'Teclado USB Ergonomico', 'Mouse Optico Inalambrico',
  'Audifonos Bluetooth Noise Cancelling', 'Impresora Multifuncional Wifi', 'Disco Duro Externo 1TB USB 3.0', 'Pendrive USB 3.2 64GB',
  'Cargador Rapido Tipo-C 30W', 'Cable HDMI 2.1 4K 2 metros', 'Hub USB 3.0 4 Puertos', 'Soporte Ajustable para Laptop',
  'Resma Papel Carta 75g 500H', 'Caja Boligrafos Azul x12', 'Marcador Permanente Negro x4', 'Carpeta Manila Carta x25',
  'Grapadora Metalica Uso Rudo', 'Sacapuntas Electrico Doble', 'Cinta Adhesiva Transparente x6', 'Tijeras de Oficina 8 Pulgadas',
  'Detergente Liquido Multiusos 2L', 'Desinfectante Lavanda 1L', 'Lavatrastes Crema 500g', 'Jabón de Baño Humectante x3',
  'Papel Higienico Hoja Doble x4', 'Limpiador de Vidrios 500ml', 'Esponja Multiusos Cocina x3', 'Bolsas de Basura 30L x20',
  'Analgesico Paracetamol 500mg x20', 'Vitaminas C Complejo B x30', 'Alcohol Antiseptico 70% 500ml', 'Mascarillas Quirurgicas x50',
  'Termometro Digital Infrarrojo', 'Banditas Adhesivas Curitas x100', 'Crema Dental Proteccion Total', 'Cepillo Dental Suave x2',
  'Juego de Destornilladores 6Pzas', 'Cinta Métrica 5 metros', 'Alicate Universal 8 Pulgadas', 'Martillo de Uña 16oz',
  'Linterna LED Recargable USB', 'Multímetro Digital Automotriz', 'Juego de Llaves Allen 9Pzas', 'Cinta Aislante Negra 20m',
  'Lámpara LED Escritorio Touch', 'Organizador de Escritorio Madera', 'Almohada Viscoelástica Ergonómica', 'Reloj de Pared Minimalista 30cm'
];

async function generate() {
  console.log('🚀 Generando 100 productos de prueba (50 unidades cada uno)...');

  const users = await prisma.usuario.findMany({
    where: { rol: { in: ['EMPRESA', 'ADMIN', 'SUPER_ADMIN'] } }
  });

  const empresasTarget = new Set(users.map(u => u.empresaId || u.id));

  for (const empresaId of empresasTarget) {
    if (!empresaId) continue;

    // Limpiar items de facturas y cotizaciones dependientes si es necesario
    await prisma.itemFactura.deleteMany({ where: { producto: { empresaId } } }).catch(() => {});
    await prisma.itemCotizacion.deleteMany({ where: { producto: { empresaId } } }).catch(() => {});
    await prisma.producto.deleteMany({ where: { empresaId } }).catch(() => {});

    const productosParaCrear = [];

    for (let i = 1; i <= 100; i++) {
      const catIndex = (i - 1) % categorias.length;
      const categoria = categorias[catIndex];
      const imgs = imagenesCat[categoria] || imagenesCat['Tecnología'];
      const imgUrl = imgs[i % imgs.length];

      const baseNombre = nombresBase[(i - 1) % nombresBase.length];
      const nombre = `${baseNombre} #${i}`;
      const sku = `PRD-${String(i).padStart(5, '0')}`;
      const precioVenta = (Math.floor(Math.random() * 85) + 3.50).toFixed(2);
      const costoCompra = (parseFloat(precioVenta) * 0.65).toFixed(2);

      productosParaCrear.push({
        sku,
        nombre,
        descripcion: `Producto categoría ${categoria}. Registro #${i}.`,
        imagenUrl: imgUrl,
        stockActual: 50, // 50 UNIDADES EXACTAS
        stockMinimo: 10,
        precioVenta,
        costoCompra,
        tasaImpuesto: '16.00',
        categoria,
        activo: true,
        empresaId,
      });
    }

    await prisma.producto.createMany({
      data: productosParaCrear,
      skipDuplicates: true,
    });

    console.log(`✅ 100 productos creados con 50 unidades c/u para Empresa ID: ${empresaId}`);
  }

  console.log('\n🎉 ¡Proceso completado con éxito!');
}

generate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
