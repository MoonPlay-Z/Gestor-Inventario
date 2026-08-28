import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';

const ESTADO_BADGE = {
  APROBADA: 'badge-success',
  PENDIENTE: 'badge-warning',
  RECHAZADA: 'badge-danger',
};

const PLAN_LABEL = { monthly: 'Mensual', lifetime: 'Vitalicio' };

const SUB_BADGE = {
  trialing: { cls: 'badge-warning', label: 'Trial' },
  active: { cls: 'badge-success', label: 'Activo' },
  expired_trial: { cls: 'badge-danger', label: 'Trial Expirado' },
  canceled: { cls: 'badge-danger', label: 'Cancelado' },
  lifetime: { cls: 'badge-info', label: 'Vitalicio' },
};

export function ActivacionesPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();

  const [tab, setTab] = useState('empresas'); // 'historial' | 'empresas'
  const [activaciones, setActivaciones] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [activarTarget, setActivarTarget] = useState(null);
  const [activarForm, setActivarForm] = useState({ plan_type: 'monthly', meses: 1 });
  const [saving, setSaving] = useState(false);

  const loadHistorial = async () => {
    setLoading(true);
    try {
      const data = await API.getActivaciones();
      setActivaciones(data);
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
    finally { setLoading(false); }
  };

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const data = await API.getEmpresas();
      setEmpresas(data);
    } catch (err) { showToast('Error: ' + err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'historial') loadHistorial();
    else loadEmpresas();
  }, [tab]);

  // --- ACTIONS ---

  const openActivarModal = (u) => {
    setActivarTarget(u);
    setActivarForm({ plan_type: 'monthly', meses: 1 });
    setShowModal(true);
  };

  const handleActivar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { plan_type: activarForm.plan_type };
      if (activarForm.plan_type === 'monthly') payload.meses = activarForm.meses;
      
      await API.activarManual(activarTarget.id, payload);
      showToast(`✅ ${activarTarget.nombre} activado como plan ${PLAN_LABEL[activarForm.plan_type]}`, 'success');
      setShowModal(false);
      loadEmpresas();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleCambiarEstado = async (u) => {
    const nuevoEstado = !u.activo;
    const accion = nuevoEstado ? 'Desbloquear' : 'Bloquear / Suspender';
    if (!window.confirm(`¿Estás seguro de ${accion} a la empresa ${u.nombre}?`)) return;

    try {
      await API.cambiarEstadoEmpresa(u.id, nuevoEstado);
      showToast(`Empresa ${nuevoEstado ? 'desbloqueada' : 'bloqueada'} exitosamente`, 'success');
      loadEmpresas();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleEliminar = async (u) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const promptAns = window.prompt(`CUIDADO: Esto eliminará permanentemente la empresa ${u.nombre} y TODOS sus datos asociados (Facturas, Clientes, Productos).\n\nIngresa el código ${code} para confirmar:`);
    
    if (promptAns !== code) {
      if (promptAns !== null) showToast('Código incorrecto. Eliminación cancelada.', 'error');
      return;
    }

    try {
      await API.eliminarEmpresa(u.id);
      showToast(`Empresa ${u.nombre} ha sido eliminada por completo.`, 'success');
      loadEmpresas();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const tabStyle = (t) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.15s',
    background: tab === t ? 'var(--primary)' : 'var(--surface3)',
    color: tab === t ? '#fff' : 'var(--text-secondary)',
  });

  return (
    <>
      <Header
        title="Gestión de Empresas B2B"
        subtitle="Panel exclusivo para Super Administrador — Activaciones, auditoría y control de tenants"
        toggleSidebar={toggleSidebar}
        actions={
          <Button onClick={() => tab === 'historial' ? loadHistorial() : loadEmpresas()} variant="secondary" size="sm" icon="mdi:refresh">
            Recargar
          </Button>
        }
      />

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button style={tabStyle('empresas')} onClick={() => setTab('empresas')}>
            <Icon icon="mdi:domain" style={{ marginRight: '6px' }} />
            Gestión de Empresas
          </button>
          <button style={tabStyle('historial')} onClick={() => setTab('historial')}>
            <Icon icon="mdi:history" style={{ marginRight: '6px' }} />
            Auditoría de Activaciones
          </button>
        </div>

        {/* Gestión de Empresas (Tenants) */}
        {tab === 'empresas' && (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Estado de Acceso</th>
                    <th>Suscripción</th>
                    <th>Plan Vigente</th>
                    <th>Vence el</th>
                    <th style={{ minWidth: '220px' }}>Acciones Administrativas</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-state">Cargando empresas...</td></tr>
                  ) : empresas.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No hay empresas registradas</td></tr>
                  ) : empresas.map(u => {
                    const sub = SUB_BADGE[u.subscriptionStatus] || { cls: '', label: u.subscriptionStatus };
                    return (
                      <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.6 }}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>
                            {u.activo ? 'ACCESO PERMITIDO' : 'BLOQUEADO / SUSPENDIDO'}
                          </span>
                        </td>
                        <td><span className={`badge ${sub.cls}`}>{sub.label}</span></td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {u.planType ? PLAN_LABEL[u.planType] || u.planType : '—'}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {u.currentPeriodEnd ? Utils.formatDate(u.currentPeriodEnd) : (u.trialEndsAt ? `Trial: ${Utils.formatDate(u.trialEndsAt)}` : '—')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => openActivarModal(u)}
                              className="btn btn-primary btn-sm inline-flex items-center gap-1"
                              style={{ padding: '0.25rem 0.5rem' }}
                              title="Renovar / Activar Plan"
                            >
                              <Icon icon="mdi:calendar-check" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCambiarEstado(u)}
                              className={`btn btn-sm inline-flex items-center gap-1 ${u.activo ? 'btn-secondary' : 'btn-primary'}`}
                              style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border)' }}
                              title={u.activo ? 'Suspender Acceso' : 'Desbloquear Acceso'}
                            >
                              <Icon icon={u.activo ? 'mdi:account-cancel' : 'mdi:account-check'} className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEliminar(u)}
                              className="btn btn-sm inline-flex items-center gap-1"
                              style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                              title="Eliminar Empresa y Datos"
                            >
                              <Icon icon="mdi:delete-forever" className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Historial de activaciones */}
        {tab === 'historial' && (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Plan</th>
                    <th>Método Pago</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-state">Cargando historial...</td></tr>
                  ) : activaciones.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No hay solicitudes de activación registradas</td></tr>
                  ) : activaciones.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.usuario?.nombre || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{a.usuario?.username}</div>
                      </td>
                      <td>
                        <span className={`badge ${a.plan === 'lifetime' ? 'badge-info' : 'badge-warning'}`}>
                          {PLAN_LABEL[a.plan] || a.plan}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {a.metodoPago?.replace('_', ' ')}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.referencia || '—'}
                      </td>
                      <td>
                        <span className={`badge ${ESTADO_BADGE[a.estado] || ''}`}>{a.estado}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {Utils.formatDate(a.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal Activación Manual */}
      {showModal && activarTarget && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '420px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Renovar / Activar Plan</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><Icon icon="mdi:close" className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleActivar}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--surface3)', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activarTarget.nombre}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>@{activarTarget.username}</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tipo de Plan</label>
                  <select className="form-control" value={activarForm.plan_type}
                    onChange={e => setActivarForm(f => ({ ...f, plan_type: e.target.value }))}>
                    <option value="monthly">Mensual ($2 / mes)</option>
                    <option value="lifetime">Vitalicio ($20 pago único)</option>
                  </select>
                </div>

                {activarForm.plan_type === 'monthly' && (
                  <div className="form-group">
                    <label className="form-label">Período a otorgar (Meses)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={activarForm.meses}
                      onChange={e => setActivarForm(f => ({ ...f, meses: parseInt(e.target.value) || 1 }))} 
                      min="1" 
                      max="12" 
                      required 
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Se sumarán {activarForm.meses} mes(es) a la fecha de vencimiento actual (o desde hoy).
                    </div>
                  </div>
                )}
                
                {activarForm.plan_type === 'lifetime' && (
                  <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Icon icon="mdi:infinity" style={{ marginRight: '6px' }} />
                    Plan vitalicio — sin fecha de vencimiento
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Activando...' : '✅ Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
