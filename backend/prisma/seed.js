/**
 * Seed Data — Sistema de Gestión de Inventario (GestorPOS)
 * Genera 600 productos altamente variados (máximo 3 modelos por tipo de artículo) en Neon PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMatchingImage = (nombre = '', categoria = '') => {
  const title = (nombre + ' ' + categoria).toLowerCase();

  if (title.includes('coca') || title.includes('pepsi') || title.includes('colita') || title.includes('gaseosa') || title.includes('soda') || title.includes('refresco')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80';
  }
  if (title.includes('jugo') || title.includes('naranja') || title.includes('manzana') || title.includes('durazno') || title.includes('fruta')) {
    return 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80';
  }
  if (title.includes('agua') || title.includes('mineral') || title.includes('manantial') || title.includes('botellon')) {
    return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?w=500&q=80';
  }
  if (title.includes('laptop') || title.includes('macbook') || title.includes('thinkpad') || title.includes('computadora')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
  }
  if (title.includes('mouse') || title.includes('raton') || title.includes('ratón')) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80';
  }
  if (title.includes('audifono') || title.includes('audífonos') || title.includes('auricular') || title.includes('headphone') || title.includes('diadema')) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  }
  if (title.includes('teclado') || title.includes('keyboard')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80';
  }
  if (title.includes('monitor') || title.includes('pantalla') || title.includes('tv')) {
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80';
  }
  if (title.includes('impresora') || title.includes('printer') || title.includes('multifuncional')) {
    return 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80';
  }
  if (title.includes('disco') || title.includes('ssd') || title.includes('pendrive') || title.includes('usb') || title.includes('hub') || title.includes('almacenamiento')) {
    return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80';
  }
  if (title.includes('ups') || title.includes('regulador') || title.includes('cargador') || title.includes('cable') || title.includes('powerbank') || title.includes('adaptador')) {
    return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80';
  }
  if (title.includes('arroz') || title.includes('grano')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80';
  }
  if (title.includes('aceite') || title.includes('canola') || title.includes('oliva') || title.includes('girasol')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80';
  }
  if (title.includes('harina') || title.includes('pan') || title.includes('trigo') || title.includes('pasta') || title.includes('azucar') || title.includes('cereal') || title.includes('avena')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80';
  }
  if (title.includes('resma') || title.includes('papel') || title.includes('hoja') || title.includes('cuaderno') || title.includes('libreta') || title.includes('carpeta') || title.includes('lampara') || title.includes('organizadora') || title.includes('boligrafo')) {
    return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&q=80';
  }
  if (title.includes('destornillador') || title.includes('herramienta') || title.includes('martillo') || title.includes('taladro') || title.includes('alicate') || title.includes('esmeril') || title.includes('cinta metric') || title.includes('linterna')) {
    return 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=500&q=80';
  }
  if (title.includes('detergente') || title.includes('jabon') || title.includes('desinfectante') || title.includes('suavizante') || title.includes('limpiador') || title.includes('lavaplatos')) {
    return 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&q=80';
  }
  if (title.includes('alcohol') || title.includes('mascarilla') || title.includes('vitamina') || title.includes('crema dental') || title.includes('champu') || title.includes('farmacia') || title.includes('termometro')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80';
  }

  return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
};

function generarCatalogoVariado600() {
  const grupos = [
    // ── TECNOLOGÍA (Máx 3 modelos por artículo) ──
    { tipo: 'Laptop', cat: 'Tecnología', modelos: ['Laptop HP ProBook 450 G10 15.6"', 'Laptop Lenovo ThinkPad E14 Gen 4', 'MacBook Pro M3 14"'] },
    { tipo: 'Monitor', cat: 'Tecnología', modelos: ['Monitor LG 24" Full HD IPS 75Hz', 'Monitor Samsung 27" Curvo 1080p', 'Monitor ASUS Gaming 32" 4K UltraSharp'] },
    { tipo: 'Teclado', cat: 'Tecnología', modelos: ['Teclado Mecánico RGB Inalámbrico', 'Teclado Inalámbrico Plegable', 'Teclado Ergonómico Multimedia USB'] },
    { tipo: 'Mouse', cat: 'Tecnología', modelos: ['Mouse Óptico USB 1200 DPI', 'Mouse Ergonómico Inalámbrico MX', 'Mouse Gaming 16000 DPI RGB'] },
    { tipo: 'Audífonos', cat: 'Tecnología', modelos: ['Audífonos Bluetooth Noise Cancelling', 'Auriculares Deportivos In-Ear Wireless', 'Diadema Gaming 7.1 Surround'] },
    { tipo: 'Impresora', cat: 'Tecnología', modelos: ['Impresora Multifuncional Tinta Continua', 'Impresora Laser Monocromática Wifi', 'Impresora Térmica de Tickets 80mm POS'] },
    { tipo: 'Disco Duro / SSD', cat: 'Tecnología', modelos: ['Disco Duro Externo 1TB USB 3.0', 'SSD NVMe M.2 512GB', 'Pendrive USB 3.2 64GB Ultra'] },
    { tipo: 'Cargador / Powerbank', cat: 'Tecnología', modelos: ['Cargador Pared Tipo-C 20W', 'Cargador Rápido GaN 65W Laptop', 'Batería Portátil PowerBank 20000mAh'] },
    { tipo: 'Audio / Bocinas', cat: 'Tecnología', modelos: ['Corneta Bluetooth Portátil 10W', 'Barra de Sonido 2.1 con Subwoofer', 'Micrófono Condensador USB Estudio'] },
    { tipo: 'Conectividad', cat: 'Tecnología', modelos: ['Router Wifi 6 Dual Band 1800Mbps', 'Repetidor Extensor Wifi 300Mbps', 'Adaptador Bluetooth 5.3 Nano USB'] },
    { tipo: 'Cables HDMI / Datos', cat: 'Tecnología', modelos: ['Cable HDMI 2.1 4K 2m Blindado', 'Cable Tipo-C a Tipo-C 100W 1.8m', 'Cable DisplayPort 1.4 8K 2m'] },
    { tipo: 'Protección Eléctrica', cat: 'Tecnología', modelos: ['Regulador de Voltaje 8 Tomas 1200VA', 'UPS 750VA Respaldo Batería', 'Protector de Voltaje para Equipos'] },
    { tipo: 'Tablets y Celulares', cat: 'Tecnología', modelos: ['Tablet Android 10" 64GB OctaCore', 'Smartphone 6.5" 128GB Dual SIM', 'Lector de Libros E-Book 6" Display'] },
    { tipo: 'Cámaras', cat: 'Tecnología', modelos: ['Webcam 1080p Full HD Autofocus', 'Cámara Seguridad IP Wifi 360', 'Cámara Deportiva 4K Ultra HD'] },

    // ── BEBIDAS (Máx 3 modelos por artículo) ──
    { tipo: 'Refresco Cola', cat: 'Bebidas', modelos: ['Refresco Coca Cola 1.5L Botella PET', 'Refresco Pepsi Cola 2L Botella', 'Refresco Colita 1.5L'] },
    { tipo: 'Jugo Natural', cat: 'Bebidas', modelos: ['Jugo de Naranja 100% Pura 1L', 'Jugo de Manzana Selección 1L', 'Jugo de Durazno Néctar 1L'] },
    { tipo: 'Agua Mineral', cat: 'Bebidas', modelos: ['Agua Mineral Manantial 500ml', 'Agua Mineral Con Gas 1L', 'Botellón Agua Purificada 5L'] },
    { tipo: 'Té Helado', cat: 'Bebidas', modelos: ['Té Helado Sabor Durazno 1.5L', 'Té Helado Sabor Limón 1.5L', 'Agua de Coco Natural 500ml'] },
    { tipo: 'Energizante', cat: 'Bebidas', modelos: ['Bebida Energizante RedBull 250ml', 'Energizante Monster Energy 473ml', 'Rehidratante Gatorade Uva 500ml'] },
    { tipo: 'Café', cat: 'Bebidas', modelos: ['Café Molido Gourmet 500g', 'Café Instantáneo liofilizado 200g', 'Caja Té Verde 20 Sobres'] },
    { tipo: 'Leche Bebible', cat: 'Bebidas', modelos: ['Leche Completa UHT 1L', 'Leche Descremada 1L', 'Leche de Almendras 1L Sin Azúcar'] },

    // ── ALIMENTOS (Máx 3 modelos por artículo) ──
    { tipo: 'Arroz', cat: 'Alimentos', modelos: ['Arroz Blanco Grano Largo 1kg', 'Arroz Parbolizado T-1 1kg', 'Arroz Integral Nutritivo 1kg'] },
    { tipo: 'Aceite', cat: 'Alimentos', modelos: ['Aceite Vegetal Canola 1L', 'Aceite de Oliva Extra Virgen 500ml', 'Aceite de Girasol Puro 1L'] },
    { tipo: 'Harina', cat: 'Alimentos', modelos: ['Harina de Maíz Blanco Precocida 1kg', 'Harina de Maíz Amarillo 1kg', 'Harina de Trigo Todo Uso 1kg'] },
    { tipo: 'Pasta', cat: 'Alimentos', modelos: ['Pasta Espagueti 500g', 'Pasta Plumas Rigatoni 500g', 'Pasta Corta Tornillos 500g'] },
    { tipo: 'Granos', cat: 'Alimentos', modelos: ['Caraotas Negras Selección 500g', 'Lentejas 500g', 'Garbanzos Tiernos 500g'] },
    { tipo: 'Enlatados', cat: 'Alimentos', modelos: ['Atún en Lomo Aceite vegetal 170g', 'Sardinas en Salsa de Tomate 170g', 'Maíz Dulce en Grano 300g'] },
    { tipo: 'Condimentos y Salsas', cat: 'Alimentos', modelos: ['Sal Marina Refinada 1kg', 'Pimienta Negra Molida 100g', 'Salsa de Tomate Ketchup 397g'] },
    { tipo: 'Untables', cat: 'Alimentos', modelos: ['Mantequilla con Sal 250g', 'Mayonesa Real 445g', 'Mermelada de Fresa 300g'] },
    { tipo: 'Galletas y Snacks', cat: 'Alimentos', modelos: ['Galletas de Soda Paquete 250g', 'Galletas Rellenas de Chocolate 150g', 'Papas Fritas Crujientes 150g'] },
    { tipo: 'Cereales', cat: 'Alimentos', modelos: ['Hojuelas de Maíz Cereal 350g', 'Avena en Hojuelas 400g', 'Granola con Miel y Frutos 300g'] },

    // ── OFICINA (Máx 3 modelos por artículo) ──
    { tipo: 'Papel Bond', cat: 'Oficina', modelos: ['Resma Papel Bond Carta 75g (500 Hojas)', 'Resma Papel Bond Oficio 75g (500 Hojas)', 'Papel Fotográfico A4 20 Hojas Gloss'] },
    { tipo: 'Bolígrafos y Marcadores', cat: 'Oficina', modelos: ['Bolígrafos Azules 12-Pack', 'Juego Marcadores Permanentes 4 Colores', 'Lápices Grafito 2B 12-Pack'] },
    { tipo: 'Cuadernos y Notas', cat: 'Oficina', modelos: ['Cuaderno Espiral 100 Hojas Carta', 'Libreta Notas Pasta Dura A5', 'Bloc Notas Adhesivas Sticky 4-Pack'] },
    { tipo: 'Organización', cat: 'Oficina', modelos: ['Carpeta Manila Carta 10-Pack', 'Archivador de Palanca Ancho', 'Bandeja Organizadora Escritorio Metal'] },
    { tipo: 'Útiles de Escritorio', cat: 'Oficina', modelos: ['Engrapadora Metal Media Tira', 'Perforadora de 2 Orificios 20 Hojas', 'Tijera Oficina 7" Acero Inoxidable'] },
    { tipo: 'Accesorios Escritorio', cat: 'Oficina', modelos: ['Lámpara LED Escritorio Touch', 'Soporte Plegable Aluminio Laptop', 'Pad Mouse Ergonómico con Gel'] },

    // ── FERRETERÍA (Máx 3 modelos por artículo) ──
    { tipo: 'Destornilladores', cat: 'Ferretería', modelos: ['Juego Destornilladores 6Pzas Cromo Vanadio', 'Destornillador Eléctrico Recargable 3.6V', 'Juego Puntas Precisión 32in1'] },
    { tipo: 'Herramientas Manuales', cat: 'Ferretería', modelos: ['Martillo de Uña Acero 16oz', 'Alicate Universal 8" Profesional', 'Llave Ajustable Inglesa 10"'] },
    { tipo: 'Herramientas Eléctricas', cat: 'Ferretería', modelos: ['Taladro Inalámbrico 20V con Maletín', 'Esmeril Angular 4.5" 750W', 'Caladora Eléctrica 550W'] },
    { tipo: 'Medición y Niveles', cat: 'Ferretería', modelos: ['Cinta Métrica Flexómetro 5m', 'Nivel de Gota Aluminio 18"', 'Calibrador Pie de Rey Digital 150mm'] },
    { tipo: 'Iluminación Trabajo', cat: 'Ferretería', modelos: ['Linterna LED Recargable 1000Lm', 'Reflector LED Exterior 50W IP65', 'Bombillo LED 12W E27 Luz Blanca'] },

    // ── LIMPIEZA (Máx 3 modelos por artículo) ──
    { tipo: 'Detergente Ropa', cat: 'Limpieza', modelos: ['Detergente Líquido Multiuso 1L', 'Detergente en Polvo Lavado Rápido 1kg', 'Suavizante de Telas Aroma Fresco 1L'] },
    { tipo: 'Limpiadores Superficie', cat: 'Limpieza', modelos: ['Desinfectante Aroma Lavanda 1L', 'Limpiador de Vidrios y Cristales 500ml', 'Cloro Concentrado Desinfectante 1L'] },
    { tipo: 'Lavaplatos', cat: 'Limpieza', modelos: ['Lavaplatos en Crema Limón 450g', 'Lavaplatos Líquido Concentrado 500ml', 'Esponjas Multiuso 3-Pack'] },
    { tipo: 'Papel Higiénico / Toallas', cat: 'Limpieza', modelos: ['Papel Higiénico 4 Rollos Doble Hoja', 'Toallas Absorbentes Cocina 2 Rollos', 'Servilletas de Papel 200ct'] },

    // ── FARMACIA (Máx 3 modelos por artículo) ──
    { tipo: 'Desinfectantes Médicos', cat: 'Farmacia', modelos: ['Alcohol Antiséptico 70% 500ml', 'Gel Antibacterial con Glicerina 250ml', 'Toallitas Desinfectantes 80ct'] },
    { tipo: 'Protección Médica', cat: 'Farmacia', modelos: ['Mascarillas Quirúrgicas 3 Capas (50 Unidades)', 'Guantes de Nitrilo Examen (100 Unidades)', 'Termómetro Digital Infrarrojo'] },
    { tipo: 'Higiene Bucal', cat: 'Farmacia', modelos: ['Crema Dental Triple Acción 100ml', 'Cepillos Dentales Suaves 2-Pack', 'Enjuague Bucal Menta Fresca 500ml'] },
    { tipo: 'Cuidado Corporal', cat: 'Farmacia', modelos: ['Jabón de Tocador Corporal 3-Pack', 'Champú Nutritivo Anticaspa 400ml', 'Acondicionador Reparador 400ml'] },

    // ── HOGAR Y UTENSILIOS (Máx 3 modelos por artículo) ──
    { tipo: 'Cocina y Menaje', cat: 'Hogar', modelos: ['Sartén Antiadherente 24cm', 'Juego Cuchillos de Cocina 5Pzas', 'Taza Cerámica Té/Café 350ml'] },
    { tipo: 'Almacenamiento Hogar', cat: 'Hogar', modelos: ['Set Recipientes Herméticos 4Pzas', 'Cesta Organizadora Plástica multiuso', 'Termo Acero Inoxidable 1L'] }
  ];

  const productosFinales = [];
  let contadorTotal = 1;

  while (productosFinales.length < 600) {
    for (const g of grupos) {
      if (productosFinales.length >= 600) break;
      const modelIdx = (Math.floor(contadorTotal / grupos.length)) % g.modelos.length;
      const modeloNombre = g.modelos[modelIdx];
      const skuNum = String(contadorTotal).padStart(5, '0');
      const sku = `PRD-${skuNum}`;
      const nombre = contadorTotal <= 150 ? modeloNombre : `${modeloNombre} (Var. ${Math.floor(contadorTotal / 150) + 1})`;
      const imagenUrl = getMatchingImage(nombre, g.cat);

      let basePrecio = 15.00;
      if (g.cat === 'Tecnología') basePrecio = 120.00;
      if (g.cat === 'Bebidas' || g.cat === 'Alimentos') basePrecio = 3.50;
      if (g.cat === 'Limpieza' || g.cat === 'Farmacia') basePrecio = 5.00;

      const precioVenta = (basePrecio + ((contadorTotal % 15) * 1.5)).toFixed(2);
      const costoCompra = (Number(precioVenta) * 0.65).toFixed(2);
      const stockActual = (contadorTotal % 9 === 0) ? 2 : (15 + (contadorTotal % 50));

      productosFinales.push({
        sku,
        nombre,
        descripcion: `${g.tipo} — Modelo de alta calidad. Categoría: ${g.cat}.`,
        imagenUrl,
        stockActual,
        stockMinimo: 5,
        precioVenta,
        costoCompra,
        tasaImpuesto: '16.00',
        categoria: g.cat,
        activo: true
      });

      contadorTotal++;
    }
  }

  return productosFinales;
}

async function main() {
  console.log('🌱 Sembrando catálogo variado de 600 productos (máx 3 modelos por artículo) en Neon PostgreSQL...\n');

  const users = await prisma.usuario.findMany();
  const targetUsers = users.filter(u => ['demo', 'empresa_demo', 'admin', 'juan alfonso'].includes(u.username));

  const catalogo600 = generarCatalogoVariado600();

  for (const user of targetUsers) {
    console.log(`Limpiando e insertando catálogo para @${user.username}...`);
    await prisma.producto.deleteMany({ where: { empresaId: user.id } });

    const batch = catalogo600.map(p => ({ ...p, empresaId: user.id }));
    const chunkSize = 100;
    for (let i = 0; i < batch.length; i += chunkSize) {
      await prisma.producto.createMany({ data: batch.slice(i, i + chunkSize) });
    }
  }

  console.log('\n✅ ¡Catálogo demo de 600 productos variados (máx 3 modelos por artículo) cargado exitosamente en Neon PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
