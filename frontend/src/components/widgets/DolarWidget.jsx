import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import editIcon from '@iconify/icons-mdi/pencil';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import refreshIcon from '@iconify/icons-mdi/refresh';
import flashIcon from '@iconify/icons-mdi/flash';
import historyIcon from '@iconify/icons-mdi/history';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import { API } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { esDeHoy, formatearFecha } from '../../utils/fechaVenezuela';

export function DolarWidget() {
  const { user, empresa, updateEmpresa } = useAuth();
  const { showToast } = useToast();
  const [tasa, setTasa] = useState('');
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [guardandoModo, setGuardandoModo] = useState(false);
  const [backfilling, setBackfilling] = useState(false);

  // Cambiar la tasa o su modo es exclusivo de la EMPRESA; los sub-usuarios
  // (CAJA, INVENTARIO, VISOR) ven el widget en modo lectura, porque el backend
  // les responde 403 en esos endpoints.
  const puedeEditar = user?.rol === 'EMPRESA' && !!empresa?.id;

  const tasaActual = Number(empresa?.tasaDolar) || 0;
  const alDia = esDeHoy(empresa?.tasaDolarActualizadaEn);
  const modoAuto = (empresa?.tasaDolarModo || 'AUTO') === 'AUTO';

  useEffect(() => {
    if (empresa?.tasaDolar) setTasa(String(empresa.tasaDolar));
  }, [empresa?.tasaDolar]);

  // El login guarda la empresa en localStorage, pero el modo y la fecha de la
  // última actualización cambian sin que el usuario haga nada (la tasa se
  // refresca sola cada día), así que se releen del backend al abrir el widget.
  useEffect(() => {
    if (!empresa?.id) return undefined;
    let cancelado = false;
    API.getEmpresaConfig(empresa.id)
      .then((fresca) => {
        if (!cancelado) updateEmpresa({ ...empresa, ...fresca });
      })
      .catch(() => {
        // Sin conexión se muestran los datos que ya estaban en la sesión.
      });
    return () => { cancelado = true; };
    // `updateEmpresa` cambia `empresa`; depender del objeto dispararía un bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.id]);

  const guardarTasa = async (valor) => {
    if (!Number.isFinite(valor) || valor <= 0) {
      showToast('Ingrese una tasa válida mayor a cero', 'error');
      return false;
    }
    if (!puedeEditar) {
      showToast('Solo el administrador de la empresa puede cambiar la tasa', 'error');
      return false;
    }
    setGuardando(true);
    try {
      // Guardar a mano deja la tasa marcada como "de hoy": la actualización
      // automática no la pisará hasta mañana, aunque el modo siga en automático.
      const actualizada = await API.updateEmpresaConfig(empresa.id, { tasaDolar: valor });
      updateEmpresa({ ...empresa, ...actualizada });
      showToast(
        modoAuto
          ? `✅ Tasa ${valor.toFixed(2)} Bs./$ guardada. La actualización automática la revisará mañana`
          : `✅ Tasa ${valor.toFixed(2)} Bs./$ guardada para ${actualizada.nombre}`,
        'success'
      );
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
      return true;
    } catch (err) {
      showToast('Error al guardar la tasa: ' + err.message, 'error');
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarManual = async () => {
    const valor = parseFloat(tasa);
    const ok = await guardarTasa(valor);
    if (ok) setEditando(false);
  };

  const handleActualizarAuto = async () => {
    setActualizando(true);
    try {
      // La consulta va por el backend (no desde el navegador): evita depender de
      // CORS contra dolarapi.com, reutiliza su caché de 6 h y no altera el modo.
      const actualizada = await API.actualizarTasaDolar();
      updateEmpresa({ ...empresa, ...actualizada });
      setTasa(String(actualizada.tasaDolar));
      showToast(`Tasa BCV actualizada: ${Number(actualizada.tasaDolar).toFixed(2)} Bs./$`, 'success');
    } catch (err) {
      console.error('Error actualizando tasa automática:', err);
      showToast('Error al consultar BCV: ' + err.message, 'error');
    } finally {
      setActualizando(false);
    }
  };

  const handleCambiarModo = async (activarAuto) => {
    if (!puedeEditar || guardandoModo) return;
    setGuardandoModo(true);
    try {
      const actualizada = await API.updateEmpresaConfig(empresa.id, {
        tasaDolarModo: activarAuto ? 'AUTO' : 'MANUAL',
      });
      updateEmpresa({ ...empresa, ...actualizada });
      showToast(
        activarAuto
          ? '✅ La tasa se actualizará sola cada día con la del BCV'
          : '✅ Actualización automática desactivada: la tasa solo cambia al guardarla',
        'success'
      );
    } catch (err) {
      showToast('Error al cambiar el modo de la tasa: ' + err.message, 'error');
    } finally {
      setGuardandoModo(false);
    }
  };

  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      await API.backfillTasaBcv();
      showToast('Tasa BCV asignada a pagos históricos', 'success');
    } catch (err) {
      showToast('Error en backfill: ' + err.message, 'error');
    } finally {
      setBackfilling(false);
    }
  };

  const chip = {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '2px 8px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
  };

  return (
    <div className="card" style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
            background: 'var(--success-dim)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{empresa?.monedaSimbolo || '$'}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>
                Tasa actual — {empresa?.nombre || 'Empresa'}
              </span>

              {/* Estado real de la tasa: si no es la de hoy, el POS está
                  cobrando con un valor viejo (o con la tasa global). */}
              {alDia ? (
                <span className="badge badge-success" style={chip} title={`Actualizada el ${formatearFecha(empresa?.tasaDolarActualizadaEn)}`}>
                  <Icon icon={checkCircleIcon} /> Al día
                </span>
              ) : (
                <span className="badge badge-warning" style={chip} title="La tasa guardada no es la de hoy">
                  <Icon icon={alertIcon} />
                  {empresa?.tasaDolarActualizadaEn
                    ? `Sin actualizar · ${formatearFecha(empresa.tasaDolarActualizadaEn)}`
                    : 'Sin fecha de actualización'}
                </span>
              )}

              <span className="badge badge-neutral" style={chip}>
                {modoAuto ? 'Automática (BCV)' : 'Manual'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {tasaActual > 0 ? tasaActual.toFixed(2) : 'N/D'}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bs. / USD</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {editando
                ? 'Modo edición manual'
                : modoAuto
                  ? 'Se actualiza sola todos los días con la tasa oficial del BCV'
                  : 'Solo cambia cuando la guardas manualmente'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {editando ? (
            <>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tasa}
                onChange={(e) => setTasa(e.target.value)}
                placeholder="Ej: 859.06"
                style={{ width: 120, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem' }}
                autoFocus
              />
              <button
                onClick={handleGuardarManual}
                disabled={guardando || guardado}
                className="btn btn-success btn-sm inline-flex items-center gap-2"
              >
                {guardado ? <><Icon icon={checkCircleIcon} className="h-4 w-4" /> Guardado</> : guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => { setEditando(false); setTasa(String(tasaActual || '')); }} className="btn btn-ghost btn-sm">
                Cancelar
              </button>
            </>
          ) : puedeEditar ? (
            <>
              <button
                onClick={handleActualizarAuto}
                disabled={actualizando || guardando}
                className="btn btn-primary btn-sm inline-flex items-center gap-2"
                title="Consultar la tasa oficial del BCV y aplicarla ahora"
              >
                {actualizando ? (
                  <> <span className="spinner" style={{width:14,height:14,borderWidth:2,marginRight:6}} /> Actualizando... </>
                ) : (
                  <> <Icon icon={refreshIcon} className="h-4 w-4" /> <Icon icon={flashIcon} className="h-4 w-4" /> Actualizar desde BCV </>
                )}
              </button>
              <button
                onClick={handleBackfill}
                disabled={backfilling || actualizando || guardando}
                className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                title="Asignar tasa BCV histórica a pagos sin tasa"
              >
                {backfilling ? (
                  <> <span className="spinner" style={{width:14,height:14,borderWidth:2,marginRight:6}} /> Procesando... </>
                ) : (
                  <> <Icon icon={historyIcon} className="h-4 w-4" /> Backfill Histórico </>
                )}
              </button>
              <button onClick={() => setEditando(true)} className="btn btn-secondary btn-sm inline-flex items-center gap-2" title="Escribir la tasa a mano">
                <Icon icon={editIcon} className="h-4 w-4" />
                Editar Manual
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Solo el administrador puede modificarla
            </span>
          )}
        </div>
      </div>

      {puedeEditar && !editando && (
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px',
            paddingTop: '12px', borderTop: '1px solid var(--border)',
            fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: guardandoModo ? 'wait' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={modoAuto}
            disabled={guardandoModo}
            onChange={(e) => handleCambiarModo(e.target.checked)}
          />
          Actualización automática diaria (tasa oficial del BCV)
          {guardandoModo && <span style={{ color: 'var(--text-muted)' }}>· guardando…</span>}
        </label>
      )}
    </div>
  );
}
