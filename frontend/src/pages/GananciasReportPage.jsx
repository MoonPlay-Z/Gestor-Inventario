import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './GananciasReportPage.module.css';

const PERIODOS = [
  { value: 'diario', label: 'Diario', fecha: () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
  }},
  { value: 'semanal', label: 'Semanal', fecha: () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
  }},
  { value: 'mensual', label: 'Mensual', fecha: () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;
  }},
  { value: 'anual', label: 'Anual', fecha: () => `${new Date().getFullYear()}` },
];

const POR_PAGINA = 10;

const ETIQUETA_GANANCIA = {
  diario: 'Ganancia del Dia',
  semanal: 'Ganancia de la Semana',
  mensual: 'Ganancia del Mes',
  anual: 'Ganancia del Ano',
};

function formatMoney(val, symbol = '$') {
  const num = parseFloat(val) || 0;
  const formatted = num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${formatted}`;
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(Math.abs(value) / max * 100, 100) : 0;
  return (
    <div className={styles.miniBarTrack}>
      <div
        className={styles.miniBarFill}
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function GananciasReportPage() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [periodo, setPeriodo] = useState('mensual');
  const [fecha, setFecha] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;
  });
  const [comparar, setComparar] = useState(true);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [paginaProductos, setPaginaProductos] = useState(1);
  const [paginaPerdidas, setPaginaPerdidas] = useState(1);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ periodo, fecha, comparar: comparar.toString() });
      const [configRes, gananciasRes] = await Promise.all([
        fetch('/api/config', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/reportes/ganancias?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (configRes.ok) {
        const cfg = await configRes.json();
        if (cfg?.moneda?.simbolo) setCurrencySymbol(cfg.moneda.simbolo);
      }
      if (!gananciasRes.ok) throw new Error('Error al cargar ganancias');
      const data = await gananciasRes.json();
      setDatos(data);
    } catch (err) {
      showToast('Error al cargar el reporte de ganancias', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, periodo, fecha, comparar, showToast]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    setPaginaProductos(1);
    setPaginaPerdidas(1);
  }, [periodo, fecha, comparar]);

  const totales = useMemo(() => {
    if (!datos?.gananciaPorProducto?.length) return null;
    return datos.gananciaPorProducto.reduce((acc, p) => ({
      cantidad: acc.cantidad + (parseFloat(p.cantidadVendida) || 0),
      ingresos: acc.ingresos + (parseFloat(p.ingresos) || 0),
      costo: acc.costo + (parseFloat(p.costo) || 0),
      ganancia: acc.ganancia + (parseFloat(p.ganancia) || 0),
    }), { cantidad: 0, ingresos: 0, costo: 0, ganancia: 0 });
  }, [datos]);

  const maxGanancia = useMemo(() => {
    if (!datos?.gananciaPorProducto?.length) return 1;
    return Math.max(...datos.gananciaPorProducto.map(p => Math.abs(parseFloat(p.ganancia) || 0)), 1);
  }, [datos]);

  const totalPaginasProductos = datos?.gananciaPorProducto?.length
    ? Math.ceil(datos.gananciaPorProducto.length / POR_PAGINA)
    : 1;

  const totalPaginasPerdidas = datos?.productosConPerdida?.length
    ? Math.ceil(datos.productosConPerdida.length / POR_PAGINA)
    : 1;

  const handlePeriodoChange = (nuevo) => {
    setPeriodo(nuevo);
    const p = PERIODOS.find(x => x.value === nuevo);
    if (p) setFecha(p.fecha());
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="2" fill="currentColor"/>
            </svg>
            Reporte financiero
          </div>
          <h1 className={styles.title}>Ganancias</h1>
          <p className={styles.subtitle}>{datos?.etiqueta || 'Cargando...'}</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.periodBtn}
            onClick={() => setComparar(!comparar)}
            aria-pressed={comparar}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 1v12M3 4L7 1l4 3M3 10l4 3 4-3"/>
            </svg>
            Comparar
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.segmented}>
          {PERIODOS.map(p => (
            <button
              key={p.value}
              className={`${styles.segmentBtn} ${periodo === p.value ? styles.segmentBtnActive : ''}`}
              onClick={() => handlePeriodoChange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.dateInputWrap}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.dateIcon}>
            <rect x="1" y="2" width="12" height="11" rx="2"/>
            <path d="M1 5h12M4 1v2M10 1v2"/>
          </svg>
          {periodo === 'anual' ? (
            <input
              type="number"
              className={styles.dateInput}
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              min="1000"
              max="9999"
            />
          ) : periodo === 'mensual' ? (
            <input
              type="month"
              className={styles.dateInput}
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          ) : (
            <input
              type="date"
              className={styles.dateInput}
              value={fecha}
              onChange={e => setFecha(e.target.value)}
            />
          )}
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}/>
          <span>Cargando datos...</span>
        </div>
      )}

      {datos && !loading && (
        <>
          <div className={styles.bentoGrid}>
            <div className={`${styles.card} ${styles.cardIngresos}`}>
              <div className={styles.cardLabel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 1L1 4v6l6 3 6-3V4L7 1z"/>
                  <path d="M1 4l6 3 6-3M7 7v6"/>
                </svg>
                Subtotal sin Impuestos
              </div>
              <div className={styles.cardValue}>{formatMoney(datos.ingresosTotales, currencySymbol)}</div>
              <div className={styles.cardSub}>Base imponible · no incluye IVA</div>
              {datos.comparacion && (
                <div className={`${styles.cardChange} ${datos.comparacion.variacion >= 0 ? styles.changeUp : styles.changeDown}`}>
                  {datos.comparacion.variacion >= 0 ? '+' : ''}{datos.comparacion.variacion}% vs anterior
                </div>
              )}
            </div>

            <div className={`${styles.card} ${styles.cardCosto}`}>
              <div className={styles.cardLabel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M7 3v8M5 5.5c0-1 1-1.5 2-1.5s2 .5 2 1.5-1 1.5-2 2-2 1-2 2 1 1.5 2 1.5 2-.5 2-1.5"/>
                </svg>
                Costo Vendido
              </div>
              <div className={styles.cardValue}>{formatMoney(datos.costoVendido, currencySymbol)}</div>
              <div className={styles.cardSub}>{datos.facturasConCosto} facturas con costo</div>
            </div>

            <div className={`${styles.card} ${styles.cardGanancia}`}>
              <div className={styles.cardLabel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 1v12M3 4L7 1l4 3M3 10l4 3 4-3"/>
                </svg>
                {ETIQUETA_GANANCIA[periodo] || 'Ganancia'}
              </div>
              <div className={`${styles.cardValue} ${parseFloat(datos.gananciaBruta) < 0 ? styles.gananciaNegativa : styles.gananciaPositiva}`}>
                {datos.gananciaBruta !== null ? formatMoney(datos.gananciaBruta, currencySymbol) : 'N/A'}
              </div>
              {datos.margen !== null && (
                <div className={styles.cardSub}>Margen: {datos.margen}%</div>
              )}
            </div>

            <div className={`${styles.card} ${styles.cardMargen}`}>
              <div className={styles.cardLabel}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 12L12 2M4 2h2v2M10 8h2v2"/>
                </svg>
                Margen
              </div>
              <div className={styles.cardValue}>{datos.margen !== null ? `${datos.margen}%` : 'N/A'}</div>
              {datos.comparacion && (
                <div className={`${styles.cardChange} ${datos.comparacion.variacion >= 0 ? styles.changeUp : styles.changeDown}`}>
                  {datos.comparacion.variacion >= 0 ? '+' : ''}{datos.comparacion.variacion}%
                </div>
              )}
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Ganancia por Producto</h2>
              <span className={styles.tableCount}>{datos.gananciaPorProducto?.length || 0} productos</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Unidad</th>
                    <th className={styles.thRight}>Cantidad</th>
                    <th className={styles.thRight}>Ingresos</th>
                    <th className={styles.thRight}>Costo</th>
                    <th className={styles.thRight}>Ganancia</th>
                    <th className={styles.thBar}>Distribucion</th>
                  </tr>
                </thead>
                <tbody>
                  {(datos.gananciaPorProducto || [])
                    .slice((paginaProductos - 1) * POR_PAGINA, paginaProductos * POR_PAGINA)
                    .map((p, i) => {
                      const g = parseFloat(p.ganancia) || 0;
                      return (
                        <tr key={p.productoId || i} className={p.productoId === null ? styles.rowSinProducto : ''}>
                          <td>
                            <div className={styles.productName}>{p.nombre}</div>
                          </td>
                          <td className={styles.skuCell}>{p.sku}</td>
                          <td className={styles.unidadCell}>{p.unidad || '—'}</td>
                          <td className={styles.tdRight}>{parseFloat(p.cantidadVendida).toFixed(2)}</td>
                          <td className={styles.tdRight}>{formatMoney(p.ingresos, currencySymbol)}</td>
                          <td className={styles.tdRight}>{formatMoney(p.costo, currencySymbol)}</td>
                          <td className={`${styles.tdRight} ${g < 0 ? styles.textDanger : styles.textSuccess}`}>
                            {formatMoney(g, currencySymbol)}
                          </td>
                          <td className={styles.barCell}>
                            <MiniBar value={g} max={maxGanancia} color={g < 0 ? '#ef4444' : '#10b981'} />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                {totales && (
                  <tfoot>
                    <tr className={styles.totalRow}>
                      <td colSpan={3}>Total General</td>
                      <td className={styles.tdRight}>{totales.cantidad.toFixed(2)}</td>
                      <td className={styles.tdRight}>{formatMoney(totales.ingresos, currencySymbol)}</td>
                      <td className={styles.tdRight}>{formatMoney(totales.costo, currencySymbol)}</td>
                      <td className={`${styles.tdRight} ${totales.ganancia < 0 ? styles.textDanger : styles.textSuccess}`}>
                        {formatMoney(totales.ganancia, currencySymbol)}
                      </td>
                      <td/>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {totalPaginasProductos > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={paginaProductos === 1}
                  onClick={() => setPaginaProductos(p => p - 1)}
                >
                  Anterior
                </button>
                <span className={styles.pageInfo}>Pagina {paginaProductos} de {totalPaginasProductos}</span>
                <button
                  className={styles.pageBtn}
                  disabled={paginaProductos >= totalPaginasProductos}
                  onClick={() => setPaginaProductos(p => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          {datos.productosConPerdida?.length > 0 && (
            <div className={`${styles.tableCard} ${styles.tableCardDanger}`}>
              <div className={styles.tableHeader}>
                <h2 className={`${styles.tableTitle} ${styles.textDanger}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{verticalAlign:'middle',marginRight:8}}>
                    <path d="M8 1L1 14h14L8 1z"/>
                    <path d="M8 6v4M8 11.5v.5"/>
                  </svg>
                  Productos con Perdida ({datos.productosConPerdida.length})
                </h2>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th>Unidad</th>
                      <th className={styles.thRight}>Cantidad</th>
                      <th className={styles.thRight}>Venta</th>
                      <th className={styles.thRight}>Perdida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.productosConPerdida
                      .slice((paginaPerdidas - 1) * POR_PAGINA, paginaPerdidas * POR_PAGINA)
                      .map((item, i) => (
                        <tr key={i}>
                          <td>#{item.facturaId}</td>
                          <td>{new Date(item.fechaHora).toLocaleDateString('es-VE')}</td>
                          <td>{item.cliente}</td>
                          <td>{item.producto}</td>
                          <td>{item.unidad || '—'}</td>
                          <td className={styles.tdRight}>{parseFloat(item.cantidad).toFixed(2)}</td>
                          <td className={styles.tdRight}>{formatMoney(item.subtotal, currencySymbol)}</td>
                          <td className={`${styles.tdRight} ${styles.textDanger}`}>{formatMoney(item.ganancia, currencySymbol)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {totalPaginasPerdidas > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={paginaPerdidas === 1}
                    onClick={() => setPaginaPerdidas(p => p - 1)}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageInfo}>Pagina {paginaPerdidas} de {totalPaginasPerdidas}</span>
                  <button
                    className={styles.pageBtn}
                    disabled={paginaPerdidas >= totalPaginasPerdidas}
                    onClick={() => setPaginaPerdidas(p => p + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          )}

          {datos.facturasSinCosto > 0 && (
            <div className={styles.alertCard}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="7"/>
                <path d="M8 5v4M8 10.5v.5"/>
              </svg>
              <span>{datos.facturasSinCosto} factura(s) excluidas por falta de costo de compra en sus productos. La ganancia mostrada es parcial.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
