import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import lockIcon from '@iconify/icons-mdi/lock';
import lockOpenIcon from '@iconify/icons-mdi/lock-open';
import cashIcon from '@iconify/icons-mdi/cash';
import cashMultipleIcon from '@iconify/icons-mdi/cash-multiple';
import closeIcon from '@iconify/icons-mdi/close';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { CashRegisterReport } from '../components/ui/CashRegisterReport';

export function CajaPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();

  const [cajaActual, setCajaActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // Modals
  const [modalAbrir, setModalAbrir] = useState(false);
  const [modalCerrar, setModalCerrar] = useState(false);

  // Cierre
  const [montoInicial, setMontoInicial] = useState('0');
  const [montoFinal, setMontoFinal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preview datos del turno en tiempo real
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Reporte de cierre imprimible
  const [reporteCierre, setReporteCierre] = useState(null);
  const [reportePreview, setReportePreview] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [actual, hist, conf] = await Promise.all([
        API.getCajaActual().catch(() => null),
        API.getHistorialCaja(),
        API.getConfig().catch(() => null),
      ]);
      setCajaActual(actual);
      setHistorial(hist.cajas || hist || []);
      setConfig(conf);
    } catch (err) {
      showToast('Error cargando caja: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAbrirSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.abrirCaja(parseFloat(montoInicial || 0), observaciones);
      showToast('🎉 Caja abierta con éxito', 'success');
      setModalAbrir(false);
      setObservaciones('');
      loadData();
    } catch (err) {
      const mensaje = err?.message || 'No se pudo abrir la caja.';
      showToast(mensaje, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Load preview when opening close modal
  const handleOpenCerrar = async () => {
    setModalCerrar(true);
    setPreviewLoading(true);
    try {
      const data = await API.getPreviewCaja();
      setPreview(data);
      // Prefill the expected amount
      setMontoFinal(data.montoEsperadoCajaUSD || '');
    } catch (err) {
      showToast('No se pudo cargar la vista previa del turno', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCerrarSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cajaCerrada = await API.cerrarCaja(parseFloat(montoFinal || 0), observaciones);
      showToast('🎉 Caja cerrada con éxito', 'success');
      setModalCerrar(false);
      setMontoFinal('');
      setObservaciones('');
      // Show print report immediately
      setReporteCierre(cajaCerrada);
      setReportePreview(preview);
      setPreview(null);
      loadData();
    } catch (err) {
      showToast('Error cerrando caja: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isAbierta = cajaActual && cajaActual.estado === 'OPEN';

  // Difference computed from live montoFinal input vs preview
  const montoFinalNum = parseFloat(montoFinal) || 0;
  const montoEsperado = parseFloat(preview?.montoEsperadoCajaUSD) || 0;
  const diferencia = montoFinalNum - montoEsperado;

  return (
    <>
      <Header
        title="Cierre de Caja"
        subtitle="Apertura, cuadre e historial del turno de ventas"
        toggleSidebar={toggleSidebar}
        actions={
          isAbierta ? (
            <Button onClick={handleOpenCerrar} variant="danger" size="sm" icon="mdi:lock">
              Cerrar Caja
            </Button>
          ) : (
            <Button onClick={() => setModalAbrir(true)} variant="primary" size="sm" icon="mdi:lock-open">
              Abrir Caja
            </Button>
          )
        }
      />

      <div className="page-body">
        {/* ── Turno Activo ── */}
        {isAbierta && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Turno Activo</h3>
              <span className="badge badge-success">ABIERTA</span>
            </div>
            <div className="metric-grid">
              <div className="metric-card accent">
                <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{Utils.formatMoney(cajaActual.montoInicial || 0)}</div>
                  <div className="metric-label">Monto Inicial</div>
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-icon"><Icon icon={cashMultipleIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{Utils.formatMoney(cajaActual.ingresosEfectivo || 0)}</div>
                  <div className="metric-label">Ingresos Efectivo</div>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">{Utils.formatMoney(cajaActual.ingresosBanco || 0)}</div>
                  <div className="metric-label">Ingresos Banco</div>
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-icon"><Icon icon={alertIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">
                    {Utils.formatMoney(parseFloat(cajaActual.montoInicial || 0) + parseFloat(cajaActual.ingresosEfectivo || 0))}
                  </div>
                  <div className="metric-label">Esperado en Caja</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Historial de Cierres ── */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Historial de Cierres de Caja</h3>
            <Button variant="secondary" size="sm" icon="mdi:refresh" onClick={loadData}>Recargar</Button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Monto Inicial</th>
                  <th>Efectivo</th>
                  <th>Banco</th>
                  <th>Monto Final</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                  <th>Reporte</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="empty-state">Cargando historial de caja...</td></tr>
                ) : historial.length === 0 ? (
                  <tr><td colSpan={10} className="empty-state">No hay registros de apertura o cierre de caja</td></tr>
                ) : (
                  historial.map(c => {
                    const esperado = parseFloat(c.montoInicial || 0) + parseFloat(c.ingresosEfectivo || 0);
                    const final = parseFloat(c.montoFinalEfectivo ?? c.montoFinal ?? 0);
                    const diff = c.estado === 'CLOSED' ? final - esperado : null;

                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>@{c.usuario?.username || 'N/A'}</td>
                        <td>{Utils.formatDate(c.fechaApertura)}</td>
                        <td>{c.fechaCierre ? Utils.formatDate(c.fechaCierre) : '-'}</td>
                        <td>{Utils.formatMoney(c.montoInicial)}</td>
                        <td>{Utils.formatMoney(c.ingresosEfectivo || 0)}</td>
                        <td>{Utils.formatMoney(c.ingresosBanco || 0)}</td>
                        <td style={{ fontWeight: 700 }}>{c.montoFinalEfectivo ? Utils.formatMoney(c.montoFinalEfectivo) : '-'}</td>
                        <td>
                          {diff !== null ? (
                            <span style={{ fontWeight: 700, color: diff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {diff >= 0 ? '+' : ''}{Utils.formatMoney(diff)}
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          <span className={`badge ${c.estado === 'OPEN' ? 'badge-success' : 'badge-neutral'}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="mdi:printer"
                            onClick={() => { setReporteCierre(c); setReportePreview(null); }}
                            title="Imprimir Reporte de Cierre"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Modal Abrir ── */}
        {modalAbrir && (
          <div className="modal-overlay open">
            <div className="modal modal-md">
              <div className="modal-header">
                <h3 className="modal-title">Abrir Turno de Caja</h3>
                <button className="modal-close" onClick={() => setModalAbrir(false)}><Icon icon={closeIcon} className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleAbrirSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Monto Base Inicial en Caja (USD)</label>
                    <input
                      type="number" step="0.01" className="form-control"
                      value={montoInicial} onChange={e => setMontoInicial(e.target.value)} required
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Ingrese el dinero físico disponible en la caja al iniciar el turno.
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Observaciones</label>
                    <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalAbrir(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Abriendo...' : 'Abrir Turno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal Cerrar: Cuadre en Tiempo Real ── */}
        {modalCerrar && (
          <div className="modal-overlay open">
            <div className="modal modal-md">
              <div className="modal-header">
                <h3 className="modal-title">Cerrar Turno — Cuadre de Caja</h3>
                <button className="modal-close" onClick={() => setModalCerrar(false)}><Icon icon={closeIcon} className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleCerrarSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {previewLoading ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      Calculando totales del turno...
                    </div>
                  ) : preview ? (
                    <>
                      {/* Resumen del turno */}
                      <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '13px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Ingresos del Turno
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>💵 Efectivo</span>
                          <strong>{Utils.formatMoney(preview.desglose?.efectivo || 0)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>📱 Pago Móvil</span>
                          <strong>{Utils.formatMoney(preview.desglose?.pagoMovil || 0)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>💳 Punto</span>
                          <strong>{Utils.formatMoney(preview.desglose?.punto || 0)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>🏦 Transferencia</span>
                          <strong>{Utils.formatMoney(preview.desglose?.transferencia || 0)}</strong>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700 }}>Total Ingresos</span>
                          <strong style={{ color: 'var(--accent)', fontSize: '15px' }}>{Utils.formatMoney(preview.totalIngresosUSD)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span>Transacciones del turno</span>
                          <span><strong>{preview.totalTransacciones}</strong></span>
                        </div>
                      </div>

                      {/* Esperado en caja */}
                      <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Monto Esperado en Caja Física</span>
                        <strong style={{ fontSize: '15px' }}>{Utils.formatMoney(preview.montoEsperadoCajaUSD)}</strong>
                      </div>
                    </>
                  ) : null}

                  {/* Ingreso del cajero */}
                  <div className="form-group">
                    <label className="form-label">Monto Contado Físicamente (USD)</label>
                    <input
                      type="number" step="0.01" className="form-control"
                      value={montoFinal} onChange={e => setMontoFinal(e.target.value)} required
                    />
                  </div>

                  {/* Diferencia en tiempo real */}
                  {montoFinal !== '' && preview && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: diferencia >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                      border: `1px solid ${diferencia >= 0 ? 'var(--success)' : 'var(--danger)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 700
                    }}>
                      <span style={{ color: diferencia >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {diferencia >= 0 ? '✓ Sobrante' : '✗ Faltante'}
                      </span>
                      <span style={{ color: diferencia >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '18px' }}>
                        {diferencia >= 0 ? '+' : ''}{Utils.formatMoney(Math.abs(diferencia))}
                      </span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Observaciones / Descuadres</label>
                    <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalCerrar(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger" disabled={submitting}>
                    {submitting ? 'Cerrando...' : 'Confirmar Cierre de Turno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ── Reporte Imprimible ── */}
      {reporteCierre && (
        <CashRegisterReport
          cierre={reporteCierre}
          preview={reportePreview}
          config={config}
          onClose={() => { setReporteCierre(null); setReportePreview(null); }}
        />
      )}
    </>
  );
}
