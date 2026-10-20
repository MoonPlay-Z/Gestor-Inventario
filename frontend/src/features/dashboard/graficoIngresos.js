/* Configuración de Chart.js para el histórico de ingresos (función pura). */
import { Utils } from '../../services/api';

export function construirGraficoIngresos({ datos, moneda, isDark }) {
  const historico = Array.isArray(datos?.ingresosHistorico) ? [...datos.ingresosHistorico] : [];
  const serie = historico.reverse();

  const textColor = isDark ? '#9099c4' : '#4b5280';
  const gridColor = isDark ? '#2d3150' : '#e2e6f0';

  const data = {
    labels: serie.map((d) => d.mes),
    datasets: [
      {
        label: `Ingresos (${moneda})`,
        data: serie.map((d) => parseFloat(d.total)),
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
    ],
  };

  const options = {
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
          label: (contexto) =>
            `${contexto.dataset.label}: ${Utils.formatMoney(contexto.parsed.y, moneda)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: textColor,
          callback: (valor) => Utils.formatMoney(valor, moneda),
        },
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: textColor },
      },
    },
  };

  return { data, options };
}
