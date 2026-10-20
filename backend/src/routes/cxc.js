const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Prisma } = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { requireRole } = require('../middleware/auth');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { tasaCambioEfectiva, pagoCxcAUsd } = require('../utils/tasaAPI');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaBCVPorFecha } = require('../utils/bcvHistorico');
const { toDecimalSeguro } = require('../utils/decimal');
const { lockFactura, lockCuenta } = require('../utils/locks');

// Roles: EMPRESA ve todo, CAJA ve solo lo suyo
router.use(requireRole('EMPRESA', 'CAJA'));

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
// Sube por el Usuario padre para obtener el Empresa real: las sub-cuentas CAJA
// tienen empresaRefId=NULL y `cuentas_por_cobrar.empresaId` exige un id de
// `empresas`, no de `usuarios`.
const getEmpresaRefId = (req) => resolverEmpresaRefId(req);

// Helper: filtro de tenant según rol
const cxcTenantFilter = (req) => {
  const empresaId = getEmpresaId(req);
  if (req.user.rol === 'CAJA') {
    return { usuarioId: req.user.id };
  }
  return {
    OR: [
      { usuarioId: empresaId },
      { usuario: { empresaId } }
    ]
  };
};

// CuentaPorCobrar SIEMPRE almacena montos en USD (ver POST /api/facturas).
// Normaliza cualquier pago (USD o VES) a USD. La implementación vive en la
// fachada única (`paymentCurrency.pagoCxcAUsd`) que también usa /api/pagos: si
// cada módulo tuviera su copia, el saldo escrito por una puerta no coincidiría
// con el leído por la otra.
const pagoAUsd = pagoCxcAUsd;

// Traduce `cxcTenantFilter` a SQL para las consultas crudas del resumen.
// Debe mantenerse en espejo con esa función: si divergen, los totales y el
// aging cuentan conjuntos distintos y el resumen se contradice.
const buildCxcTenantSql = (tenantFilter) => {
  if (tenantFilter.usuarioId) {
    return Prisma.sql`c."usuarioId" = ${tenantFilter.usuarioId}`;
  }
  if (tenantFilter.OR?.length) {
    const condiciones = [];
    for (const cond of tenantFilter.OR) {
      if (cond.usuarioId) {
        condiciones.push(Prisma.sql`c."usuarioId" = ${cond.usuarioId}`);
      }
      if (cond.usuario?.empresaId) {
        condiciones.push(Prisma.sql`c."usuarioId" IN (SELECT id FROM usuarios WHERE "empresaId" = ${cond.usuario.empresaId})`);
      }
    }
    if (condiciones.length) return Prisma.sql`(${Prisma.join(condiciones, ' OR ')})`;
  }
  return Prisma.sql`TRUE`;
};

// ─── GET /api/cxc/resumen ──────────────────────────────────────────────────────
router.get('/resumen', async (req, res, next) => {
  try {
    const tenantFilter = cxcTenantFilter(req);
    const hoy = new Date();

    const [
      totalPendiente,
      totalVencido,
      porEstado,
      aging
    ] = await Promise.all([
      // Total pendiente global
      prisma.cuentaPorCobrar.aggregate({
        where: { ...tenantFilter, estado: { in: ['PENDING', 'PARTIALLY_PAID'] } },
        _sum: { montoPendiente: true },
        _count: true
      }),

      // Total vencido
      prisma.cuentaPorCobrar.aggregate({
        where: {
          ...tenantFilter,
          estado: { in: ['PENDING', 'PARTIALLY_PAID'] },
          fechaVencimiento: { lt: hoy.toISOString() }
        },
        _sum: { montoPendiente: true },
        _count: true
      }),

      // Por estado
      prisma.cuentaPorCobrar.groupBy({
        by: ['estado'],
        where: tenantFilter,
        _sum: { montoPendiente: true },
        _count: true
      }),

      // Aging: calculated on-the-fly from fechaVencimiento (not stored diasVencido)
      prisma.$queryRaw`
        SELECT
          COALESCE(SUM(CASE
            WHEN c."fechaVencimiento" >= NOW() AND c."estado" IN ('PENDING', 'PARTIALLY_PAID')
            THEN c."montoPendiente" ELSE 0 END), 0) AS "0_30",
          COALESCE(SUM(CASE
            WHEN c."fechaVencimiento" < NOW() AND c."fechaVencimiento" >= NOW() - INTERVAL '30 days' AND c."estado" IN ('PENDING', 'PARTIALLY_PAID')
            THEN c."montoPendiente" ELSE 0 END), 0) AS "31_60",
          COALESCE(SUM(CASE
            WHEN c."fechaVencimiento" < NOW() - INTERVAL '30 days' AND c."fechaVencimiento" >= NOW() - INTERVAL '60 days' AND c."estado" IN ('PENDING', 'PARTIALLY_PAID')
            THEN c."montoPendiente" ELSE 0 END), 0) AS "61_90",
          COALESCE(SUM(CASE
            WHEN c."fechaVencimiento" < NOW() - INTERVAL '60 days' AND c."estado" IN ('PENDING', 'PARTIALLY_PAID')
            THEN c."montoPendiente" ELSE 0 END), 0) AS "90plus"
        FROM "cuentas_por_cobrar" c
        WHERE ${buildCxcTenantSql(tenantFilter)}
          AND c."estado" IN ('PENDING', 'PARTIALLY_PAID')
      `
    ]);

    res.json({
      totalPendiente: new Decimal(totalPendiente._sum.montoPendiente || 0).toFixed(2),
      cantidadPendientes: totalPendiente._count,
      totalVencido: new Decimal(totalVencido._sum.montoPendiente || 0).toFixed(2),
      cantidadVencidas: totalVencido._count,
      porEstado: porEstado.map(r => ({
        estado: r.estado,
        monto: new Decimal(r._sum.montoPendiente || 0).toFixed(2),
        cantidad: r._count
      })),
      aging: {
        '0_30': new Decimal(aging[0]?.['0_30'] || 0).toFixed(2),
        '31_60': new Decimal(aging[0]?.['31_60'] || 0).toFixed(2),
        '61_90': new Decimal(aging[0]?.['61_90'] || 0).toFixed(2),
        '90plus': new Decimal(aging[0]?.['90plus'] || 0).toFixed(2),
      }
    });
  } catch (err) { next(err); }
});

// Orden configurable del listado de CxC.
//   vencimiento (default) → fecha de vencimiento más reciente primero
//   cliente               → orden alfabético por razón social
//   monto                 → monto pendiente de mayor a menor
const ORDENES_CXC = {
  vencimiento: { fechaVencimiento: 'desc' },
  cliente: { cliente: { razonSocial: 'asc' } },
  monto: { montoPendiente: 'desc' },
};
const ordenCxc = (orden) => ORDENES_CXC[orden] || ORDENES_CXC.vencimiento;

// Orden por estado: el orderBy de Prisma no admite un orden personalizado, así
// que se resuelve con un rango explícito — por pagar primero, abonadas segundo
// y pagadas de último.
const RANGO_ESTADO = { PENDING: 0, PARTIALLY_PAID: 1, PAID: 2 };
const rangoEstado = (estado) => RANGO_ESTADO[estado] ?? 99;
const esOrdenEstado = (orden) => orden === 'estado';

const INCLUDE_CXC_LISTA = {
  cliente: { select: { id: true, razonSocial: true, rifCedula: true, telefono: true, correo: true } },
  factura: { select: { id: true, numeroFactura: true, fechaEmision: true, moneda: true, tasaCambio: true } },
  usuario: { select: { id: true, username: true, nombre: true } },
  _count: { select: { gestions: true } }
};

// ─── GET /api/cxc ──────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { q, estado, vencidas, clienteId, orden } = req.query;
    // `paginate` normaliza page/limit (clamp) en vez de `parseInt` sin validar,
    // que permitía negativos y terminaba en 500 al consultar.
    const { skip, take, page, limit } = paginate(req.query, { limit: 25 });
    const tenantFilter = cxcTenantFilter(req);
    const hoy = new Date();

    let where = { ...tenantFilter };

    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = clienteId;
    if (vencidas === 'true') {
      where.estado = { in: ['PENDING', 'PARTIALLY_PAID'] };
      where.fechaVencimiento = { lt: hoy.toISOString() };
    }
    if (q) {
      const terms = q.trim().split(/\s+/).filter(Boolean);
      where.AND = terms.map(term => ({
        OR: [
          { cliente: { razonSocial: { contains: term, mode: 'insensitive' } } },
          { cliente: { rifCedula: { contains: term, mode: 'insensitive' } } },
          { factura: { numeroFactura: { equals: parseInt(term) || 0 } } }
        ]
      }));
    }

    const total = await prisma.cuentaPorCobrar.count({ where });

    let cuentas;
    if (esOrdenEstado(orden)) {
      // Prisma no ordena por un rango personalizado: se traen los ids con su
      // estado y se ordena en memoria antes de paginar.
      const filas = await prisma.cuentaPorCobrar.findMany({
        where,
        select: { id: true, estado: true, fechaVencimiento: true },
      });
      filas.sort((a, b) => {
        const d = rangoEstado(a.estado) - rangoEstado(b.estado);
        return d !== 0 ? d : new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento);
      });
      const idsPagina = filas.slice(skip, skip + take).map((f) => f.id);
      const encontradas = await prisma.cuentaPorCobrar.findMany({
        where: { id: { in: idsPagina } },
        include: INCLUDE_CXC_LISTA,
      });
      const porId = new Map(encontradas.map((c) => [c.id, c]));
      cuentas = idsPagina.map((id) => porId.get(id)).filter(Boolean);
    } else {
      cuentas = await prisma.cuentaPorCobrar.findMany({
        where,
        skip,
        take,
        orderBy: ordenCxc(orden),
        include: INCLUDE_CXC_LISTA,
      });
    }

    // Calcular días vencidos en cada cuenta
    const cuentasConDias = cuentas.map(c => {
      const venc = new Date(c.fechaVencimiento);
      const dias = Math.ceil((hoy - venc) / (1000 * 60 * 60 * 24));
      return {
        ...c,
        diasVencido: dias,
        montoPendiente: new Decimal(c.montoPendiente.toString()).toFixed(2),
        montoOriginal: new Decimal(c.montoOriginal.toString()).toFixed(2),
        montoCobrado: new Decimal(c.montoCobrado.toString()).toFixed(2)
      };
    });

    res.json(paginatedResponse(cuentasConDias, total, page, limit));
  } catch (err) { next(err); }
});

// ─── GET /api/cxc/cliente/:clienteId ───────────────────────────────────────────
router.get('/cliente/:clienteId', async (req, res, next) => {
  try {
    const tenantFilter = cxcTenantFilter(req);
    const hoy = new Date();

    const cuentas = await prisma.cuentaPorCobrar.findMany({
      where: { ...tenantFilter, clienteId: req.params.clienteId },
      orderBy: { fechaVencimiento: 'asc' },
      include: {
        factura: { select: { id: true, numeroFactura: true, fechaEmision: true, moneda: true, tasaCambio: true } },
        _count: { select: { gestions: true } }
      }
    });

    const cuentasConDias = cuentas.map(c => {
      const venc = new Date(c.fechaVencimiento);
      const dias = Math.ceil((hoy - venc) / (1000 * 60 * 60 * 24));
      return {
        ...c,
        diasVencido: dias,
        montoPendiente: new Decimal(c.montoPendiente.toString()).toFixed(2),
        montoOriginal: new Decimal(c.montoOriginal.toString()).toFixed(2),
        montoCobrado: new Decimal(c.montoCobrado.toString()).toFixed(2)
      };
    });

    const totalPendiente = cuentasConDias
      .filter(c => ['PENDING', 'PARTIALLY_PAID'].includes(c.estado))
      .reduce((acc, c) => acc.add(new Decimal(c.montoPendiente)), new Decimal(0));

    res.json({ data: cuentasConDias, totalPendiente: totalPendiente.toFixed(2) });
  } catch (err) { next(err); }
});

// ─── GET /api/cxc/export — Exportar reporte de CxC (CSV) ────────────────────────
// Debe declararse ANTES de `GET /:id`: Express casa en orden de registro y, si
// `/:id` va primero, "export" se interpreta como un id y la exportación muere
// con 404.
router.get('/export', async (req, res, next) => {
  try {
    const tenantFilter = cxcTenantFilter(req);
    const { estado, vencidas, clienteId, orden } = req.query;
    const hoy = new Date();

    let where = { ...tenantFilter };
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = clienteId;
    if (vencidas === 'true') {
      where.estado = { in: ['PENDING', 'PARTIALLY_PAID'] };
      where.fechaVencimiento = { lt: hoy.toISOString() };
    }

    const cuentas = await prisma.cuentaPorCobrar.findMany({
      where,
      orderBy: esOrdenEstado(orden) ? undefined : ordenCxc(orden),
      include: {
        cliente: { select: { razonSocial: true, rifCedula: true, telefono: true, correo: true } },
        factura: { select: { numeroFactura: true, fechaEmision: true, moneda: true } },
        usuario: { select: { username: true, nombre: true } }
      }
    });

    if (esOrdenEstado(orden)) {
      cuentas.sort((a, b) => {
        const d = rangoEstado(a.estado) - rangoEstado(b.estado);
        return d !== 0 ? d : new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento);
      });
    }

    // Build CSV
    const headers = ['Factura', 'Cliente', 'RIF/Cedula', 'Contacto', 'Emision', 'Vencimiento', 'Dias Vencido', 'Monto Original', 'Monto Cobrado', 'Monto Pendiente', 'Estado', 'Cajero', 'Ultima Gestion'];
    const rows = cuentas.map(c => {
      const venc = new Date(c.fechaVencimiento);
      const dias = Math.ceil((hoy - venc) / (1000 * 60 * 60 * 24));
      const fechaLim = c.ultimaGestion ? new Date(c.ultimaGestion).toISOString().split('T')[0] : '';
      return [
        c.factura?.numeroFactura || '',
        c.cliente?.razonSocial || '',
        c.cliente?.rifCedula || '',
        c.cliente?.telefono || c.cliente?.correo || '',
        new Date(c.fechaEmision).toISOString().split('T')[0],
        new Date(c.fechaVencimiento).toISOString().split('T')[0],
        dias > 0 ? dias : 0,
        new Decimal(c.montoOriginal.toString()).toFixed(2),
        new Decimal(c.montoCobrado.toString()).toFixed(2),
        new Decimal(c.montoPendiente.toString()).toFixed(2),
        c.estado,
        c.usuario?.nombre || c.usuario?.username || '',
        fechaLim
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=cxc_report_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) { next(err); }
});

// ─── GET /api/cxc/:id ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const tenantFilter = cxcTenantFilter(req);
    const cuenta = await prisma.cuentaPorCobrar.findFirst({
      where: { id: req.params.id, ...tenantFilter },
      include: {
        cliente: true,
        factura: {
          select: {
            id: true, numeroFactura: true, fechaEmision: true, fechaVencimiento: true,
            subtotal: true, impuestoTotal: true, total: true, estado: true,
            moneda: true, tasaCambio: true, observaciones: true,
            items: { select: { descripcionHistorica: true, cantidad: true, precioUnitarioHistorico: true, totalLinea: true } },
            pagos: { orderBy: { fechaPago: 'asc' }, select: { id: true, monto: true, monedaPago: true, metodoPago: true, referenciaTransaccion: true, fechaPago: true, notas: true, tasaBCV: true } }
          }
        },
        usuario: { select: { id: true, username: true, nombre: true } },
        gestions: {
          orderBy: { fecha: 'desc' },
          include: { usuario: { select: { id: true, username: true, nombre: true } } }
        }
      }
    });

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta por cobrar no encontrada' });
    }

    // Calcular días vencido
    const hoy = new Date();
    const venc = new Date(cuenta.fechaVencimiento);
    const diasVencido = Math.ceil((hoy - venc) / (1000 * 60 * 60 * 24));

    // Calcular pagos totales. La conversión usa la tasa por empresa para que el
    // detalle coincida con lo que se cobró, no con la tasa global.
    const factura = cuenta.factura;
    const empresaRefIdDetalle = await getEmpresaRefId(req);
    let totalPagado = new Decimal(0);
    for (const pago of factura.pagos) {
      totalPagado = totalPagado.add(await pagoAUsd(pago, factura, empresaRefIdDetalle));
    }
    const tasaUsada = await tasaCambioEfectiva(factura, empresaRefIdDetalle);

    res.json({
      ...cuenta,
      diasVencido,
      // Tasa efectiva que el backend aplica para convertir Bs→USD en esta
      // cuenta. El frontend la usa solo para mostrar, nunca para decidir.
      tasaConversion: {
        tasa: tasaUsada.toNumber(),
        monedaFactura: factura.moneda || 'USD',
        tasaDeFactura: factura.moneda === 'VES' ? Number(factura.tasaCambio) : null,
      },
      montoPendiente: new Decimal(cuenta.montoPendiente.toString()).toFixed(2),
      montoOriginal: new Decimal(cuenta.montoOriginal.toString()).toFixed(2),
      montoCobrado: new Decimal(cuenta.montoCobrado.toString()).toFixed(2),
      factura: {
        ...factura,
        total: new Decimal(factura.total.toString()).toFixed(2),
        subtotal: new Decimal(factura.subtotal.toString()).toFixed(2),
        impuestoTotal: new Decimal(factura.impuestoTotal.toString()).toFixed(2),
        totalPagado: totalPagado.toFixed(2)
      }
    });
  } catch (err) { next(err); }
});

// ─── GET /api/cxc/:id/conversion — Cotiza un abono sin cobrarlo ────────────────
// El frontend NO convierte montos: pregunta cuánto valdría un abono en Bs y
// devuelve el equivalente y la tasa que el backend aplicaría realmente.
// Evita que la tasa del cliente (empresa.tasaDolar del login) difiera de la del
// servidor y provoque recálculos contradictorios.
router.get('/:id/conversion', async (req, res, next) => {
  try {
    const { monto, moneda = 'USD' } = req.query;

    if (!['USD', 'VES'].includes(moneda)) {
      return res.status(400).json({ error: 'Moneda inválida. Valores permitidos: USD, VES' });
    }

    const cuenta = await prisma.cuentaPorCobrar.findFirst({
      where: { id: req.params.id, ...cxcTenantFilter(req) },
      select: { montoPendiente: true, factura: { select: { moneda: true, tasaCambio: true } } },
    });
    if (!cuenta) return res.status(404).json({ error: 'Cuenta por cobrar no encontrada' });

    const empresaRefIdConv = await getEmpresaRefId(req);
    const tasaUsada = await tasaCambioEfectiva(cuenta.factura, empresaRefIdConv);
    const pendienteUSD = new Decimal(cuenta.montoPendiente.toString());

    // Tope aceptable en la moneda consultada, para que el frontend ofrezca un
    // monto por defecto que nunca dispare el error de sobrepago.
    const maximoEnMoneda = moneda === 'VES'
      ? pendienteUSD.mul(tasaUsada)
      : pendienteUSD;

    const respuesta = {
      cuentaId: req.params.id,
      moneda,
      pendienteUsd: pendienteUSD.toFixed(2),
      tasaUsada: tasaUsada.toNumber(),
      tasaDeFactura: cuenta.factura.moneda === 'VES' ? Number(cuenta.factura.tasaCambio) : null,
      maximoAceptable: maximoEnMoneda.toDecimalPlaces(2).toFixed(2),
    };

    // El monto es opcional: sin él solo devuelve tasa y máximo para la moneda.
    if (monto !== undefined && monto !== null && monto !== '') {
      const montoRaw = toDecimalSeguro(monto, NaN);
      if (!montoRaw.isFinite() || montoRaw.lte(0)) {
        return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
      }
      const montoUSD = await pagoAUsd({ monto: montoRaw, monedaPago: moneda }, cuenta.factura, empresaRefIdConv);
      respuesta.montoUsd = montoUSD.toFixed(4);
      respuesta.excedePendiente = montoUSD.gt(pendienteUSD.plus(new Decimal('0.005')));
      // Tope de lo que se aplicaría realmente (colapsa el excedente de redondeo).
      respuesta.usdAplicable = (montoUSD.gt(pendienteUSD) ? pendienteUSD : montoUSD).toFixed(2);
    }

    res.json(respuesta);
  } catch (err) { next(err); }
});

// ─── POST /api/cxc/:id/pago — Registrar abono o completar pago ─────────────────
router.post('/:id/pago', async (req, res, next) => {
  try {
    const { monto, metodoPago, monedaPago, referenciaTransaccion, fechaPago, notas } = req.body;
    const tenantFilter = cxcTenantFilter(req);

    // Validaciones básicas
    if (!monto) throw createValidationError('El monto es obligatorio');
    // NaN como default: un valor no numérico ("abc") es un 422, no un 500.
    const montoPagoRaw = toDecimalSeguro(monto, NaN);
    if (!montoPagoRaw.isFinite() || montoPagoRaw.lte(0)) throw createValidationError('El monto debe ser mayor a 0');

    if (!metodoPago || !['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT', 'PAGO_MOVIL'].includes(metodoPago)) {
      throw createValidationError('Método de pago inválido');
    }
    if (metodoPago !== 'CASH' && !referenciaTransaccion?.trim()) {
      throw createValidationError('La referencia es obligatoria para pagos electrónicos');
    }

    const empresaRefIdPago = await getEmpresaRefId(req);

    // Tasa BCV del día del abono, resuelta fuera de la transacción para no
    // bloquear filas mientras se espera la API externa.
    const fechaPagoFinal = fechaPago && !isNaN(new Date(fechaPago).getTime())
      ? new Date(fechaPago)
      : new Date();
    let tasaBCV = null;
    try {
      tasaBCV = await tasaBCVPorFecha(fechaPagoFinal);
    } catch (err) {
      console.warn('[cxc] No se pudo obtener la tasa BCV:', err.message);
    }

    const { pago, cuentaActualizada, conversion } = await prisma.$transaction(async (tx) => {
      // Bloqueo en el mismo orden que /api/pagos (factura → cuenta) para que dos
      // abonos concurrentes sobre la misma cuenta no lean el mismo pendiente.
      const cuentaRef = await tx.cuentaPorCobrar.findFirst({
        where: { id: req.params.id, ...tenantFilter },
        select: { id: true, facturaId: true },
      });
      if (!cuentaRef) throw createValidationError('Cuenta por cobrar no encontrada');

      await lockFactura(tx, cuentaRef.facturaId);
      await lockCuenta(tx, cuentaRef.id);

      // Relectura dentro de la transacción: los montos deben ser los frescos.
      const cuenta = await tx.cuentaPorCobrar.findUniqueOrThrow({
        where: { id: cuentaRef.id },
        include: { factura: true },
      });

      if (cuenta.estado === 'PAID') throw createBusinessError('Esta cuenta ya está completamente pagada');

      const factura = cuenta.factura;
      const monedaFactura = factura.moneda || 'USD';

      // Normalizar monto del pago a USD para validación y almacenamiento.
      // CuentaPorCobrar siempre guarda montos en USD, así que la tasa debe ser la
      // efectiva VES→USD: la de la factura si fue emitida en VES, o la tasa
      // vigente del sistema si fue emitida en USD (tasaCambio=1 no sirve).
      const monedaDelPago = monedaPago || monedaFactura;
      if (!['USD', 'VES'].includes(monedaDelPago)) {
        throw createValidationError('Moneda de pago inválida. Valores permitidos: USD, VES');
      }
      const tasaUsada = await tasaCambioEfectiva(factura, empresaRefIdPago);
      const montoPagoUSD = await pagoAUsd({ monto: montoPagoRaw, monedaPago: monedaDelPago }, factura, empresaRefIdPago);
      const pendienteUSD = new Decimal(cuenta.montoPendiente.toString());

      // Convertir un abono en Bs a USD puede dejar un excedente de redondeo mínimo
      // (p. ej. 10 Bs = 0.0116 USD contra 0.01 USD de pendiente). Si el pago no
      // supera el pendiente por más de medio centavo, se acepta y se aplica solo lo
      // necesario para saldar la cuenta.
      const TOLERANCIA_REDONDEO = new Decimal('0.005');
      if (montoPagoUSD.gt(pendienteUSD.plus(TOLERANCIA_REDONDEO))) {
        // Se informa en ambas monedas para que el usuario vea la conversión que
        // el servidor aplicó, no la que él calculó.
        throw createBusinessError(
          `El monto (${montoPagoRaw.toFixed(2)} ${monedaDelPago}` +
          (monedaDelPago === 'VES' ? ` = ${montoPagoUSD.toFixed(4)} USD` : '') +
          `) excede el pendiente (${pendienteUSD.toFixed(2)} USD)`
        );
      }
      const montoAplicarUSD = montoPagoUSD.gt(pendienteUSD) ? pendienteUSD : montoPagoUSD;

      // Crear pago (guarda monto original en su moneda)
      const nuevoPago = await tx.pago.create({
        data: {
          facturaId: factura.id,
          monto: montoPagoRaw.toFixed(2),
          monedaPago: monedaDelPago,
          metodoPago,
          referenciaTransaccion: metodoPago === 'CASH' ? null : referenciaTransaccion?.trim(),
          fechaPago: fechaPagoFinal.toISOString(),
          tasaBCV: tasaBCV ? tasaBCV.toFixed(4) : null,
          notas: notas?.trim() || `Abono desde CxC por ${req.user.nombre || req.user.username}`
        }
      });

      // Actualizar CuentaPorCobrar (usa monto normalizado a USD, con tope al pendiente)
      const nuevoMontoCobrado = new Decimal(cuenta.montoCobrado.toString()).add(montoAplicarUSD);
      const nuevoPendiente = new Decimal(cuenta.montoOriginal.toString()).sub(nuevoMontoCobrado);

      let nuevoEstado;
      if (nuevoPendiente.lte(0)) nuevoEstado = 'PAID';
      else if (nuevoMontoCobrado.gt(0)) nuevoEstado = 'PARTIALLY_PAID';
      else nuevoEstado = 'PENDING';

      const cxcUpd = await tx.cuentaPorCobrar.update({
        where: { id: cuenta.id },
        data: {
          montoCobrado: nuevoMontoCobrado.toFixed(2),
          montoPendiente: nuevoPendiente.gt(0) ? nuevoPendiente.toFixed(2) : '0.00',
          estado: nuevoEstado,
          ultimaGestion: new Date().toISOString()
        }
      });

      // Actualizar estado de factura
      await tx.factura.update({
        where: { id: factura.id },
        data: { estado: nuevoEstado }
      });

      return {
        pago: nuevoPago,
        cuentaActualizada: cxcUpd,
        conversion: {
          monedaDelPago,
          montoPagoUSD,
          montoAplicarUSD,
          tasaUsada,
          monedaFactura: factura.moneda,
          tasaDeFactura: factura.tasaCambio,
        },
      };
    });

    res.status(201).json({
      pago,
      // Conversión realmente aplicada. Permite que el frontend muestre el
      // equivalente sin recalcularlo (y por tanto sin divergir del backend).
      conversion: {
        montoIngresado: montoPagoRaw.toFixed(2),
        monedaIngresada: conversion.monedaDelPago,
        montoUsd: conversion.montoPagoUSD.toFixed(4),
        montoUsdAplicado: conversion.montoAplicarUSD.toFixed(2),
        tasaUsada: conversion.tasaUsada.toNumber(),
        tasaDeFactura: conversion.monedaFactura === 'VES' ? Number(conversion.tasaDeFactura) : null,
      },
      cuenta: {
        ...cuentaActualizada,
        montoPendiente: new Decimal(cuentaActualizada.montoPendiente.toString()).toFixed(2),
        montoCobrado: new Decimal(cuentaActualizada.montoCobrado.toString()).toFixed(2),
        montoOriginal: new Decimal(cuentaActualizada.montoOriginal.toString()).toFixed(2)
      }
    });
  } catch (err) { next(err); }
});

// ─── POST /api/cxc/:id/gestion — Registrar gestión de cobranza ────────────────
router.post('/:id/gestion', async (req, res, next) => {
  try {
    const { accion, notas } = req.body;
    const tenantFilter = cxcTenantFilter(req);
    const ACCIONES_VALIDAS = ['LLAMADA', 'CORREO', 'WHATSAPP', 'VISITA', 'OTRO'];

    if (!accion || !ACCIONES_VALIDAS.includes(accion)) {
      throw createValidationError('Acción inválida. Debe ser: ' + ACCIONES_VALIDAS.join(', '));
    }
    if (!notas?.trim()) throw createValidationError('Las notas son obligatorias');

    const cuenta = await prisma.cuentaPorCobrar.findFirst({
      where: { id: req.params.id, ...tenantFilter }
    });
    if (!cuenta) throw createValidationError('Cuenta por cobrar no encontrada');

    const gestion = await prisma.$transaction(async (tx) => {
      const nuevaGestion = await tx.gestionCobranza.create({
        data: {
          cuentaPorCobrarId: cuenta.id,
          empresaId: await getEmpresaRefId(req) || getEmpresaId(req),
          usuarioId: req.user.id,
          accion,
          notas: notas.trim()
        },
        include: { usuario: { select: { id: true, username: true, nombre: true } } }
      });

      // Actualizar última gestión en la cuenta
      await tx.cuentaPorCobrar.update({
        where: { id: cuenta.id },
        data: { ultimaGestion: new Date().toISOString() }
      });

      return nuevaGestion;
    });

    res.status(201).json(gestion);
  } catch (err) { next(err); }
});

module.exports = router;