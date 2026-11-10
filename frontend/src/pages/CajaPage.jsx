import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { CashRegisterReport } from '../components/ui/CashRegisterReport';
import { CierreTurnoModal } from '../components/ui/CierreTurnoModal';
import { useMoneda } from '../hooks/useMoneda';

export function CajaPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();

  const [cajaActual, setCajaActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const { empresa } = useAuth();
  const { usarExhibicion, setUsarExhibicion } = useMoneda();
  const tasaDolar = Number(empresa?.tasaDolar) || 0;

  const getTasaShift = (c) => {
    let tasaHist = 0;
    try {
      if (c?.arqueoDetalle) {
        const parsed = typeof c.arqueoDetalle === 'string' ? JSON.parse(c.arqueoDetalle) : c.arqueoDetalle;
        tasaHist = Number(parsed?.tasaCambio || 0);
      }
    } catch {}
    return tasaHist > 0 ? tasaHist : (tasaDolar > 0 ? tasaDolar : 1);
  };

  // Modals
  const [modalAbrir, setModalAbrir] = useState(false);
  const [modalCerrar, setModalCerrar] = useState(false);

  // Cierre y apertura
  const [montoInicialUSD, setMontoInicialUSD] = useState('0');
  const [montoInicialVES, setMontoInicialVES] = useState('0');
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
      setHistorial(Array.isArray(hist) ? hist : (hist.data || []));
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
      const valUSD = montoInicialUSD === '' ? 0 : parseFloat(montoInicialUSD);
      const valVES = montoInicialVES === '' ? 0 : parseFloat(montoInicialVES);

      if (isNaN(valUSD) || valUSD < 0) {
        showToast('Fondo inicial USD inválido', 'error');
        return;
      }
      if (isNaN(valVES) || valVES < 0) {
        showToast('Fondo inicial Bs. inválido', 'error');
        return;
      }

      await API.abrirCaja({
        montoInicial: valUSD,
        montoInicialUSD: valUSD,
        montoInicialVES: valVES,
        observaciones: observaciones?.trim() || null,
      });

      showToast('🎉 Caja abierta con éxito', 'success');
      setModalAbrir(false);
      setObservaciones('');
      setMontoInicialUSD('0');
      setMontoInicialVES('0');
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

  const handleCerrarSubmit = async (montoFinalArg, observacionesArg, arqueoDetalle) => {
    setSubmitting(true);
    try {
      const cajaCerrada = await API.cerrarCaja(montoFinalArg, observacionesArg, arqueoDetalle);
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
          <div className="caja-header-actions">
            {isAbierta ? (
              <Button onClick={handleOpenCerrar} variant="danger" size="sm" icon="mdi:lock">
                Cerrar Caja
              </Button>
            ) : (
              <Button onClick={() => { setMontoInicialUSD('0'); setMontoInicialVES('0'); setObservaciones(''); setModalAbrir(true); }} variant="primary" size="sm" icon="mdi:lock-open">
                Abrir Caja
              </Button>
            )}
            <Button as={Link} to="/pos" variant="primary" size="sm" icon="mdi:cart" className="caja-mobile-pos-action">
              Realizar Ventas
            </Button>
          </div>
        }
      />

      <div className="page-body caja-page">
        {/* ── Turno Activo ── */}
        {isAbierta && (
          <div className="card caja-turno-card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Turno Activo</h3>
              <span className="badge badge-success">ABIERTA</span>
            </div>
            <div className="metric-grid">
              <div className="metric-card accent">
                <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">$ {Number(cajaActual.montoInicial || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  {Number(cajaActual.montoInicialVES || 0) > 0 && (
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                      + Bs. {Number(cajaActual.montoInicialVES).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                  <div className="metric-label">Fondo Inicial Gaveta</div>
                </div>
              </div>

              <div className="metric-card success">
                <div className="metric-icon"><Icon icon={cashMultipleIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">
                    {usarExhibicion ? (
                      `Bs. ${(Number(cajaActual.ingresosEfectivo || 0) * (tasaDolar || 1)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      `$ ${Number(cajaActual.ingresosEfectivo || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </div>
                  {Number(cajaActual.ingresosEfectivoVES || 0) > 0 && (
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' }}>
                      + Bs. {Number(cajaActual.ingresosEfectivoVES).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                  <div className="metric-label">Ingresos Efectivo Divisa</div>
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon"><Icon icon={cashIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">
                    {(() => {
                      const bancoVES = Number(cajaActual.ingresosBancoVES || 0);
                      const bancoUSD = Number(cajaActual.ingresosBanco || 0);
                      const totalVES = bancoVES > 0 ? bancoVES : (tasaDolar > 0 ? bancoUSD * tasaDolar : 0);
                      return usarExhibicion
                        ? `Bs. ${totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `$ ${bancoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    })()}
                  </div>
                  <div className="metric-label">Ingresos Banco (Punto / Móvil)</div>
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-icon"><Icon icon={alertIcon} className="h-6 w-6" /></div>
                <div>
                  <div className="metric-value">
                    {(() => {
                      const espUSD = Number(cajaActual.montoInicial || 0) + Number(cajaActual.ingresosEfectivo || 0);
                      return usarExhibicion
                        ? `Bs. ${(espUSD * (tasaDolar || 1)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `$ ${espUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    })()}
                  </div>
                  <div className="metric-label">Esperado Efectivo Gaveta</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Historial de Cierres ── */}
        <div className="card cash-history-card">
          <div className="card-header flex flex-wrap items-center justify-between gap-4 mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h3 className="card-title m-0">Historial de Cierres de Caja</h3>
              <div style={{ display: 'inline-flex', gap: 4, background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setUsarExhibicion(false)}
                  className={`btn btn-sm ${!usarExhibicion ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                  title="Ver montos en Dólares ($)"
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => setUsarExhibicion(true)}
                  className={`btn btn-sm ${usarExhibicion ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                  title="Ver montos en Bolívares (Bs.)"
                >
                  Bs. VES
                </button>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon="mdi:refresh" onClick={loadData}>Recargar</Button>
          </div>
          <div className="table-wrapper">
            <table className="cash-history-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Apertura</th>
                  <th>Cierre</th>
                  <th>Fondo Inicial</th>
                  <th>Efectivo Divisa ($)</th>
                  <th>Efectivo Bs.</th>
                  <th>Banco (Bs.)</th>
                  <th>Monto Final</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                  <th>Reporte</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="empty-state">Cargando historial de caja...</td></tr>
                ) : historial.length === 0 ? (
                  <tr><td colSpan={10} className="empty-state">No hay registros de apertura o cierre de caja</td></tr>
                ) : (
                  historial.map(c => {
                    const tasaShift = getTasaShift(c);
                    const efUSD = Number(c.ingresosEfectivo || 0);
                    const efVES = Number(c.ingresosEfectivoVES || 0);
                    const bancoUSD = Number(c.ingresosBanco || 0);
                    const bancoVES = Number(c.ingresosBancoVES || 0);
                    const totalBancoVES = bancoVES > 0 ? bancoVES : (tasaShift > 0 ? bancoUSD * tasaShift : 0);
                    const finalUSD = parseFloat(c.montoFinal ?? 0);
                    const esperadoUSD = parseFloat(c.montoInicial || 0) + efUSD;
                    const diffUSD = c.estado === 'CLOSED' ? finalUSD - esperadoUSD : null;

                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>@{c.usuario?.username || 'N/A'}</td>
                        <td>{Utils.formatDate(c.fechaApertura)}</td>
                        <td>{c.fechaCierre ? Utils.formatDate(c.fechaCierre) : '-'}</td>
                        <td>
                          <div>$ {Number(c.montoInicial || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          {Number(c.montoInicialVES || 0) > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                              + Bs. {Number(c.montoInicialVES).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </td>
                        <td>
                          {usarExhibicion ? (
                            <div>
                              <div style={{ fontWeight: 700 }}>
                                Bs. {(efUSD * tasaShift).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                ($ {efUSD.toFixed(2)})
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontWeight: 600 }}>
                              $ {efUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: efVES > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            Bs. {efVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 600 }}>
                              Bs. {totalBancoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {bancoUSD > 0 && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                (≈ $ {bancoUSD.toFixed(2)})
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {usarExhibicion ? (
                            <div>
                              <div>Bs. {(finalUSD * tasaShift).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                ($ {finalUSD.toFixed(2)})
                              </div>
                            </div>
                          ) : (
                            <span>$ {finalUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          )}
                        </td>
                        <td>
                          {diffUSD !== null ? (
                            <span style={{ fontWeight: 700, color: diffUSD >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {usarExhibicion ? (
                                `${diffUSD >= 0 ? '+' : ''}Bs. ${(diffUSD * tasaShift).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              ) : (
                                `${diffUSD >= 0 ? '+' : ''}$ ${diffUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              )}
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
          <div className="caja-mobile-history">
            {loading ? (
              <p className="caja-mobile-message">Cargando historial de caja...</p>
            ) : historial.length === 0 ? (
              <p className="caja-mobile-message">No hay registros de apertura o cierre de caja</p>
            ) : (
              historial.map((c) => {
                const tasaShift = getTasaShift(c);
                const efUSD = Number(c.ingresosEfectivo || 0);
                const efVES = Number(c.ingresosEfectivoVES || 0);
                const bancoUSD = Number(c.ingresosBanco || 0);
                const bancoVES = Number(c.ingresosBancoVES || 0);
                const totalBancoVES = bancoVES > 0 ? bancoVES : (tasaShift > 0 ? bancoUSD * tasaShift : 0);
                const finalUSD = parseFloat(c.montoFinal ?? 0);
                const esperadoUSD = parseFloat(c.montoInicial || 0) + efUSD;
                const diffUSD = c.estado === 'CLOSED' ? finalUSD - esperadoUSD : null;

                return (
                  <article key={c.id} className="caja-mobile-record">
                    <div className="caja-mobile-record-head">
                      <strong>@{c.usuario?.username || 'N/A'}</strong>
                      <span className={`badge ${c.estado === 'OPEN' ? 'badge-success' : 'badge-neutral'}`}>
                        {c.estado}
                      </span>
                    </div>
                    <div className="caja-mobile-record-dates">
                      <div><span>Apertura</span><strong>{Utils.formatDate(c.fechaApertura)}</strong></div>
                      <div><span>Cierre</span><strong>{c.fechaCierre ? Utils.formatDate(c.fechaCierre) : '-'}</strong></div>
                    </div>
                    <dl className="caja-mobile-record-amounts">
                      <div>
                        <dt>Fondo inicial</dt>
                        <dd>
                          $ {Number(c.montoInicial || 0).toFixed(2)}
                          {Number(c.montoInicialVES || 0) > 0 && ` + Bs. ${Number(c.montoInicialVES).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Efectivo Divisa ($)</dt>
                        <dd>
                          {usarExhibicion
                            ? `Bs. ${(efUSD * tasaShift).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($ ${efUSD.toFixed(2)})`
                            : `$ ${efUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Efectivo Bs.</dt>
                        <dd>Bs. {efVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                      </div>
                      <div>
                        <dt>Banco (Bs.)</dt>
                        <dd>
                          Bs. {totalBancoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {bancoUSD > 0 && ` (≈ $ ${bancoUSD.toFixed(2)})`}
                        </dd>
                      </div>
                      <div className="caja-mobile-total">
                        <dt>Monto final</dt>
                        <dd>
                          {usarExhibicion
                            ? `Bs. ${(finalUSD * tasaShift).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ($ ${finalUSD.toFixed(2)})`
                            : `$ ${finalUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </dd>
                      </div>
                      <div>
                        <dt>Diferencia</dt>
                        <dd className={diffUSD === null ? '' : diffUSD >= 0 ? 'caja-difference-positive' : 'caja-difference-negative'}>
                          {diffUSD === null ? '-' : (
                            usarExhibicion
                              ? `${diffUSD >= 0 ? '+' : ''}Bs. ${(diffUSD * tasaShift).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `${diffUSD >= 0 ? '+' : ''}$ ${diffUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </dd>
                      </div>
                    </dl>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon="mdi:printer"
                      className="caja-mobile-report"
                      onClick={() => { setReporteCierre(c); setReportePreview(null); }}
                      title="Imprimir Reporte de Cierre"
                    >
                      Ver reporte
                    </Button>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* ── Modal Abrir ── */}
        {modalAbrir && (
          <div className="modal-overlay open">
            <div className="modal modal-md" style={{ maxWidth: 580, width: '96%' }}>
              <div className="modal-header">
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon icon={lockOpenIcon} className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  Abrir Turno de Caja
                </h3>
                <button className="modal-close" onClick={() => setModalAbrir(false)}>
                  <Icon icon={closeIcon} className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAbrirSubmit}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Info visual de métodos */}
                  <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, marginRight: 4 }}>
                      Métodos habilitados:
                    </span>
                    {[
                      { icon: 'mdi:currency-usd', label: 'Efectivo USD', color: '#16a34a' },
                      { icon: 'mdi:cash', label: 'Efectivo Bs.', color: '#2563eb' },
                      { icon: 'mdi:credit-card-outline', label: 'Punto / Tarjeta', color: '#0284c7' },
                      { icon: 'mdi:cellphone-wireless', label: 'Pago Móvil', color: '#7c3aed' },
                      { icon: 'mdi:bank-transfer', label: 'Transferencia / Digital', color: '#059669' },
                    ].map(({ icon, label, color }) => (
                      <span key={label} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600,
                        padding: '3px 9px', borderRadius: 999,
                        background: `${color}16`, color,
                        border: `1px solid ${color}30`,
                      }}>
                        <Icon icon={icon} style={{ fontSize: '0.95rem' }} />
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Grid de Fondos Iniciales Efectivo USD y VES */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                    gap: '12px',
                  }}>
                    {/* Fondo inicial USD */}
                    <div style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                          <Icon icon="mdi:currency-usd" style={{ color: '#16a34a', fontSize: '1.2rem' }} />
                          Efectivo Dólares (USD)
                        </label>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(22,163,74,0.12)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)'
                        }}>
                          USD $
                        </span>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center',
                        border: '2px solid var(--border)', borderRadius: 8,
                        padding: '8px 12px', background: 'var(--bg-primary)',
                        overflow: 'hidden', boxSizing: 'border-box', width: '100%',
                      }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: '#16a34a', marginRight: 8, flexShrink: 0 }}>$</span>
                        <input
                          type="number" step="0.01" min="0"
                          value={montoInicialUSD}
                          onChange={e => setMontoInicialUSD(e.target.value)}
                          onFocus={e => e.target.select()}
                          placeholder="0.00"
                          style={{
                            flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none',
                            fontWeight: 800, fontSize: 18,
                            background: 'transparent', color: 'var(--text-primary)',
                          }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>USD</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        Billetes físicos en USD en gaveta al inicio (fondo de cambio).
                      </div>
                    </div>

                    {/* Fondo inicial VES */}
                    <div style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                          <Icon icon="mdi:cash" style={{ color: '#2563eb', fontSize: '1.2rem' }} />
                          Efectivo Bolívares (VES)
                        </label>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(37,99,235,0.12)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.25)'
                        }}>
                          Bs. VES
                        </span>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center',
                        border: '2px solid var(--border)', borderRadius: 8,
                        padding: '8px 12px', background: 'var(--bg-primary)',
                        overflow: 'hidden', boxSizing: 'border-box', width: '100%',
                      }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#2563eb', marginRight: 8, flexShrink: 0 }}>Bs.</span>
                        <input
                          type="number" step="0.01" min="0"
                          value={montoInicialVES}
                          onChange={e => setMontoInicialVES(e.target.value)}
                          onFocus={e => e.target.select()}
                          placeholder="0.00"
                          style={{
                            flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none',
                            fontWeight: 800, fontSize: 18,
                            background: 'transparent', color: 'var(--text-primary)',
                          }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>VES</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        Papel moneda en Bs. disponible en gaveta para vuelto al iniciar.
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-secondary)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px dashed var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <Icon icon="mdi:information-outline" style={{ fontSize: '1rem', color: 'var(--accent)', flexShrink: 0 }} />
                    <span>El sistema llevará el arqueo físico y control de vueltos independiente para cada moneda al cerrar el turno.</span>
                  </div>

                  {/* Observaciones */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Observaciones</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Notas de inicio de turno..."
                      value={observaciones}
                      onChange={e => setObservaciones(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalAbrir(false)}>Cancelar</button>
                  <Button type="submit" variant="primary" icon="mdi:lock-open" disabled={submitting}>
                    {submitting ? 'Abriendo...' : 'Abrir Turno'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal Cerrar: Cuadre de Caja ── */}
        {modalCerrar && (
          previewLoading ? (
            <div className="modal-overlay open">
              <div className="modal modal-md">
                <div className="modal-body" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  Calculando totales del turno...
                </div>
              </div>
            </div>
          ) : preview ? (
            <CierreTurnoModal
              preview={preview}
              submitting={submitting}
              onCancel={() => { setModalCerrar(false); setPreview(null); }}
              onConfirm={handleCerrarSubmit}
            />
          ) : null
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
