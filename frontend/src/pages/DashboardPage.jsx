import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import cashIcon from '@iconify/icons-mdi/cash';
import receiptIcon from '@iconify/icons-mdi/file-document-outline';
import timerIcon from '@iconify/icons-mdi/timer-sand';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { DolarWidget } from '../components/widgets/DolarWidget';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function DashboardPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const loadData = async () => {
    setLoading(true);
    try {
      const config = await API.getConfig();
      if (config?.moneda?.simbolo) {
        setCurrencySymbol(config.moneda.simbolo);
      }
      const data = await API.getDashboardStats();
      setStats(data);
    } catch (err) {
      showToast('Error cargando el dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Prepara datos de Chart.js
  const chartData = stats?.ingresosHistorico ? [...stats.ingresosHistorico].reverse() : [];
  const labels = chartData.map(d => d.mes);
  const values = chartData.map(d => parseFloat(d.total));

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9099c4' : '#4b5280';
  const gridColor = isDark ? '#2d3150' : '#e2e6f0';

  const lineChartData = {
    labels,
    datasets: [
      {
        label: `Ingresos (${currencySymbol})`,
        data: values,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: isDark ? '#1e2130' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const lineChartOptions = {
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
          label: (context) => `${context.dataset.label}: ${Utils.formatMoney(context.parsed.y, currencySymbol)}`
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

  const totalFacturas = stats?.totalesPorEstado?.reduce((acc, curr) => acc + curr._count.id, 0) || 0;

  return (
    <>
      <Header
        title="Dashboard Principal"
        subtitle="Resumen de rendimiento y métricas del negocio"
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={loadData} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Recargar
          </button>
        }
      />

      <div className="page-body">
        <DolarWidget />

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Cargando métricas...</p>
          </div>
        ) : (
          <>
            {/* Grid de Métricas */}
            <div className="metric-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card accent">
                <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{Utils.formatMoney(stats?.ingresosDelMes || 0, currencySymbol)}</div>
                  <div className="metric-label">Ingresos del Mes</div>
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-icon"><Icon icon={receiptIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{totalFacturas}</div>
                  <div className="metric-label">Facturas Emitidas</div>
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-icon"><Icon icon={timerIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{stats?.facturasVencidas || 0}</div>
                  <div className="metric-label">Facturas Vencidas</div>
                </div>
              </div>

              <div className="metric-card danger">
                <div className="metric-icon"><Icon icon={alertIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{stats?.productosStockBajo || 0}</div>
                  <div className="metric-label">Productos Stock Bajo</div>
                </div>
              </div>
            </div>

            {/* Gráfico y Tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">Histórico de Ingresos</h3>
                    <p className="card-subtitle">Evolución mensual de facturación</p>
                  </div>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Facturas Recientes</h3>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Monto Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.facturasRecientes?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-state">No hay facturas recientes</td>
                        </tr>
                      ) : (
                        stats?.facturasRecientes?.map(f => {
                          let estadoHtml = <span className="badge badge-danger">Anulada</span>;
                          if (f.estado === 'PAID') estadoHtml = <span className="badge badge-success">Pagada</span>;
                          else if (f.estado === 'PENDING') estadoHtml = <span className="badge badge-warning">Pendiente</span>;
                          else if (f.estado === 'PARTIALLY_PAID') estadoHtml = <span className="badge badge-info">Abonada</span>;

                          return (
                            <tr key={f.id}>
                              <td style={{ fontWeight: 600 }}>#{f.numeroFactura.toString().padStart(5, '0')}</td>
                              <td>
                                <div style={{ fontWeight: 500 }}>{f.cliente.razonSocial}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cliente.rifCedula}</div>
                              </td>
                              <td>{Utils.formatDate(f.fechaEmision)}</td>
                              <td style={{ fontWeight: 600 }}>{Utils.formatMoney(f.total, currencySymbol)}</td>
                              <td>{estadoHtml}</td>
                            </tr>
                          );
                        })
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
