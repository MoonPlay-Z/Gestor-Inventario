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
import packageIcon from '@iconify/icons-mdi/package-variant';
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
  const [productosTop, setProductosTop] = useState([]);
  const [clientesTop, setClientesTop] = useState([]);
  const [caja, setCaja] = useState(null);
  const [impuestos, setImpuestos] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [errors, setErrors] = useState({});

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
        API.getReportesProductosTop(params)
          .then(setProductosTop)
          .catch(err => {
            const errorMessage = getErrorMessage(err, 'Error cargando productos top');
            setErrors(prev => ({ ...prev, productosTop: errorMessage }));
            setProductosTop([]);
          }),
        API.getReportesClientesTop(params)
          .then(setClientesTop)
          .catch(err => {
            const errorMessage = getErrorMessage(err, 'Error cargando clientes top');
            setErrors(prev => ({ ...prev, clientesTop: errorMessage }));
            setClientesTop([]);
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

  // Gráfico de ganancias
  const gananciasChartData = ganancias ? {
    labels: ['Ingresos', 'Costo Vendido', 'Ganancia Bruta'],
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
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Título
      doc.setFontSize(18);
      doc.text('Reporte de Ventas', pageWidth / 2, 15, { align: 'center' });
      
      // Período
      doc.setFontSize(12);
      doc.text(`Período: ${ventas?.etiqueta || 'N/A'}`, 14, 25);
      doc.text(`Fecha de generación: ${new Date().toLocaleString('es-VE')}`, 14, 32);
      
      // Métricas principales
      doc.setFontSize(14);
      doc.text('Resumen', 14, 45);
      
      doc.setFontSize(11);
      let y = 55;
      doc.text(`Total Ventas: ${Utils.formatMoney(ventas?.total || 0, currencySymbol)}`, 14, y);
      y += 8;
      doc.text(`Impuestos: ${Utils.formatMoney(ventas?.impuestos || 0, currencySymbol)}`, 14, y);
      y += 8;
      doc.text(`Subtotal: ${Utils.formatMoney(ventas?.subtotal || 0, currencySymbol)}`, 14, y);
      y += 8;
      doc.text(`Cantidad de Facturas: ${ventas?.cantidadFacturas || 0}`, 14, y);
      y += 8;
      doc.text(`Promedio por Venta: ${Utils.formatMoney(ventas?.promedioVenta || 0, currencySymbol)}`, 14, y);
      
      // Ganancias (si está disponible)
      if (ganancias) {
        y += 15;
        doc.setFontSize(14);
        doc.text('Ganancias', 14, y);
        y += 10;
        doc.setFontSize(11);
        doc.text(`Ingresos Totales: ${Utils.formatMoney(ganancias.ingresosTotales, currencySymbol)}`, 14, y);
        y += 8;
        doc.text(`Costo Vendido: ${Utils.formatMoney(ganancias.costoVendido, currencySymbol)}`, 14, y);
        y += 8;
        doc.text(`Ganancia Bruta: ${Utils.formatMoney(ganancias.gananciaBruta, currencySymbol)}`, 14, y);
        y += 8;
        doc.text(`Margen: ${ganancias.margen}%`, 14, y);
      }
      
      // Productos Top
      if (productosTop.length > 0) {
        y += 15;
        doc.setFontSize(14);
        doc.text('Productos Más Vendidos', 14, y);
        y += 5;
        
        autoTable(doc, {
          startY: y,
          head: [['Producto', 'SKU', 'Cantidad', 'Ingresos']],
          body: productosTop.map(p => [
            p.nombre,
            p.sku || '-',
            p.cantidadVendida.toString(),
            Utils.formatMoney(p.ingresos, currencySymbol)
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [99, 102, 241] }
        });
      }
      
      // Clientes Top
      if (clientesTop.length > 0) {
        const finalY = doc.lastAutoTable?.finalY || y + 10;
        doc.setFontSize(14);
        doc.text('Clientes Principales', 14, finalY + 15);
        
        autoTable(doc, {
          startY: finalY + 20,
          head: [['Cliente', 'RIF', 'Facturas', 'Total Compras']],
          body: clientesTop.map(c => [
            c.nombre,
            c.rif || '-',
            c.cantidadFacturas.toString(),
            Utils.formatMoney(c.totalCompras, currencySymbol)
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [99, 102, 241] }
        });
      }
      
      // Guardar
      doc.save(`reporte_ventas_${periodo}_${fecha}.pdf`);
      showToast('Reporte PDF exportado correctamente', 'success');
    } catch (err) {
      showToast('Error exportando PDF: ' + err.message, 'error');
    }
  };

  const exportarCSV = () => {
    try {
      // Crear contenido CSV
      const rows = [];
      
      // Encabezado
      rows.push(['Reporte de Ventas']);
      rows.push(['Período', ventas?.etiqueta || 'N/A']);
      rows.push(['Fecha de generación', new Date().toLocaleString('es-VE')]);
      rows.push([]);
      
      // Métricas
      rows.push(['Métricas']);
      rows.push(['Total Ventas', ventas?.total || '0']);
      rows.push(['Impuestos', ventas?.impuestos || '0']);
      rows.push(['Subtotal', ventas?.subtotal || '0']);
      rows.push(['Cantidad de Facturas', ventas?.cantidadFacturas || '0']);
      rows.push(['Promedio por Venta', ventas?.promedioVenta || '0']);
      rows.push([]);
      
      // Ganancias
      if (ganancias) {
        rows.push(['Ganancias']);
        rows.push(['Ingresos Totales', ganancias.ingresosTotales]);
        rows.push(['Costo Vendido', ganancias.costoVendido]);
        rows.push(['Ganancia Bruta', ganancias.gananciaBruta]);
        rows.push(['Margen (%)', ganancias.margen]);
        rows.push([]);
      }
      
      // Productos Top
      if (productosTop.length > 0) {
        rows.push(['Productos Más Vendidos']);
        rows.push(['Nombre', 'SKU', 'Cantidad', 'Ingresos']);
        productosTop.forEach(p => {
          rows.push([p.nombre, p.sku || '', p.cantidadVendida, p.ingresos]);
        });
        rows.push([]);
      }
      
      // Clientes Top
      if (clientesTop.length > 0) {
        rows.push(['Clientes Principales']);
        rows.push(['Nombre', 'RIF', 'Facturas', 'Total Compras']);
        clientesTop.forEach(c => {
          rows.push([c.nombre, c.rif || '', c.cantidadFacturas, c.totalCompras]);
        });
      }
      
      // Convertir a CSV
      const csvContent = rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_ventas_${periodo}_${fecha}.csv`;
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
                  <div className="metric-label">Ventas {ventas?.etiqueta || ''}</div>
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
                    <div className="metric-value">{Utils.formatMoney(ganancias?.gananciaBruta || 0, currencySymbol)}</div>
                    <div className="metric-label">Ganancia Bruta</div>
                    {ganancias && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: textColor }}>
                        Margen: {ganancias.margen}%
                      </div>
                    )}
                  </div>
                </div>
              )}

              {puedeVerInversion && (
                <div className="metric-card warning">
                  <div className="metric-icon"><Icon icon={packageIcon} className="h-6 w-6" /></div>
                  <div>
                    <div className="metric-value">{Utils.formatMoney(inversion?.valorInventario || 0, currencySymbol)}</div>
                    <div className="metric-label">Valor Inventario</div>
                    {inversion && (
                      <div style={{ fontSize: '0.75rem', marginTop: '4px', color: textColor }}>
                        {inversion.totalProductos} productos · {inversion.productosConStock} con stock
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
                      <p className="card-subtitle">Ingresos vs Costos</p>
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
                                label: (context) => {
                                  const pago = caja?.desglose?.[context.dataIndex];
                                  if (!pago) return `${context.label}: ${Utils.formatMoney(context.parsed, currencySymbol)}`;
                                  const simbolo = pago.moneda === 'VES' ? 'Bs.' : '$';
                                  return `${context.label}: ${Utils.formatMoney(pago.total, simbolo)} (equiv. ${Utils.formatMoney(pago.totalUSD, '$')})`;
                                }
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
                        <th>Cantidad</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosTop.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="empty-state">No hay datos</td>
                        </tr>
                      ) : (
                        productosTop.map((p, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.sku}</div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{p.cantidadVendida}</td>
                            <td style={{ fontWeight: 600 }}>{Utils.formatMoney(p.ingresos, currencySymbol)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                      {clientesTop.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="empty-state">No hay datos</td>
                        </tr>
                      ) : (
                        clientesTop.map((c, i) => (
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
