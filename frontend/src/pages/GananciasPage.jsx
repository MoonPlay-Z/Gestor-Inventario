import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './GananciasPage.module.css';

const PERIODOS = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'anual', label: 'Anual' },
];

export function GananciasPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [periodo, setPeriodo] = useState('mensual');
  const [fecha, setFecha] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [comparar, setComparar] = useState(false);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);

  const formatearFecha = useCallback(() => {
    if (periodo === 'anual') return fecha;
    if (periodo === 'mensual') return fecha;
    return fecha;
  }, [periodo, fecha]);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        periodo,
        fecha: formatearFecha(),
        comparar: comparar.toString(),
      });
      const res = await fetch(`/api/reportes/ganancias?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar reporte');
      const data = await res.json();
      setDatos(data);
    } catch (err) {
      showToast('Error al cargar el reporte de ganancias', 'error');
    } finally {
      setCargando(false);
    }
  }, [token, periodo, fecha, comparar, showToast, formatearFecha]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ganancias</h1>

      <div className={styles.filters}>
        <select
          value={periodo}
          onChange={(e) => {
            setPeriodo(e.target.value);
            if (e.target.value === 'anual') {
              setFecha(new Date().getFullYear().toString());
            } else if (e.target.value === 'mensual') {
              const now = new Date();
              setFecha(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
            } else {
              const now = new Date();
              setFecha(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
            }
          }}
          className={styles.select}
        >
          {PERIODOS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {periodo === 'anual' ? (
          <input
            type="number"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={styles.input}
            min="1000"
            max="9999"
          />
        ) : periodo === 'mensual' ? (
          <input
            type="month"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={styles.input}
          />
        ) : (
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={styles.input}
          />
        )}

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={comparar}
            onChange={(e) => setComparar(e.target.checked)}
          />
          Comparar
        </label>
      </div>

      {cargando && <div className={styles.loading}>Cargando...</div>}

      {datos && (
        <>
          <div className={styles.cards}>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Ingresos</span>
              <span className={styles.cardValue}>${datos.ingresosTotales}</span>
            </div>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Costo Vendido</span>
              <span className={styles.cardValue}>${datos.costoVendido}</span>
            </div>
            <div className={styles.cardHighlight}>
              <span className={styles.cardLabel}>{datos.etiquetaGanancia || 'Ganancia'}</span>
              <span className={styles.cardValue}>
                {datos.gananciaBruta !== null ? `$${datos.gananciaBruta}` : 'N/A'}
              </span>
              {datos.margen !== null && (
                <span className={styles.cardSub}>Margen: {datos.margen}%</span>
              )}
            </div>
          </div>

          {datos.comparacion && (
            <div className={styles.comparison}>
              <h3>Comparación</h3>
              <p>
                Período anterior: ${datos.comparacion.gananciaAnterior}
                {' '}({datos.comparacion.variacion > 0 ? '+' : ''}{datos.comparacion.variacion}%)
              </p>
            </div>
          )}

          {datos.productosConPerdida?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Productos con Pérdida</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Venta</th>
                      <th>Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.productosConPerdida.map((p, i) => (
                      <tr key={i}>
                        <td>#{p.facturaId}</td>
                        <td>{new Date(p.fechaHora).toLocaleString('es-VE')}</td>
                        <td>{p.producto}</td>
                        <td>{p.cantidad} {p.unidad}</td>
                        <td>${p.subtotal}</td>
                        <td className={styles.loss}>${p.ganancia}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {datos.gananciaPorProducto && datos.gananciaPorProducto.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Ganancia por Producto</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>SKU</th>
                      <th>Cantidad Vendida</th>
                      <th>Ingresos</th>
                      <th>Costo</th>
                      <th>Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.gananciaPorProducto.map((p, i) => (
                      <tr key={i}>
                        <td>{p.nombre}</td>
                        <td>{p.sku}</td>
                        <td>{p.cantidadVendida}</td>
                        <td>${p.ingresos}</td>
                        <td>${p.costo}</td>
                        <td className={Number(p.ganancia) < 0 ? styles.loss : styles.profit}>
                          ${p.ganancia}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
