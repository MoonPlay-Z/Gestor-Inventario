import React from 'react';
import { Icon } from '@iconify/react';
import cashIcon from '@iconify/icons-mdi/cash';
import receiptIcon from '@iconify/icons-mdi/file-document-outline';
import timerIcon from '@iconify/icons-mdi/timer-sand';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import { Utils } from '../../services/api';

const METRICAS = [
  {
    clave: 'ingresos',
    etiqueta: 'Ingresos del Mes',
    icono: cashIcon,
    degradado: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  {
    clave: 'facturas',
    etiqueta: 'Facturas Emitidas',
    icono: receiptIcon,
    degradado: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    clave: 'vencidas',
    etiqueta: 'Facturas Vencidas',
    icono: timerIcon,
    degradado: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    clave: 'stock',
    etiqueta: 'Productos Stock Bajo',
    icono: alertIcon,
    degradado: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
];

const Metrica = ({ etiqueta, valor, icono, degradado }) => (
  <div className="metric-card accent" style={{ background: degradado, border: 'none', color: '#fff' }}>
    <div className="metric-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
      <Icon icon={icono} className="h-6 w-6" />
    </div>
    <div>
      <div className="metric-value" style={{ color: '#fff' }}>{valor}</div>
      <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}>{etiqueta}</div>
    </div>
  </div>
);

export function MetricasDashboard({ datos, moneda }) {
  const totalFacturas =
    datos?.totalesPorEstado?.reduce((total, fila) => total + (fila?._count?.id || 0), 0) || 0;

  const valores = {
    ingresos: Utils.formatMoney(datos?.ingresosDelMes || 0, moneda),
    facturas: totalFacturas,
    vencidas: datos?.facturasVencidas || 0,
    stock: datos?.productosStockBajo || 0,
  };

  return (
    <div className="metric-grid" style={{ marginBottom: '24px' }}>
      {METRICAS.map(({ clave, ...metrica }) => (
        <Metrica key={clave} {...metrica} valor={valores[clave]} />
      ))}
    </div>
  );
}

export default MetricasDashboard;
