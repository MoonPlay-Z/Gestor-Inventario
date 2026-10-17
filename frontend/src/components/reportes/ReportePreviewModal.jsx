import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Utils } from '../../services/api';
import { desgloseUnidadesPorProducto, sumarCampo } from '../../utils/reportes';
import pdfIcon from '@iconify/icons-mdi/file-pdf-box';
import csvIcon from '@iconify/icons-mdi/file-delimited';

// Los montos del reporte se expresan igual que en el PDF/CSV: siempre en USD.
const m = (valor) => Utils.formatMoney(valor, '$');
const fechaHora = (valor) => (valor ? new Date(valor).toLocaleString('es-VE') : '—');

// Las tablas largas (el período anual puede tener cientos de facturas) se
// muestran completas dentro de un contenedor con scroll propio: la vista previa
// no oculta filas, solo evita que la ventana crezca sin control.
const SCROLL_TABLA = { maxHeight: '320px', overflow: 'auto' };
const TH_FIJO = { position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-secondary)' };
const CELDA_NUM = { textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

// Igual que en las exportaciones, una sección sin datos no se dibuja: lo que
// se ve en la vista previa es exactamente lo que se escribe en el archivo.
function Seccion({ titulo, descripcion, formatos, children }) {
  return (
    <section style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>{titulo}</h4>
        {formatos && (
          <span className="badge badge-neutral" style={{ fontSize: '0.66rem' }}>{formatos}</span>
        )}
      </div>
      {descripcion && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          {descripcion}
        </p>
      )}
      <div className="table-wrapper" style={{ marginTop: '8px', ...SCROLL_TABLA }}>
        {children}
      </div>
    </section>
  );
}

const TarjetaResumen = ({ titulo, valor, color }) => (
  <div
    style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '12px 16px',
      background: 'var(--surface)',
    }}
  >
    <div
      style={{
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}
    >
      {titulo}
    </div>
    <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px', color }}>{valor}</div>
  </div>
);

/**
 * Vista previa del reporte que se descarga. Recibe los mismos datos que usan
 * las exportaciones (`datos`), de modo que lo que se ve aquí es exactamente lo
 * que se escribe en el PDF y el CSV.
 */
export function ReportePreviewModal({
  datos,
  etiqueta,
  verGanancias,
  descargando,
  onClose,
  onDescargarPDF,
  onDescargarCSV,
}) {
  const { reporte, detalle, productos = [], clientes = [] } = datos || {};
  const porProducto = reporte?.gananciaPorProducto || [];
  const lineasFactura = detalle?.detalle || [];
  const perdidas = verGanancias ? (reporte?.productosConPerdida || []) : [];

  // Es un modal grande: cerrar con Escape es lo esperable.
  useEffect(() => {
    const alPulsar = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [onClose]);

  const gananciaNegativa = reporte && reporte.gananciaBruta !== null && Number(reporte.gananciaBruta) < 0;
  const colorGanancia = gananciaNegativa ? '#b42318' : '#059669';

  // Mismas notas que acompañan al PDF y al CSV.
  const notas = [];
  if (verGanancias && reporte && reporte.facturasSinCosto > 0) {
    notas.push(
      reporte.facturasConCosto === 0
        ? `No fue posible calcular la ganancia: ${reporte.facturasSinCosto} factura(s) no tienen costo histórico completo. No se usó el costo actual del inventario como sustituto.`
        : `${reporte.facturasSinCosto} factura(s) sin costo histórico completo se excluyeron de la ganancia total; no se usó el costo actual del inventario como sustituto.`
    );
  }
  if (gananciaNegativa) {
    notas.push(
      'La ganancia del período es negativa porque las pérdidas detalladas superan las ganancias de las demás ventas con costo histórico completo.'
    );
  }
  if (detalle?.paginacion && detalle.paginacion.total > lineasFactura.length) {
    notas.push(
      `El detalle por factura está limitado a ${lineasFactura.length} de ${detalle.paginacion.total} facturas del período. El resumen por producto y las pérdidas cubren la totalidad.`
    );
  }

  const hayContenido =
    porProducto.length > 0 || lineasFactura.length > 0 || perdidas.length > 0 ||
    productos.length > 0 || clientes.length > 0;

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal-lg" style={{ maxWidth: '1100px', width: '95%' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Previsualización del reporte</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Este es el contenido que se descargará. Los montos están en USD.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            <Icon icon="mdi:close" className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* ── Encabezado del documento ─────────────────────────────────── */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              {verGanancias ? 'Reporte de Ganancias por Producto' : 'Reporte de Ventas'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
              Período: {etiqueta || 'N/A'} · Generado: {new Date().toLocaleString('es-VE')}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Montos en USD · Cantidades en la unidad del producto (gramos convertidos a kg)
            </p>
          </div>

          {/* ── Resumen ejecutivo ────────────────────────────────────────── */}
          {verGanancias && reporte && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginTop: '16px',
              }}
            >
              <TarjetaResumen titulo="Ingresos s/imp." valor={m(reporte.ingresosTotales)} color="#10b981" />
              <TarjetaResumen titulo="Costo vendido" valor={m(reporte.costoVendido)} color="#f59e0b" />
              <TarjetaResumen
                titulo={reporte.etiquetaGanancia || 'Ganancia'}
                valor={reporte.gananciaBruta === null ? 'No disponible' : m(reporte.gananciaBruta)}
                color={colorGanancia}
              />
              <TarjetaResumen
                titulo="Margen"
                valor={reporte.margen === null ? 'No disponible' : `${reporte.margen}%`}
                color="#5a5a64"
              />
            </div>
          )}

          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '10px 0 0' }}>
            El PDF incluye el resumen, la ganancia por producto, el detalle por factura y las
            pérdidas. El CSV incluye además los productos más vendidos y los clientes principales.
          </p>

          {!hayContenido && (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p>No hay datos para el período seleccionado.</p>
            </div>
          )}

          {/* ── Ganancia por producto ────────────────────────────────────── */}
          {porProducto.length > 0 && (
            <Seccion
              titulo={`${verGanancias ? 'Ganancia por producto' : 'Ingresos por producto'} (${porProducto.length})`}
              formatos="PDF + CSV"
            >
              <table>
                <thead>
                  <tr>
                    <th style={TH_FIJO}>Producto</th>
                    <th style={TH_FIJO}>SKU</th>
                    <th style={TH_FIJO}>Unidad</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Cantidad</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Ingresos s/imp.</th>
                    {verGanancias && <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Costo</th>}
                    {verGanancias && <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Ganancia</th>}
                  </tr>
                </thead>
                <tbody>
                  {porProducto.map((p, i) => (
                    <tr key={`${p.sku || p.nombre}-${i}`}>
                      <td>{p.nombre}</td>
                      <td>{p.sku || '—'}</td>
                      <td>{p.unidad || '—'}</td>
                      <td style={CELDA_NUM}>
                        {Number(p.cantidadVendida).toLocaleString('es-VE', { maximumFractionDigits: 3 })}
                      </td>
                      <td style={CELDA_NUM}>{m(p.ingresos)}</td>
                      {verGanancias && <td style={CELDA_NUM}>{m(p.costo)}</td>}
                      {verGanancias && (
                        <td style={{ ...CELDA_NUM, fontWeight: 600, color: Number(p.ganancia) < 0 ? '#b42318' : undefined }}>
                          {m(p.ganancia)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, background: 'var(--bg-secondary)' }}>
                    <td colSpan={3}>Total General</td>
                    {/* La cantidad no se suma entre unidades distintas. */}
                    <td style={CELDA_NUM}>{desgloseUnidadesPorProducto(porProducto)}</td>
                    <td style={CELDA_NUM}>{m(sumarCampo(porProducto, 'ingresos'))}</td>
                    {verGanancias && <td style={CELDA_NUM}>{m(sumarCampo(porProducto, 'costo'))}</td>}
                    {verGanancias && (
                      <td style={{ ...CELDA_NUM, color: colorGanancia }}>
                        {m(sumarCampo(porProducto, 'ganancia'))}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </Seccion>
          )}

          {/* ── Detalle por factura ──────────────────────────────────────── */}
          {lineasFactura.length > 0 && (
            <Seccion
              titulo={`Detalle por factura (${lineasFactura.length})`}
              descripcion="Una fila por factura emitida en el período. La ganancia usa el costo histórico de cada producto en el momento de la venta; el asterisco marca los costos estimados."
              formatos="PDF + CSV"
            >
              <table>
                <thead>
                  <tr>
                    <th style={TH_FIJO}>Factura</th>
                    <th style={TH_FIJO}>Referencia</th>
                    <th style={TH_FIJO}>Cliente</th>
                    <th style={TH_FIJO}>Fecha y hora</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Total (USD)</th>
                    {verGanancias && <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Ganancia (USD)</th>}
                  </tr>
                </thead>
                <tbody>
                  {lineasFactura.map((item, i) => (
                    <tr key={`${item.facturaId}-${i}`}>
                      <td>#{item.facturaId}</td>
                      <td>{item.referencia}</td>
                      <td>{item.cliente}</td>
                      <td>{fechaHora(item.fechaHora)}</td>
                      <td style={CELDA_NUM}>{m(item.montoTotal)}</td>
                      {verGanancias && (
                        <td style={CELDA_NUM}>
                          {item.costoDesconocido
                            ? 'No disponible'
                            : `${item.costoEstimado ? '* ' : ''}${m(item.ganancia)}`}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, background: 'var(--bg-secondary)' }}>
                    <td colSpan={4}>Total facturado</td>
                    <td style={CELDA_NUM}>{m(detalle?.totalIngresos)}</td>
                    {verGanancias && (
                      <td style={CELDA_NUM}>
                        {detalle?.gananciaTotal === null || detalle?.gananciaTotal === undefined
                          ? 'No disponible'
                          : m(detalle.gananciaTotal)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </Seccion>
          )}

          {/* ── Pérdidas ─────────────────────────────────────────────────── */}
          {verGanancias && perdidas.length > 0 && (
            <Seccion
              titulo={`Líneas de venta con pérdida (${perdidas.length})`}
              descripcion="Cada línea aparece porque el costo histórico del producto supera el precio de venta sin impuestos."
              formatos="PDF + CSV"
            >
              <table>
                <thead>
                  <tr>
                    <th style={TH_FIJO}>Factura</th>
                    <th style={TH_FIJO}>Fecha y hora</th>
                    <th style={TH_FIJO}>Cliente</th>
                    <th style={TH_FIJO}>Producto</th>
                    <th style={TH_FIJO}>Cantidad</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Subtotal s/imp. (USD)</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Ganancia (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {perdidas.map((item, i) => (
                    <tr key={`${item.facturaId}-${item.producto}-${i}`}>
                      <td>#{item.facturaId}</td>
                      <td>{fechaHora(item.fechaHora)}</td>
                      <td>{item.cliente}</td>
                      <td>{item.producto}</td>
                      <td>{`${Number(item.cantidad).toLocaleString('es-VE')} ${item.unidad || ''}`.trim()}</td>
                      <td style={CELDA_NUM}>{m(item.subtotal)}</td>
                      <td style={{ ...CELDA_NUM, color: '#b42318', fontWeight: 600 }}>{m(item.ganancia)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, background: 'var(--bg-secondary)' }}>
                    <td colSpan={5}>Total pérdidas</td>
                    <td style={CELDA_NUM}>{m(sumarCampo(perdidas, 'subtotal'))}</td>
                    <td style={{ ...CELDA_NUM, color: '#b42318' }}>{m(sumarCampo(perdidas, 'ganancia'))}</td>
                  </tr>
                </tfoot>
              </table>
            </Seccion>
          )}

          {/* ── Productos más vendidos (solo CSV) ────────────────────────── */}
          {productos.length > 0 && (
            <Seccion
              titulo={`Productos más vendidos (${productos.length})`}
              formatos="Solo CSV"
            >
              <table>
                <thead>
                  <tr>
                    <th style={TH_FIJO}>Nombre</th>
                    <th style={TH_FIJO}>SKU</th>
                    <th style={TH_FIJO}>Unidad</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Cantidad</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => (
                    <tr key={`${p.sku || p.nombre}-${i}`}>
                      <td>{p.nombre}</td>
                      <td>{p.sku || '—'}</td>
                      <td>{p.unidad || '—'}</td>
                      <td style={CELDA_NUM}>{p.cantidadVendida}</td>
                      <td style={CELDA_NUM}>{m(p.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Seccion>
          )}

          {/* ── Clientes principales (solo CSV) ──────────────────────────── */}
          {clientes.length > 0 && (
            <Seccion
              titulo={`Clientes principales (${clientes.length})`}
              formatos="Solo CSV"
            >
              <table>
                <thead>
                  <tr>
                    <th style={TH_FIJO}>Nombre</th>
                    <th style={TH_FIJO}>RIF</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Facturas</th>
                    <th style={{ ...TH_FIJO, ...CELDA_NUM }}>Total compras</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c, i) => (
                    <tr key={`${c.rif || c.nombre}-${i}`}>
                      <td>{c.nombre}</td>
                      <td>{c.rif || '—'}</td>
                      <td style={CELDA_NUM}>{c.cantidadFacturas}</td>
                      <td style={CELDA_NUM}>{m(c.totalCompras)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Seccion>
          )}

          {/* ── Notas ────────────────────────────────────────────────────── */}
          {notas.length > 0 && (
            <section style={{ marginTop: '24px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 6px' }}>Notas</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {notas.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={!!descargando}>
            Cerrar
          </button>
          <button
            type="button"
            className="btn btn-secondary inline-flex items-center gap-2"
            onClick={onDescargarCSV}
            disabled={!!descargando}
          >
            <Icon icon={csvIcon} className="h-4 w-4" />
            {descargando === 'csv' ? 'Generando…' : 'Descargar CSV'}
          </button>
          <button
            type="button"
            className="btn btn-primary inline-flex items-center gap-2"
            onClick={onDescargarPDF}
            disabled={!!descargando}
          >
            <Icon icon={pdfIcon} className="h-4 w-4" />
            {descargando === 'pdf' ? 'Generando…' : 'Descargar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
