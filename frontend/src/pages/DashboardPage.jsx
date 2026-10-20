import React, { useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import cashCheckIcon from '@iconify/icons-mdi/cash-check';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { DolarWidget } from '../components/widgets/DolarWidget';
import { MetricasDashboard } from '../components/dashboard/MetricasDashboard';
import { FacturasRecientes } from '../components/dashboard/FacturasRecientes';
import { useDashboardStats } from '../features/dashboard/useDashboardStats';
import { useCxcResumen } from '../features/dashboard/useCxcResumen';
import { construirGraficoIngresos } from '../features/dashboard/graficoIngresos';
import { Utils } from '../services/api';
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
import '../css/dashboard.css';

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

const PERIODOS = [
  { key: 'dia', label: 'Días', descripcion: 'Evolución diaria de facturación' },
  { key: 'semana', label: 'Semanas', descripcion: 'Evolución semanal de facturación' },
  { key: 'mes', label: 'Meses', descripcion: 'Evolución mensual de facturación' },
  { key: 'anio', label: 'Años', descripcion: 'Evolución anual de facturación' },
];

/** Widget de Cuentas por Cobrar (solo presentación). */
const ResumenCxc = ({ resumen, moneda }) => {
  if (!resumen) return null;

  const tarjetas = [
    { etiqueta: 'Total Pendiente', valor: resumen.totalPendiente, detalle: `${resumen.cantidadPendientes} facturas`, color: 'var(--text-primary)' },
    { etiqueta: 'Vencido', valor: resumen.totalVencido, detalle: `${resumen.cantidadVencidas} facturas`, color: '#ef4444' },
    { etiqueta: '0-30 días', valor: resumen.aging?.['0_30'], detalle: '', color: '#10b981' },
    { etiqueta: '61+ días', valor: resumen.aging?.['61_90'], detalle: '', color: '#f59e0b' },
  ];

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '24px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon icon={cashCheckIcon} style={{ color: 'var(--accent)' }} className="h-5 w-5" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Cuentas por Cobrar</h3>
        </div>
        <a href="/cxc" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
          Ver todas →
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {tarjetas.map(({ etiqueta, valor, detalle, color }) => (
          <div key={etiqueta} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{etiqueta}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color, marginTop: '4px' }}>{Utils.formatMoney(valor || 0, moneda)}</div>
            {detalle && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{detalle}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function DashboardPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [periodo, setPeriodo] = useState('mes');

  const alFallar = useCallback(
    (mensaje) => showToast('Error cargando el dashboard: ' + mensaje, 'error'),
    [showToast],
  );

  const { estado, moneda, recargar } = useDashboardStats(periodo, { alFallar });
  const cxcResumen = useCxcResumen();

  const datos = estado.datos;
  const cargando = estado.tipo === 'cargando' && !datos;
  const error = estado.tipo === 'error' ? estado.error : '';
  const periodoActivo = PERIODOS.find((p) => p.key === periodo) || PERIODOS[2];

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const grafico = construirGraficoIngresos({ datos, moneda, isDark });

  return (
    <>
      <Header
        title="Dashboard Principal"
        subtitle="Resumen de rendimiento y métricas del negocio"
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={recargar} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Recargar
          </button>
        }
      />

      <div className="page-body dash-body">
        <DolarWidget />

        <ResumenCxc resumen={cxcResumen} moneda={moneda} />

        {/* Un fallo de red ya no deja la página en blanco: se muestra el
            estado de error y se conservan las métricas anteriores si había. */}
        {error && (
          <div className="card dash-error" role="alert">
            <Icon icon={alertIcon} className="h-5 w-5" />
            <div>
              <strong>No se pudieron cargar las métricas.</strong>
              <p>{error}</p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={recargar}>
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Cargando métricas...</p>
          </div>
        ) : datos ? (
          <>
            <MetricasDashboard datos={datos} moneda={moneda} />

            <div className="dash-grid">
              <div className="card dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Histórico de Ingresos</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {periodoActivo.descripcion}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
                    {PERIODOS.map(({ key, label }) => (
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
                  <Line data={grafico.data} options={grafico.options} />
                </div>
              </div>

              <FacturasRecientes facturas={datos?.facturasRecientes} moneda={moneda} />
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default DashboardPage;
