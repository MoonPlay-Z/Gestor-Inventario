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
  const [periodo, setPeriodo] = useState('mes');

  const loadData = async (periodoSeleccionado = periodo) => {
    setLoading(true);
    try {
      const config = await API.getConfig();
      if (config?.moneda?.simbolo) {
        setCurrencySymbol(config.moneda.simbolo);
      }
      const data = await API.getDashboardStats(periodoSeleccionado);
      setStats(data);
    } catch (err) {
      showToast('Error cargando el dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(periodo);
  }, [periodo]);

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
              <div className="metric-card accent" style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                color: '#fff'
              }}>
                <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon icon={cashIcon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="metric-value" style={{ color: '#fff' }}>{Utils.formatMoney(stats?.ingresosDelMes || 0, currencySymbol)}</div>
                  <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Ingresos del Mes</div>
                </div>
              </div>

              <div className="metric-card success" style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff'
              }}>
                <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon icon={receiptIcon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="metric-value" style={{ color: '#fff' }}>{totalFacturas}</div>
                  <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Facturas Emitidas</div>
                </div>
              </div>

              <div className="metric-card warning" style={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                color: '#fff'
              }}>
                <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon icon={timerIcon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="metric-value" style={{ color: '#fff' }}>{stats?.facturasVencidas || 0}</div>
                  <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Facturas Vencidas</div>
                </div>
              </div>

              <div className="metric-card danger" style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                color: '#fff'
              }}>
                <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Icon icon={alertIcon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="metric-value" style={{ color: '#fff' }}>{stats?.productosStockBajo || 0}</div>
                  <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Productos Stock Bajo</div>
                </div>
              </div>
            </div>

            {/* Gráfico y Tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Histórico de Ingresos</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {periodo === 'dia' && 'Evolución diaria de facturación'}
                      {periodo === 'semana' && 'Evolución semanal de facturación'}
                      {periodo === 'mes' && 'Evolución mensual de facturación'}
                      {periodo === 'anio' && 'Evolución anual de facturación'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
                    {[{ key: 'dia', label: 'Días' }, { key: 'semana', label: 'Semanas' }, { key: 'mes', label: 'Meses' }, { key: 'anio', label: 'Años' }].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setPeriodo(key)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                          background: periodo === key ? 'var(--accent)' : 'transparent',
                          color: periodo === key ? '#fff' : 'var(--text-secondary)',
                          boxShadow: periodo === key ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: '320px', width: '100%' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Facturas Recientes</h3>
                </div>
                <div className="table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Número</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Cliente</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Fecha</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Monto Total</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.facturasRecientes?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-state" style={{ padding: '32px' }}>No hay facturas recientes</td>
                        </tr>
                      ) : (
                        stats?.facturasRecientes?.map(f => {
                          let estadoHtml = <span className="badge badge-danger">Anulada</span>;
                          if (f.estado === 'PAID') estadoHtml = <span className="badge badge-success">Pagada</span>;
                          else if (f.estado === 'PENDING') estadoHtml = <span className="badge badge-warning">Pendiente</span>;
                          else if (f.estado === 'PARTIALLY_PAID') estadoHtml = <span className="badge badge-info">Abonada</span>;

                          return (
                            <tr key={f.id} style={{ transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>#{f.numeroFactura.toString().padStart(5, '0')}</td>
                              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 500 }}>{f.cliente.razonSocial}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cliente.rifCedula}</div>
                              </td>
                              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{Utils.formatDate(f.fechaEmision)}</td>
                              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, textAlign: 'right' }}>{Utils.formatMoney(f.total, currencySymbol)}</td>
                              <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>{estadoHtml}</td>
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
