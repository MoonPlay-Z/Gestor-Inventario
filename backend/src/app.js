require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const prisma  = require('./db/prisma');

const clientesRouter   = require('./routes/clientes');
const productosRouter  = require('./routes/productos');
const facturasRouter   = require('./routes/facturas');
const pagosRouter      = require('./routes/pagos');
const configRouter     = require('./routes/config');
const backupRouter     = require('./routes/backup');
const cajaRouter       = require('./routes/caja');
const cotizacionesRouter = require('./routes/cotizaciones');
const usuariosRouter   = require('./routes/usuarios');
const authRouter       = require('./routes/auth');
const activacionesRouter = require('./routes/activaciones');
const b2bRouter        = require('./routes/b2b');
const fiscalRouter     = require('./routes/fiscal');
const { authMiddleware, requireRole } = require('./middleware/auth');
const { subscriptionGuard } = require('./middleware/subscriptionGuard');
const { errorHandler } = require('./middleware/errorHandler');

const app    = express();
const PORT   = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean) || [];

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  'https://gestor-inventario-pos.netlify.app',
  ...configuredOrigins,
]);

function isAllowedOrigin(origin) {
  if (!origin || allowedOrigins.has(origin) || allowedOrigins.has('*')) return true;
  
  // En entorno de desarrollo (o red local), permitir cualquier origen de la red o IP privada
  if (process.env.NODE_ENV !== 'production') return true;

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;
    // Permitir dominios de Netlify o IPs de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (
      host.endsWith('.netlify.app') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      /^192\.168\.\d+\.\d+$/.test(host) ||
      /^10\.\d+\.\d+\.\d+$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origén no permitido: ${origin}`);
      callback(new Error('CORS: origen no permitido'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Request logger (dev) ────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Rutas Públicas ────────────────────────────────────────────────────────────
const rolesRouter      = require('./routes/roles');

// ─── Rutas Públicas ────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', error: 'Base de datos no disponible' });
  }
});

// GET /api/public/noticias — Noticias y anuncios de la Landing Page (Público)
app.get('/api/public/noticias', async (_req, res) => {
  try {
    const noticias = await prisma.noticia.findMany({
      where: { publicado: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(noticias || []);
  } catch (err) {
    console.warn('[WARN] No se pudieron cargar las noticias:', err.message);
    res.json([]);
  }
});

// POST /api/public/promociones/validar — Validar un código promocional (Público/Registro)
app.post('/api/public/promociones/validar', async (req, res, next) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Código requerido' });

    const promo = await prisma.promocion.findUnique({
      where: { codigo: codigo.trim().toUpperCase() }
    });

    if (!promo || !promo.activo) {
      return res.status(404).json({ error: 'Código promocional inválido o inactivo' });
    }
    if (promo.fechaFin && new Date() > new Date(promo.fechaFin)) {
      return res.status(400).json({ error: 'Código promocional expirado' });
    }
    if (promo.usosActuales >= promo.usosMaximos) {
      return res.status(400).json({ error: 'Límite de usos del código alcanzado' });
    }

    res.json({
      valido: true,
      codigo: promo.codigo,
      titulo: promo.titulo,
      descuentoPorc: promo.descuentoPorc,
      diasExtraTrial: promo.diasExtraTrial,
      planDestino: promo.planDestino
    });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/v1/b2b', b2bRouter);  // Protegida por API Key (no JWT)

// ─── Rutas Protegidas (JWT + Suscripción) ─────────────────────────────────────
app.use('/api', authMiddleware);      // Verifica JWT
app.use('/api', subscriptionGuard);  // Verifica suscripción activa/trial

app.use('/api/clientes',     clientesRouter);
app.use('/api/productos',    productosRouter);
app.use('/api/facturas',     facturasRouter);
app.use('/api/pagos',        pagosRouter);
app.use('/api/config',       configRouter);
app.use('/api/backup',       backupRouter);
app.use('/api/caja',         cajaRouter);
app.use('/api/cotizaciones', cotizacionesRouter);
app.use('/api/usuarios',     usuariosRouter);
app.use('/api/activaciones', activacionesRouter);
app.use('/api/roles',        rolesRouter);
app.use('/api/fiscal',       fiscalRouter);

// ─── Dashboard stats ──────────────────────────────────────────────────────────
app.get('/api/dashboard', requireRole('EMPRESA'), async (req, res, next) => {
  try {
    const hoy   = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const empresaId = req.user?.empresaId || req.user?.id;
    const facturaTenantFilter = {
      OR: [
        { usuarioId: empresaId },
        { usuario: { empresaId } }
      ]
    };

    // Ingresos del mes (suma de pagos en el mes actual) - Normalizados a USD
    const pagosDelMes = await prisma.pago.findMany({
      where: {
        fechaPago: { gte: inicioMes.toISOString() },
        factura: facturaTenantFilter,
      },
      include: { factura: { select: { tasaCambio: true, moneda: true } } }
    });
    
    let ingresosDelMes = new (require('decimal.js').Decimal)(0);
    pagosDelMes.forEach(p => {
      const monto = new (require('decimal.js').Decimal)(p.monto.toString());
      const tasa = new (require('decimal.js').Decimal)(p.factura.tasaCambio.toString());
      if (p.factura.moneda === 'VES' && !tasa.isZero()) {
        ingresosDelMes = ingresosDelMes.add(monto.div(tasa));
      } else {
        ingresosDelMes = ingresosDelMes.add(monto);
      }
    });

    // Facturas vencidas (PENDING o PARTIALLY_PAID con fechaVencimiento < hoy)
    const facturasVencidas = await prisma.factura.count({
      where: {
        estado: { in: ['PENDING', 'PARTIALLY_PAID'] },
        fechaVencimiento: { lt: hoy.toISOString() },
        ...facturaTenantFilter,
      },
    });

    const productos = await prisma.producto.findMany({ where: { activo: true, empresaId } });
    const stockBajoCount = productos.filter(p => p.stockActual <= p.stockMinimo).length;

    // Facturas recientes
    const facturasRecientes = await prisma.factura.findMany({
      where: facturaTenantFilter,
      take: 5,
      orderBy: { fechaEmision: 'desc' },
      include: { cliente: true, _count: { select: { items: true } } },
    });

    // Totales por estado - Normalizados a USD
    const facturasAll = await prisma.factura.findMany({
      where: facturaTenantFilter,
      select: { estado: true, total: true, moneda: true, tasaCambio: true }
    });
    
    const totalesPorEstadoObj = {};
    facturasAll.forEach(f => {
      if (!totalesPorEstadoObj[f.estado]) {
        totalesPorEstadoObj[f.estado] = { _count: { id: 0 }, _sum: { total: new (require('decimal.js').Decimal)(0) } };
      }
      totalesPorEstadoObj[f.estado]._count.id++;
      
      const totalF = new (require('decimal.js').Decimal)(f.total.toString());
      const tasaF = new (require('decimal.js').Decimal)(f.tasaCambio.toString());
      
      if (f.moneda === 'VES' && !tasaF.isZero()) {
        totalesPorEstadoObj[f.estado]._sum.total = totalesPorEstadoObj[f.estado]._sum.total.add(totalF.div(tasaF));
      } else {
        totalesPorEstadoObj[f.estado]._sum.total = totalesPorEstadoObj[f.estado]._sum.total.add(totalF);
      }
    });
    
    const totalesPorEstado = Object.keys(totalesPorEstadoObj).map(estado => ({
      estado,
      _sum: { total: totalesPorEstadoObj[estado]._sum.total.toFixed(2) },
      _count: { id: totalesPorEstadoObj[estado]._count.id }
    }));

    // Ingresos últimos 6 meses (para gráfico) - Normalizados
    const ingresosHistorico = [];
    for (let i = 5; i >= 0; i--) {
      const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const fechaFin    = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 0, 23, 59, 59);
      const pagosHist   = await prisma.pago.findMany({
        where: {
          fechaPago: { gte: fechaInicio.toISOString(), lte: fechaFin.toISOString() },
          factura: facturaTenantFilter,
        },
        include: { factura: { select: { tasaCambio: true, moneda: true } } }
      });
      
      let sumMes = new (require('decimal.js').Decimal)(0);
      pagosHist.forEach(p => {
        const monto = new (require('decimal.js').Decimal)(p.monto.toString());
        const tasa = new (require('decimal.js').Decimal)(p.factura.tasaCambio.toString());
        if (p.factura.moneda === 'VES' && !tasa.isZero()) {
          sumMes = sumMes.add(monto.div(tasa));
        } else {
          sumMes = sumMes.add(monto);
        }
      });
      
      ingresosHistorico.push({
        mes: fechaInicio.toLocaleString('es-VE', { month: 'short', year: 'numeric' }),
        total: sumMes.toFixed(2),
      });
    }

    res.json({
      ingresosDelMes: ingresosDelMes.toFixed(2),
      facturasVencidas,
      productosStockBajo: stockBajoCount,
      facturasRecientes,
      totalesPorEstado,
      ingresosHistorico,
    });
  } catch (err) {
    next(err);
  }
});


// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Serve Frontend (Electron / Production mode) ─────────────────────────────
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA catch-all: serve index.html for any non-API route
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
  console.log(`   Static frontend: ${frontendDist}`);
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   API base: http://localhost:${PORT}/api\n`);
});

module.exports = { app, prisma };
