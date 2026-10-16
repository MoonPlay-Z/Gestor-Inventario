import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useRole } from '../components/ui/RoleGuard';
import { getErrorMessage } from '../utils/validation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Iconos
import refreshIcon from '@iconify/icons-mdi/refresh';
import cashIcon from '@iconify/icons-mdi/cash';
import receiptIcon from '@iconify/icons-mdi/file-document-outline';
import trendUpIcon from '@iconify/icons-mdi/trending-up';
import trendDownIcon from '@iconify/icons-mdi/trending-down';
import chartBarIcon from '@iconify/icons-mdi/chart-bar';
import chartLineIcon from '@iconify/icons-mdi/chart-line';
import chartPieIcon from '@iconify/icons-mdi/chart-pie';
import calendarIcon from '@iconify/icons-mdi/calendar';
import compareIcon from '@iconify/icons-mdi/swap-vertical';
import alertIcon from '@iconify/icons-mdi/alert-circle';
import pdfIcon from '@iconify/icons-mdi/file-pdf-box';
import csvIcon from '@iconify/icons-mdi/file-delimited';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Agrupa cantidades por unidad: sumar kilogramos con unidades daría un total
// sin significado físico.
const desgloseUnidadesPorProducto = (productos) => {
  if (!productos?.length) return '—';
  const porUnidad = {};
  for (const p of productos) {
    const u = p.unidad || '—';
    porUnidad[u] = (porUnidad[u] || 0) + (parseFloat(p.cantidadVendida) || 0);
  }
  return Object.entries(porUnidad)
    .map(([u, v]) => `${v.toFixed(2)} ${u}`)
    .join(' + ');
};

// El detalle por factura llega paginado con tope de 200 por página. Una
// exportación que solo pida la primera mostraría una fracción del período
// sin avisar, así que se recorren todas las páginas.
const LIMIT_DETALLE = 200;
const cargarDetalleCompleto = async (periodo, fecha) => {
  const primera = await API.getReportesVentasDetalle(
    new URLSearchParams({ periodo, fecha, page: '1', limit: String(LIMIT_DETALLE) })
  );
  const paginas = primera?.paginacion?.totalPages || 1;
  if (paginas <= 1) return primera;
  const resto = await Promise.all(
    Array.from({ length: paginas - 1 }, (_, i) =>
      API.getReportesVentasDetalle(
        new URLSearchParams({ periodo, fecha, page: String(i + 2), limit: String(LIMIT_DETALLE) })
      )
    )
  );
  return {
    ...primera,
    detalle: [...(primera.detalle || []), ...resto.flatMap(r => r.detalle || [])],
  };
};

// Igual para productos y clientes, que el backend pagina con tope de 100.
const cargarListadoCompleto = async (fn, periodo, fecha) => {
  const primera = await fn(new URLSearchParams({ periodo, fecha, page: '1', limit: '100' }));
  const paginas = primera?.totalPages || 1;
  if (paginas <= 1) return primera?.data || [];
  const resto = await Promise.all(
    Array.from({ length: paginas - 1 }, (_, i) =>
      fn(new URLSearchParams({ periodo, fecha, page: String(i + 2), limit: '100' }))
    )
  );
  return [...(primera.data || []), ...resto.flatMap(r => r.data || [])];
};

// Anchos de columna del PDF. jsPDF trabaja en milímetros y, en A4 horizontal,
// el ancho útil de una tabla es 269: si la suma de los anchos no da 269 la
// tabla deja espacio en blanco (y jspdf-autotable avisa por consola, aunque no
// haya recorte real). Todas las sumas de abajo dan 269.
const ANCHOS_PRODUCTOS = {
  0: { cellWidth: 62 },
  1: { cellWidth: 44 },
  2: { cellWidth: 27 },
  3: { cellWidth: 30, halign: 'right' },
  4: { cellWidth: 34, halign: 'right' },
  5: { cellWidth: 34, halign: 'right' },
  6: { cellWidth: 38, halign: 'right' },
};
const ANCHOS_DETALLE = {
  0: { cellWidth: 22 },
  1: { cellWidth: 40 },
  2: { cellWidth: 62 },
  3: { cellWidth: 46 },
  4: { cellWidth: 48, halign: 'right' },
  5: { cellWidth: 51, halign: 'right' },
};
const ANCHOS_PERDIDAS = {
  0: { cellWidth: 22 },
  1: { cellWidth: 44 },
  2: { cellWidth: 50 },
  3: { cellWidth: 62 },
  4: { cellWidth: 26 },
  5: { cellWidth: 33, halign: 'right' },
  6: { cellWidth: 32, halign: 'right' },
};

export function ReportesPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const { rol } = useRole();

  // Estado de filtros
  const [periodo, setPeriodo] = useState('mensual');
  const [fecha, setFecha] = useState(() => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  });
  const [comparar, setComparar] = useState(true);

  // Estado de datos
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState(null);
  const [ganancias, setGanancias] = useState(null);
  const [inversion, setInversion] = useState(null);
  const [caja, setCaja] = useState(null);
  const [impuestos, setImpuestos] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [errors, setErrors] = useState({});

  // Estado de paginación
  const [paginaPerdidas, setPaginaPerdidas] = useState(1);
  const [paginaGananciaProducto, setPaginaGananciaProducto] = useState(1);
  const [paginaProductosTop, setPaginaProductosTop] = useState(1);
  const [paginaClientesTop, setPaginaClientesTop] = useState(1);
  const POR_PAGINA = 10;
  // Productos y clientes se paginan en el backend; guardan {data, total, totalPages}
  const [topProductos, setTopProductos] = useState({ data: [], total: 0, totalPages: 1 });
  const [topClientes, setTopClientes] = useState({ data: [], total: 0, totalPages: 1 });

  const puedeVerGanancias = rol === 'EMPRESA' || rol === 'SUPER_ADMIN';
  const puedeVerInversion = rol === 'EMPRESA' || rol === 'SUPER_ADMIN';

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrors({});
    try {
      const config = await API.getConfig();
      if (config?.moneda?.simbolo) {
        setCurrencySymbol(config.moneda.simbolo);
      }

      const params = new URLSearchParams({ periodo, fecha, comparar: comparar.toString() });

      // Cargar datos en paralelo con manejo de errores individual
      const promises = [
        API.getReportesVentas(params)
          .then(setVentas)
          .catch(err => {
            const errorMessage = getErrorMessage(err, 'Error cargando ventas');
            setErrors(prev => ({ ...prev, ventas: errorMessage }));
            setVentas(null);
          }),
        API.getReportesCaja(params)
          .then(setCaja)
          .catch(err => {
            const errorMessage = getErrorMessage(err, 'Error cargando caja');
            setErrors(prev => ({ ...prev, caja: errorMessage }));
            setCaja(null);
          }),
      ];

      if (rol === 'EMPRESA' || rol === 'SUPER_ADMIN') {
        promises.push(
          API.getReportesGanancias(params)
            .then(setGanancias)
            .catch(err => {
              const errorMessage = getErrorMessage(err, 'Error cargando ganancias');
              setErrors(prev => ({ ...prev, ganancias: errorMessage }));
              setGanancias(null);
            })
        );
        promises.push(
          API.getReportesInversion()
            .then(setInversion)
            .catch(err => {
              const errorMessage = getErrorMessage(err, 'Error cargando inversión');
              setErrors(prev => ({ ...prev, inversion: errorMessage }));
              setInversion(null);
            })
        );
        promises.push(
          API.getReportesImpuestos(params)
            .then(setImpuestos)
            .catch(err => {
              const errorMessage = getErrorMessage(err, 'Error cargando impuestos');
              setErrors(prev => ({ ...prev, impuestos: errorMessage }));
              setImpuestos(null);
            })
        );
      }

      await Promise.all(promises);
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Error cargando reportes');
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [periodo, fecha, comparar, rol, showToast]);

  // Productos y clientes se cargan por separado: al cambiar de página solo se
  // recarga esa tabla, sin repetir los 5 reportes pesados.
  const loadTopProductos = useCallback(async (pagina) => {
    try {
      const params = new URLSearchParams({
        periodo, fecha, page: String(pagina), limit: String(POR_PAGINA),
      });
      const data = await API.getReportesProductosTop(params);
      setTopProductos({
        data: data?.data || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, productosTop: getErrorMessage(err, 'Error cargando productos top') }));
      setTopProductos({ data: [], total: 0, totalPages: 1 });
    }
  }, [periodo, fecha]);

  const loadTopClientes = useCallback(async (pagina) => {
    try {
      const params = new URLSearchParams({
        periodo, fecha, page: String(pagina), limit: String(POR_PAGINA),
      });
      const data = await API.getReportesClientesTop(params);
      setTopClientes({
        data: data?.data || [],
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, clientesTop: getErrorMessage(err, 'Error cargando clientes top') }));
      setTopClientes({ data: [], total: 0, totalPages: 1 });
    }
  }, [periodo, fecha]);

  useEffect(() => {
    loadTopProductos(paginaProductosTop);
  }, [loadTopProductos, paginaProductosTop]);

  useEffect(() => {
    loadTopClientes(paginaClientesTop);
  }, [loadTopClientes, paginaClientesTop]);

  useEffect(() => {
    setPaginaPerdidas(1);
    setPaginaGananciaProducto(1);
    setPaginaProductosTop(1);
    setPaginaClientesTop(1);
  }, [periodo, fecha, comparar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Preparar datos de gráficos
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9099c4' : '#4b5280';
  const gridColor = isDark ? '#2d3150' : '#e2e6f0';

  // Gráfico de ventas
  const ventasChartData = ventas?.agrupacion ? {
    labels: ventas.agrupacion.map(a => {
      const d = new Date(a.fecha);
      if (periodo === 'diario') return d.getHours().toString().padStart(2, '0') + ':00';
      if (periodo === 'semanal') return d.toLocaleDateString('es-VE', { weekday: 'short' });
      if (periodo === 'mensual') return `Sem ${Math.ceil(d.getDate() / 7)}`;
      return d.toLocaleDateString('es-VE', { month: 'short' });
    }),
    datasets: [
      {
        label: `Ventas (${currencySymbol})`,
        data: ventas.agrupacion.map(a => parseFloat(a.total)),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: isDark ? '#1e2130' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(comparar && ventas.comparacion ? [{
        label: 'Período anterior',
        data: ventas.agrupacion.map(() => parseFloat(ventas.comparacion.totalAnterior) / ventas.agrupacion.length),
        borderColor: '#94a3b8',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointRadius: 0,
      }] : []),
    ],
  } : null;

  // Gráfico de ganancias. Las tres cifras salen de la misma agregación por
  // producto del backend, así que Ingresos = Costo + Ganancia sin ajuste manual.
  const gananciasChartData = ganancias && ganancias.gananciaBruta !== null ? {
    labels: ['Ingresos s/imp.', 'Costo vendido', 'Ganancia'],
    datasets: [{
      data: [
        parseFloat(ganancias.ingresosTotales),
        parseFloat(ganancias.costoVendido),
        parseFloat(ganancias.gananciaBruta),
      ],
      backgroundColor: ['#10b981', '#ef4444', '#6366f1'],
      borderWidth: 0,
    }],
  } : null;

  // Gráfico de inversión por categoría
  const inversionChartData = inversion?.inversionPorCategoria ? {
    labels: inversion.inversionPorCategoria.map(c => c.categoria),
    datasets: [{
      data: inversion.inversionPorCategoria.map(c => parseFloat(c.valor)),
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
      borderWidth: 0,
    }],
  } : null;

  // Gráfico de caja por método
  const cajaChartData = caja?.desglose ? {
    labels: caja.desglose.map(d => d.metodoLabel),
    datasets: [{
      data: caja.desglose.map(d => parseFloat(d.totalUSD)),
      backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e2130' : '#ffffff',
        titleColor: isDark ? '#e8eaf6' : '#1a1d2e',
        bodyColor: isDark ? '#9099c4' : '#4b5280',
        borderColor: isDark ? '#2d3150' : '#e2e6f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `${context.dataset.label || ''}: ${Utils.formatMoney(context.parsed.y, currencySymbol)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: textColor,
          callback: (value) => Utils.formatMoney(value, currencySymbol)
        }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: textColor }
      }
    }
  };

  const getFechaValue = (periodoActual = periodo) => {
    const ahora = new Date();
    switch (periodoActual) {
      case 'diario':
        return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
      case 'semanal':
        return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
      case 'mensual':
        return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
      case 'anual':
        return `${ahora.getFullYear()}`;
      default:
        return '';
    }
  };

  const handlePeriodoChange = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    setFecha(getFechaValue(nuevoPeriodo));
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPORTACIÓN
  // ═══════════════════════════════════════════════════════════════════════════════

  const exportarPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const params = new URLSearchParams({ periodo, fecha });
      const verGanancias = puedeVerGanancias;
      const [reporte, detalle] = await Promise.all([
        // El endpoint de ganancias está restringido a EMPRESA / SUPER_ADMIN;
        // pedirlo para otros roles solo produciría un error.
        verGanancias
          ? API.getReportesGanancias(params)
          : Promise.resolve(null),
        cargarDetalleCompleto(periodo, fecha),
      ]);
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const m = (v) => Utils.formatMoney(v, '$');

      // ── Encabezado ────────────────────────────────────────────────────────
      doc.setFontSize(18);
      doc.text(
        verGanancias ? 'Reporte de Ganancias por Producto' : 'Reporte de Ventas por Producto',
        pageWidth / 2, 15, { align: 'center' }
      );
      doc.setFontSize(10);
      doc.text(`Período: ${reporte?.etiqueta || detalle.etiqueta || 'N/A'}`, 14, 23);
      doc.text(`Generado: ${new Date().toLocaleString('es-VE')}`, 14, 29);
      doc.text('Montos en USD · Cantidades en la unidad del producto (gramos convertidos a kg)', 14, 35);

      let y = 43;

      // ── Resumen ejecutivo ─────────────────────────────────────────────────
      if (verGanancias && reporte) {
        const tarjetas = [
          ['Ingresos s/imp.', m(reporte.ingresosTotales), [16, 185, 129]],
          ['Costo vendido', m(reporte.costoVendido), [245, 158, 11]],
          [reporte.etiquetaGanancia || 'Ganancia',
            reporte.gananciaBruta === null ? 'No disponible' : m(reporte.gananciaBruta),
            reporte.gananciaBruta !== null && Number(reporte.gananciaBruta) < 0
              ? [220, 38, 38] : [5, 150, 105]],
          ['Margen', reporte.margen === null ? 'No disponible' : `${reporte.margen}%`, [90, 90, 100]],
        ];
        const ancho = 62;
        tarjetas.forEach(([titulo, valor, color], i) => {
          const x = 14 + i * (ancho + 4);
          doc.setDrawColor(220, 223, 228);
          doc.setFillColor(249, 250, 252);
          doc.roundedRect(x, y, ancho, 20, 2, 2, 'FD');
          doc.setFontSize(7);
          doc.setTextColor(110, 116, 128);
          doc.text(titulo.toUpperCase(), x + 4, y + 6);
          doc.setFontSize(11);
          doc.setTextColor(...color);
          doc.text(String(valor), x + 4, y + 15);
        });
        y += 26;
      }

      // ── Ganancia por producto ─────────────────────────────────────────────
      const porProducto = reporte?.gananciaPorProducto || [];
      if (porProducto.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Ganancia por producto (${porProducto.length})`, 14, y);
        y += 4;

        const columnasProd = verGanancias
          ? ['Producto', 'SKU', 'Unidad', 'Cantidad', 'Ingresos s/imp.', 'Costo', 'Ganancia']
          : ['Producto', 'SKU', 'Unidad', 'Cantidad', 'Ingresos s/imp.'];

        const cuerpoProd = porProducto.map(p => {
          const base = [
            p.nombre,
            p.sku || '—',
            p.unidad || '—',
            Number(p.cantidadVendida).toLocaleString('es-VE', { maximumFractionDigits: 3 }),
            m(p.ingresos),
          ];
          return verGanancias
            ? [...base, m(p.costo), m(p.ganancia)]
            : base;
        });

        // Fila de totales: la cantidad NO se suma entre unidades distintas.
        const porUnidad = {};
        for (const p of porProducto) {
          const u = p.unidad || '—';
          porUnidad[u] = (porUnidad[u] || 0) + Number(p.cantidadVendida || 0);
        }
        const suma = (campo) => porProducto.reduce((a, p) => a + Number(p[campo] || 0), 0);
        const totalesProd = [
          'Total General',
          '',
          '',
          Object.entries(porUnidad).map(([u, v]) => `${v.toFixed(2)} ${u}`).join(' + '),
          m(suma('ingresos')),
        ];
        if (verGanancias) totalesProd.push(m(suma('costo')), m(suma('ganancia')));

        autoTable(doc, {
          startY: y,
          head: [columnasProd],
          body: cuerpoProd,
          foot: [totalesProd],
          styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [99, 102, 241] },
          footStyles: { fillColor: [240, 242, 247], fontStyle: 'bold', fontSize: 7 },
          columnStyles: verGanancias
            ? ANCHOS_PRODUCTOS
            : { 0: ANCHOS_PRODUCTOS[0], 1: ANCHOS_PRODUCTOS[1], 2: ANCHOS_PRODUCTOS[2],
                3: ANCHOS_PRODUCTOS[3], 4: ANCHOS_PRODUCTOS[4] },
        });
        y = (doc.lastAutoTable?.finalY || y) + 8;
      }

      // ── Detalle por factura ───────────────────────────────────────────────
      const lineasFactura = detalle.detalle || [];
      if (lineasFactura.length > 0) {
        constTitulo = (texto, subtitulo, color) => {
          const espacio = 22;
          if (y + espacio > pageHeight - 24) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(11);
          doc.setTextColor(...color);
          doc.text(texto, 14, y);
          y += 5;
          if (subtitulo) {
            doc.setFontSize(7);
            doc.setTextColor(110, 116, 128);
            doc.text(subtitulo, 14, y, { maxWidth: pageWidth - 28 });
            y += 3;
          }
          doc.setTextColor(0, 0, 0);
          y += 2;
        };

        titulo(
          `Detalle por factura (${lineasFactura.length} de ${detalle.paginacion?.total ?? lineasFactura.length})`,
          'Una fila por factura emitida en el período. La ganancia usa el costo histórico de cada producto en el momento de la venta.',
          [0, 0, 0]
        );

        const columnasDet = verGanancias
          ? ['Factura', 'Referencia', 'Cliente', 'Fecha y hora', 'Total (USD)', 'Ganancia (USD)']
          : ['Factura', 'Referencia', 'Cliente', 'Fecha y hora', 'Total (USD)'];

        autoTable(doc, {
          startY: y,
          head: [columnasDet],
          body: lineasFactura.map(item => [
            `#${item.facturaId}`,
            item.referencia,
            item.cliente,
            new Date(item.fechaHora).toLocaleString('es-VE'),
            m(item.montoTotal),
            ...(verGanancias ? [
              item.costoDesconocido
                ? 'No disponible'
                : `${item.costoEstimado ? '* ' : ''}${m(item.ganancia)}`,
            ] : []),
          ]),
          foot: [[
            'Total facturado', '', '', '',
            m(detalle.totalIngresos),
            ...(verGanancias ? [
              detalle.gananciaTotal === null
                ? 'No disponible'
                : m(detalle.gananciaTotal),
            ] : []),
          ]],
          styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [99, 102, 241] },
          footStyles: { fillColor: [240, 242, 247], fontStyle: 'bold', fontSize: 7 },
          columnStyles: verGanancias
            ? ANCHOS_DETALLE
            : { 0: ANCHOS_DETALLE[0], 1: ANCHOS_DETALLE[1], 2: ANCHOS_DETALLE[2],
                3: ANCHOS_DETALLE[3], 4: ANCHOS_DETALLE[4] },
        });
        y = (doc.lastAutoTable?.finalY || y) + 8;
      }

      // ── Pérdidas ──────────────────────────────────────────────────────────
      const perdidas = verGanancias ? (reporte?.productosConPerdida || []) : [];
      if (perdidas.length > 0) {
        titulo(
          `Líneas de venta con pérdida (${perdidas.length})`,
          'Cada línea aparece porque el costo histórico del producto supera el precio de venta sin impuestos.',
          [180, 35, 24]
        );

        autoTable(doc, {
          startY: y,
          head: [['Factura', 'Fecha y hora', 'Cliente', 'Producto', 'Cantidad', 'Subtotal s/imp. (USD)', 'Ganancia (USD)']],
          body: perdidas.map(item => [
            `#${item.facturaId}`,
            new Date(item.fechaHora).toLocaleString('es-VE'),
            item.cliente,
            item.producto,
            `${Number(item.cantidad).toLocaleString('es-VE')} ${item.unidad || ''}`.trim(),
            m(item.subtotal),
            m(item.ganancia),
          ]),
          foot: [[
            'Total pérdidas', '', '', '',
            m(perdidas.reduce((a, i) => a + Number(i.subtotal || 0), 0)),
            m(perdidas.reduce((a, i) => a + Number(i.ganancia || 0), 0)),
          ]],
          styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [180, 35, 24] },
          footStyles: { fillColor: [253, 242, 242], fontStyle: 'bold', fontSize: 7 },
          columnStyles: ANCHOS_PERDIDAS,
        });
        y = (doc.lastAutoTable?.finalY || y) + 8;
      }

      // ── Notas y cierre ────────────────────────────────────────────────────
      const notas = [];
      if (verGanancias && reporte && reporte.facturasSinCosto > 0) {
        notas.push(reporte.facturasConCosto === 0
          ? `No fue posible calcular la ganancia: ${reporte.facturasSinCosto} factura(s) no tienen costo histórico completo. No se usó el costo actual del inventario como sustituto.`
          : `${reporte.facturasSinCosto} factura(s) sin costo histórico completo se excluyeron de la ganancia total; no se usó el costo actual del inventario como sustituto.`);
      }
      if (verGanancias && reporte && reporte.gananciaBruta !== null && Number(reporte.gananciaBruta) < 0) {
        notas.push('La ganancia del período es negativa porque las pérdidas detalladas superan las ganancias de las demás ventas con costo histórico completo.');
      }
      if (detalle.paginacion && detalle.paginacion.total > lineasFactura.length) {
        notas.push(`El detalle por factura está limitado a ${lineasFactura.length} de ${detalle.paginacion.total} facturas del período. El resumen por producto y las pérdidas cubren la totalidad.`);
      }

      const notasLineas = notas.length > 0
        ? doc.splitTextToSize(notas.join('  ·  '), pageWidth - 28)
        : [];
      const cierre = [
        `Monto total facturado: ${m(detalle.totalIngresos)}`,
        ...(verGanancias && reporte ? [`${reporte.etiquetaGanancia || 'Ganancia'}: ${reporte.gananciaBruta === null ? 'No disponible por falta de costo histórico' : m(reporte.gananciaBruta)}`] : []),
        'La cantidad se normaliza a la unidad del producto: las líneas guardadas en GRAMO se convierten a kg. Las cantidades de unidades distintas no se suman entre sí.',
      ];
      const cierreLineas = doc.splitTextToSize(cierre.join('  ·  '), pageWidth - 28);

      const altoNecesario = cierreLineas.length * 4 + (notasLineas.length ? notasLineas.length * 4 + 4 : 0) + 14;
      if (y + altoNecesario > pageHeight - 24) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(8);
      doc.setTextColor(60, 64, 72);
      doc.text(cierreLineas, 14, y);
      y += cierreLineas.length * 4 + 2;
      if (notasLineas.length > 0) {
        doc.setFontSize(7);
        doc.setTextColor(130, 135, 145);
        doc.text(notasLineas, 14, y);
      }

      // ── Pie de página ─────────────────────────────────────────────────────
      const totalPaginas = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 155, 165);
        doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
        doc.text(`Reporte de Ganancias por Producto · ${reporte?.etiqueta || detalle.etiqueta || ''}`, 14, pageHeight - 8);
      }

      doc.save(`reporte_ganancias_${periodo}_${fecha}.pdf`);
      showToast('Reporte PDF exportado correctamente', 'success');
    } catch (err) {
      showToast('Error exportando PDF: ' + err.message, 'error');
    }
  };

  const exportarCSV = async () => {
    try {
      // El archivo debe cubrir el período completo, no solo lo que hay en
      // pantalla: se piden todas las páginas de cada listado paginado.
      const verGanancias = puedeVerGanancias;
      const [reporte, detalle, todosProductos, todosClientes] = await Promise.all([
        // El endpoint de ganancias está restringido a EMPRESA / SUPER_ADMIN;
        // pedirlo para otros roles solo produciría un error.
        verGanancias
          ? API.getReportesGanancias(new URLSearchParams({ periodo, fecha }))
          : Promise.resolve(null),
        cargarDetalleCompleto(periodo, fecha),
        cargarListadoCompleto(API.getReportesProductosTop, periodo, fecha).catch(() => topProductos.data),
        cargarListadoCompleto(API.getReportesClientesTop, periodo, fecha).catch(() => topClientes.data),
      ]);

      const rows = [];
      const suma = (lista, campo) =>
        lista.reduce((a, p) => a + (parseFloat(p[campo]) || 0), 0);

      // ── Encabezado ────────────────────────────────────────────────────────
      rows.push([verGanancias ? 'Reporte de Ganancias por Producto' : 'Reporte de Ventas por Producto']);
      rows.push(['Período', ventas?.etiqueta || 'N/A']);
      rows.push(['Fecha de generación', new Date().toLocaleString('es-VE')]);
      rows.push(['Moneda', 'USD']);
      rows.push(['Nota sobre unidades', 'Cantidades en la unidad del producto; las líneas en GRAMO se convierten a kg.']);
      rows.push([]);

      // ── Resumen ───────────────────────────────────────────────────────────
      rows.push(['RESUMEN']);
      if (ventas) {
        rows.push(['Ingresos del período (con impuestos)', ventas.total || '0']);
        rows.push(['Impuestos', ventas.impuestos || '0']);
        rows.push(['Subtotal (sin impuestos)', ventas.subtotal || '0']);
        rows.push(['Cantidad de facturas', ventas.cantidadFacturas || '0']);
        rows.push(['Promedio por venta', ventas.promedioVenta || '0']);
      }
      if (verGanancias && reporte) {
        rows.push(['Ingresos sin impuestos', reporte.ingresosTotales]);
        rows.push(['Costo vendido', reporte.costoVendido]);
        rows.push([reporte.etiquetaGanancia || 'Ganancia',
          reporte.gananciaBruta ?? 'No disponible por falta de costo histórico']);
        rows.push(['Margen (%)', reporte.margen ?? 'No disponible']);
        rows.push(['Facturas con costo histórico', reporte.facturasConCosto]);
        rows.push(['Facturas sin costo histórico', reporte.facturasSinCosto]);
      }
      rows.push([]);

      // ── Ganancia por producto ─────────────────────────────────────────────
      const porProducto = reporte?.gananciaPorProducto || [];
      rows.push([
        verGanancias
          ? `GANANCIA POR PRODUCTO (${porProducto.length})`
          : `INGRESOS POR PRODUCTO (${porProducto.length})`,
      ]);
      rows.push(verGanancias
        ? ['Producto', 'SKU', 'Unidad', 'Cantidad vendida', 'Ingresos sin impuestos', 'Costo histórico', 'Ganancia']
        : ['Producto', 'SKU', 'Unidad', 'Cantidad vendida', 'Ingresos sin impuestos']);
      for (const p of porProducto) {
        rows.push([
          p.nombre,
          p.sku || '',
          p.unidad || '',
          p.cantidadVendida,
          p.ingresos,
          ...(verGanancias ? [p.costo, p.ganancia] : []),
        ]);
      }
      if (porProducto.length > 0) {
        rows.push([
          'TOTAL',
          '',
          // No se pueden sumar cantidades de unidades distintas: se listan aparte.
          desgloseUnidadesPorProducto(porProducto),
          suma(porProducto, 'ingresos').toFixed(2),
          ...(verGanancias ? [
            suma(porProducto, 'costo').toFixed(2),
            suma(porProducto, 'ganancia').toFixed(2),
          ] : []),
        ]);
      }
      rows.push([]);

      // ── Detalle por factura ───────────────────────────────────────────────
      const lineasFactura = detalle.detalle || [];
      if (lineasFactura.length > 0) {
        rows.push([`DETALLE POR FACTURA (${lineasFactura.length})`]);
        rows.push([
          'Factura', 'Referencia', 'Cliente', 'Fecha y hora',
          'Monto total', ...(verGanancias ? ['Ganancia'] : []),
        ]);
        for (const item of lineasFactura) {
          rows.push([
            item.facturaId,
            item.referencia,
            item.cliente,
            new Date(item.fechaHora).toLocaleString('es-VE'),
            item.montoTotal,
            ...(verGanancias ? [
              // El backend expone `ganancia` y marca `costoDesconocido` cuando
              // la línea no tiene costo histórico: no se inventa un valor.
              item.costoDesconocido ? 'No disponible' : item.ganancia,
            ] : []),
          ]);
        }
        rows.push([
          'TOTAL FACTURADO', '', '', '',
          detalle.totalIngresos,
          ...(verGanancias ? [detalle.gananciaTotal ?? 'No disponible'] : []),
        ]);
        rows.push([]);
      }

      // ── Pérdidas ──────────────────────────────────────────────────────────
      const perdidas = verGanancias ? (reporte?.productosConPerdida || []) : [];
      if (perdidas.length > 0) {
        rows.push([`LÍNEAS DE VENTA CON PÉRDIDA (${perdidas.length})`]);
        rows.push([
          'Factura', 'Fecha y hora', 'Cliente', 'Producto',
          'Cantidad', 'Unidad', 'Subtotal sin impuestos', 'Ganancia',
        ]);
        for (const item of perdidas) {
          rows.push([
            item.facturaId,
            new Date(item.fechaHora).toLocaleString('es-VE'),
            item.cliente,
            item.producto,
            item.cantidad,
            item.unidad || '',
            item.subtotal,
            item.ganancia,
          ]);
        }
        rows.push([
          'TOTAL PÉRDIDAS', '', '', '', '', '',
          perdidas.reduce((a, i) => a + (parseFloat(i.subtotal) || 0), 0).toFixed(2),
          perdidas.reduce((a, i) => a + (parseFloat(i.ganancia) || 0), 0).toFixed(2),
        ]);
        rows.push([]);
      }

      // ── Productos más vendidos ────────────────────────────────────────────
      if (todosProductos.length > 0) {
        rows.push([`PRODUCTOS MÁS VENDIDOS (${todosProductos.length})`]);
        rows.push(['Nombre', 'SKU', 'Unidad', 'Cantidad', 'Ingresos']);
        for (const p of todosProductos) {
          rows.push([p.nombre, p.sku || '', p.unidad || '', p.cantidadVendida, p.ingresos]);
        }
        rows.push([]);
      }

      // ── Clientes principales ──────────────────────────────────────────────
      if (todosClientes.length > 0) {
        rows.push([`CLIENTES PRINCIPALES (${todosClientes.length})`]);
        rows.push(['Nombre', 'RIF', 'Facturas', 'Total compras']);
        for (const c of todosClientes) {
          rows.push([c.nombre, c.rif || '', c.cantidadFacturas, c.totalCompras]);
        }
        rows.push([]);
      }

      // ── Notas ─────────────────────────────────────────────────────────────
      const notas = [];
      if (verGanancias && reporte && reporte.facturasSinCosto > 0) {
        notas.push(reporte.facturasConCosto === 0
          ? `No fue posible calcular la ganancia: ${reporte.facturasSinCosto} factura(s) no tienen costo histórico completo. No se usó el costo actual del inventario como sustituto.`
          : `${reporte.facturasSinCosto} factura(s) sin costo histórico completo se excluyeron de la ganancia total; no se usó el costo actual del inventario como sustituto.`);
      }
      if (verGanancias && reporte && reporte.gananciaBruta !== null && Number(reporte.gananciaBruta) < 0) {
        notas.push('La ganancia del período es negativa porque las pérdidas detalladas superan las ganancias de las demás ventas con costo histórico completo.');
      }
      if (notas.length > 0) {
        rows.push(['NOTAS']);
        for (const n of notas) rows.push([n]);
      }

      // ── Descarga ──────────────────────────────────────────────────────────
      // BOM para que Excel reconozca UTF-8 y no rompa los acentos.
      const csvContent = '\uFEFF' + rows
        .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_ganancias_${periodo}_${fecha}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Reporte CSV exportado correctamente', 'success');
    } catch (err) {
      showToast('Error exportando CSV: ' + err.message, 'error');
    }
  };

  return (
    <>
      <Header
        title="Reportes"
        subtitle="Análisis de ventas, ganancias e inversión"
        toggleSidebar={toggleSidebar}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={exportarPDF} className="btn btn-secondary btn-sm inline-flex items-center gap-2" disabled={loading}>
              <Icon icon={pdfIcon} className="h-4 w-4" />
              PDF
            </button>
            <button onClick={exportarCSV} className="btn btn-secondary btn-sm inline-flex items-center gap-2" disabled={loading}>
              <Icon icon={csvIcon} className="h-4 w-4" />
              CSV
            </button>
            <button onClick={loadData} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
              <Icon icon={refreshIcon} className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        }
      />

      <div className="page-body">
        {/* Filtros */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="report-filters">
            <div className="form-group report-filter-field">
              <label className="form-label">Periodicidad</label>
              <select
                className="form-select"
                value={periodo}
                onChange={(e) => handlePeriodoChange(e.target.value)}
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            <div className="form-group report-filter-field">
              <label className="form-label">Fecha</label>
              <input
                type={periodo === 'anual' ? 'number' : periodo === 'mensual' ? 'month' : 'date'}
                className="form-input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="report-filter-compare">
              <input
                type="checkbox"
                id="comparar"
                checked={comparar}
                onChange={(e) => setComparar(e.target.checked)}
              />
              <label htmlFor="comparar" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Icon icon={compareIcon} className="h-4 w-4" />
                Comparar con período anterior
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div>
            {/* Skeleton de métricas */}
            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="metric-card" style={{ opacity: 0.6 }}>
                  <div className="metric-icon" style={{ background: 'var(--bg-secondary)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '24px', width: '120px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ height: '14px', width: '80px', background: 'var(--bg-secondary)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Skeleton de gráficos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {[1, 2].map(i => (
                <div key={i} className="card">
                  <div style={{ height: '20px', width: '150px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '16px' }} />
                  <div style={{ height: '250px', background: 'var(--bg-secondary)', borderRadius: '8px' }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Alertas de error */}
            {Object.keys(errors).length > 0 && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <Icon icon={alertIcon} className="h-5 w-5" />
                <div>
                  <strong>Errores al cargar algunos datos:</strong>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    {Object.entries(errors).map(([key, msg]) => (
                      <li key={key} style={{ fontSize: '0.875rem' }}>{msg}</li>
                    ))}
                  </ul>
                </div>
                <button onClick={loadData} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
                  Reintentar
                </button>
              </div>
            )}
            {/* Métricas principales */}
            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card accent">
                <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{Utils.formatMoney(ventas?.total || 0, currencySymbol)}</div>
                  <div className="metric-label">Ingresos {ventas?.etiqueta || ''}</div>
                  {ventas?.comparacion && (
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', color: ventas.comparacion.tendencia === 'up' ? '#10b981' : ventas.comparacion.tendencia === 'down' ? '#ef4444' : textColor }}>
                      <Icon icon={ventas.comparacion.tendencia === 'up' ? trendUpIcon : ventas.comparacion.tendencia === 'down' ? trendDownIcon : null} className="h-3 w-3" style={{ verticalAlign: 'middle' }} />
                      {' '}{Utils.formatearPorcentaje(ventas.comparacion.porcentajeCambio)} vs anterior
                    </div>
                  )}
                </div>
              </div>

              {puedeVerGanancias && (
                <div className="metric-card success">
                  <div className="metric-icon"><Icon icon={trendUpIcon} className="h-6 w-6" /></div>
                  <div>
                    <div className="metric-value">
                      {ganancias
                        ? ganancias.gananciaBruta === null
                          ? 'No disponible'
                          : Utils.formatMoney(ganancias.gananciaBruta, currencySymbol)
                        : errors.ganancias
                          ? 'No disponible'
                          : loading
                            ? 'Cargando…'
                            : '—'}
                    </div>
                    <div className="metric-label">{ganancias.etiquetaGanancia || 'Ganancia'}</div>
                    {ganancias && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: textColor }}>
                        Margen: {ganancias.margen === null ? 'No disponible' : `${ganancias.margen}%`}
                      </div>
                    )}
                    {ganancias?.facturasSinCosto > 0 && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#b45309' }}>
                        {ganancias.facturasConCosto === 0
                          ? `No se puede calcular: ${ganancias.facturasSinCosto} factura(s) no tienen costo histórico registrado.`
                          : `${ganancias.facturasSinCosto} factura(s) excluida(s) por falta de costo histórico; la ganancia mostrada es parcial.`}
                      </div>
                    )}
                    {ganancias && ganancias.gananciaBruta === null && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#b45309' }}>
                        Se conservan los ingresos facturados, pero no se estima ganancia usando el costo actual del inventario.
                      </div>
                    )}
                    {!ganancias && errors.ganancias && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#b42318' }}>
                        {errors.ganancias}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {puedeVerGanancias && impuestos && (
                <div className="metric-card danger">
                  <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                  <div>
                    <div className="metric-value">{Utils.formatMoney(impuestos.totalImpuestos, currencySymbol)}</div>
                    <div className="metric-label">Impuestos Recaudados</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', color: textColor }}>
                      Base: {Utils.formatMoney(impuestos.baseImponible, currencySymbol)} · Tasa: {impuestos.tasaEfectiva}%
                    </div>
                  </div>
                </div>
              )}

              <div className="metric-card info">
                <div className="metric-icon"><Icon icon={receiptIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{ventas?.cantidadFacturas || 0}</div>
                  <div className="metric-label">Facturas Emitidas</div>
                  {ventas && (
                    <div style={{ fontSize: '0.75rem', marginTop: '4px', color: textColor }}>
                      Promedio: {Utils.formatMoney(ventas.promedioVenta, currencySymbol)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {puedeVerGanancias && ganancias?.productosConPerdida?.length > 0 && (
              <section
                className="card"
                style={{
                  marginBottom: '24px',
                  border: '1px solid #fca5a5',
                  background: isDark ? '#351f27' : '#fff7f7',
                }}
                aria-labelledby="ventas-perdida-titulo"
              >
                <div className="card-header">
                  <div>
                    <h3 className="card-title" id="ventas-perdida-titulo" style={{ color: '#b42318' }}>
                      <Icon icon={alertIcon} className="h-5 w-5" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Líneas de venta con pérdida ({ganancias.productosConPerdida.length})
                    </h3>
                    <p className="card-subtitle">
                      Montos en USD. En estas líneas, el costo histórico superó el subtotal vendido sin impuestos. El detalle respeta el filtro y la empresa seleccionados.
                      {Number(ganancias.gananciaBruta) < 0 && ' La pérdida neta del período ocurre porque estas pérdidas superan la ganancia de las demás ventas.'}
                    </p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Factura</th>
                        <th>Fecha y hora</th>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Subtotal sin impuestos (USD)</th>
                        <th>Costo histórico (USD)</th>
                        <th>Pérdida (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ganancias.productosConPerdida
                        .slice((paginaPerdidas - 1) * POR_PAGINA, paginaPerdidas * POR_PAGINA)
                        .map((item, index) => (
                        <tr key={`${item.facturaId}-${item.producto}-${index}`}>
                          <td>#{item.facturaId}</td>
                          <td>{new Date(item.fechaHora).toLocaleString('es-VE')}</td>
                          <td>{item.cliente}</td>
                          <td>{item.producto}</td>
                          <td>{Number(item.cantidad).toLocaleString('es-VE')} {item.unidad || ''}</td>
                          <td>{Utils.formatMoney(item.subtotal, '$')}</td>
                          <td style={{ color: '#b42318', fontWeight: 600 }}>{Utils.formatMoney(item.ganancia, '$')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {ganancias.productosConPerdida.length > POR_PAGINA && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={paginaPerdidas === 1}
                      onClick={() => setPaginaPerdidas(p => p - 1)}
                    >
                      Anterior
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Página {paginaPerdidas} de {Math.ceil(ganancias.productosConPerdida.length / POR_PAGINA)}
                    </span>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={paginaPerdidas >= Math.ceil(ganancias.productosConPerdida.length / POR_PAGINA)}
                      onClick={() => setPaginaPerdidas(p => p + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Ganancia por Producto */}
            {puedeVerGanancias && ganancias?.gananciaPorProducto && ganancias.gananciaPorProducto.length > 0 && (
              <section className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Ganancia por Producto</h3>
                    <p className="card-subtitle">Detalle de ganancia por cada producto vendido en el período</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>SKU</th>
                        <th>Unidad</th>
                        <th>Cantidad Vendida</th>
                        <th>Ingresos</th>
                        <th>Costo</th>
                        <th>Ganancia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ganancias.gananciaPorProducto
                        .slice((paginaGananciaProducto - 1) * POR_PAGINA, paginaGananciaProducto * POR_PAGINA)
                        .map((p, i) => (
                        <tr key={i}>
                          <td>{p.nombre}</td>
                          <td>{p.sku}</td>
                          <td>{p.unidad || '—'}</td>
                          <td>{p.cantidadVendida}</td>
                          <td>{Utils.formatMoney(p.ingresos, currencySymbol)}</td>
                          <td>{Utils.formatMoney(p.costo, currencySymbol)}</td>
                          <td style={{ fontWeight: 600, color: Number(p.ganancia) < 0 ? '#b42318' : '#10b981' }}>
                            {Utils.formatMoney(p.ganancia, currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 700, background: isDark ? '#1e2130' : '#f8f9fc', borderTop: '2px solid var(--border-color)' }}>
                        <td colSpan={3}>Total General</td>
                        {/* No se suman las cantidades entre unidades distintas
                            (kg, unidad, litro): daría un número sin sentido.
                            Se muestra el desglose por unidad. */}
                        <td title={desgloseUnidadesPorProducto(ganancias?.gananciaPorProducto)}>
                          {desgloseUnidadesPorProducto(ganancias?.gananciaPorProducto)}
                        </td>
                        <td>{Utils.formatMoney(ganancias.gananciaPorProducto.reduce((acc, p) => acc + parseFloat(p.ingresos), 0), currencySymbol)}</td>
                        <td>{Utils.formatMoney(ganancias.gananciaPorProducto.reduce((acc, p) => acc + parseFloat(p.costo), 0), currencySymbol)}</td>
                        <td style={{ color: Number(ganancias.gananciaBruta) < 0 ? '#b42318' : '#10b981' }}>
                          {Utils.formatMoney(ganancias.gananciaPorProducto.reduce((acc, p) => acc + parseFloat(p.ganancia), 0), currencySymbol)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {ganancias.gananciaPorProducto.length > POR_PAGINA && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={paginaGananciaProducto === 1}
                      onClick={() => setPaginaGananciaProducto(p => p - 1)}
                    >
                      Anterior
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Página {paginaGananciaProducto} de {Math.ceil(ganancias.gananciaPorProducto.length / POR_PAGINA)}
                    </span>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={paginaGananciaProducto >= Math.ceil(ganancias.gananciaPorProducto.length / POR_PAGINA)}
                      onClick={() => setPaginaGananciaProducto(p => p + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Gráficos principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Gráfico de Ventas */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      <Icon icon={chartLineIcon} className="h-5 w-5" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Evolución de Ventas
                    </h3>
                    <p className="card-subtitle">{ventas?.etiqueta}</p>
                  </div>
                </div>
                <div style={{ height: '250px', width: '100%' }}>
                  {ventasChartData ? (
                    <Line data={ventasChartData} options={chartOptions} />
                  ) : (
                    <div className="empty-state">Sin datos de ventas</div>
                  )}
                </div>
              </div>

              {/* Gráfico de Ganancias */}
              {puedeVerGanancias && (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">
                        <Icon icon={chartPieIcon} className="h-5 w-5" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Distribución de Ganancias
                      </h3>
                      <p className="card-subtitle">Ingresos sin impuestos = costo de lo vendido + ganancia; excluye el inventario disponible</p>
                    </div>
                  </div>
                  <div style={{ height: '250px', width: '100%' }}>
                    {gananciasChartData ? (
                      <Doughnut
                        data={gananciasChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom', labels: { color: textColor } },
                            tooltip: {
                              backgroundColor: isDark ? '#1e2130' : '#ffffff',
                              titleColor: isDark ? '#e8eaf6' : '#1a1d2e',
                              bodyColor: isDark ? '#9099c4' : '#4b5280',
                              callbacks: {
                                label: (context) => `${context.label}: ${Utils.formatMoney(context.parsed, currencySymbol)}`
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="empty-state">Sin datos de ganancias</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Inversión y Caja */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Inversión por categoría */}
              {puedeVerInversion && (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">
                        <Icon icon={chartBarIcon} className="h-5 w-5" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Inversión por Categoría
                      </h3>
                      <p className="card-subtitle">Valor del inventario</p>
                    </div>
                  </div>
                  <div style={{ height: '250px', width: '100%' }}>
                    {inversionChartData ? (
                      <Bar
                        data={inversionChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: isDark ? '#1e2130' : '#ffffff',
                              titleColor: isDark ? '#e8eaf6' : '#1a1d2e',
                              bodyColor: isDark ? '#9099c4' : '#4b5280',
                              callbacks: {
                                label: (context) => Utils.formatMoney(context.parsed.y, currencySymbol)
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: gridColor, drawBorder: false },
                              ticks: { color: textColor, callback: (v) => Utils.formatMoney(v, currencySymbol) }
                            },
                            x: {
                              grid: { display: false },
                              ticks: { color: textColor }
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="empty-state">Sin datos de inversión</div>
                    )}
                  </div>
                </div>
              )}

              {/* Caja por método de pago */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      <Icon icon={cashIcon} className="h-5 w-5" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Ventas por Método de Pago
                    </h3>
                    <p className="card-subtitle">{caja?.desglose?.length || 0} métodos utilizados</p>
                  </div>
                </div>
                <div style={{ height: '250px', width: '100%' }}>
                  {cajaChartData ? (
                    <Doughnut
                      data={cajaChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { color: textColor } },
                          tooltip: {
                            backgroundColor: isDark ? '#1e2130' : '#ffffff',
                            titleColor: isDark ? '#e8eaf6' : '#1a1d2e',
                            bodyColor: isDark ? '#9099c4' : '#4b5280',
                            callbacks: {
                              label: (context) => `${context.label}: ${Utils.formatMoney(context.parsed, currencySymbol)}`
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="empty-state">Sin datos de caja</div>
                  )}
                </div>
              </div>
            </div>

            {/* Tablas de Top Productos y Clientes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Productos Top */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Productos Más Vendidos</h3>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Unidad</th>
                        <th>Cantidad</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProductos.data.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-state">No hay datos</td>
                        </tr>
                      ) : (
                        topProductos.data.map((p, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.sku}</div>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{p.unidad || '—'}</td>
                            <td style={{ fontWeight: 600 }}>{p.cantidadVendida}</td>
                            <td style={{ fontWeight: 600 }}>{Utils.formatMoney(p.ingresos, currencySymbol)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {topProductos.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-sm btn-secondary" disabled={paginaProductosTop === 1} onClick={() => setPaginaProductosTop(p => p - 1)}>Anterior</button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Página {paginaProductosTop} de {topProductos.totalPages}</span>
                    <button className="btn btn-sm btn-secondary" disabled={paginaProductosTop >= topProductos.totalPages} onClick={() => setPaginaProductosTop(p => p + 1)}>Siguiente</button>
                  </div>
                )}
              </div>

              {/* Clientes Top */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Clientes Principales</h3>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Facturas</th>
                        <th>Total Compras</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientes.data.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="empty-state">No hay datos</td>
                        </tr>
                      ) : (
                        topClientes.data.map((c, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{c.nombre}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.rif}</div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{c.cantidadFacturas}</td>
                            <td style={{ fontWeight: 600 }}>{Utils.formatMoney(c.totalCompras, currencySymbol)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {topClientes.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-sm btn-secondary" disabled={paginaClientesTop === 1} onClick={() => setPaginaClientesTop(p => p - 1)}>Anterior</button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Página {paginaClientesTop} de {topClientes.totalPages}</span>
                    <button className="btn btn-sm btn-secondary" disabled={paginaClientesTop >= topClientes.totalPages} onClick={() => setPaginaClientesTop(p => p + 1)}>Siguiente</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
