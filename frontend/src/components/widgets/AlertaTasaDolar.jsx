import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import checkCircleIcon from '@iconify/icons-mdi/check-circle-outline';
import refreshIcon from '@iconify/icons-mdi/refresh';
import pencilIcon from '@iconify/icons-mdi/pencil';
import { API } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fechaEnVenezuela, esDeHoy, formatearFecha } from '../../utils/fechaVenezuela';

// Bandera por empresa y por dispositivo: guarda el día en que ya se mostró el
// aviso para no repetirlo en cada recarga. Es "por dispositivo" a propósito,
// porque cada caja debe verlo al iniciar su propia sesión.
const claveAviso = (empresaId) => `tasaDolarAviso:${empresaId}`;

const chip = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  padding: '2px 8px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
};

/**
 * Recordatorio de la tasa del día.
 *
 * Aparece una sola vez por día al iniciar sesión. Si la tasa ya es la de hoy
 * (normalmente porque la actualización automática la trajo) se muestra como
 * confirmación; si no, invita a actualizarla desde el BCV o a escribirla a mano.
 *
 * Solo aplica a la EMPRESA: es el único rol al que el backend le permite cambiar
 * la tasa, y el aviso no tiene sentido para sus sub-usuarios.
 */
export function AlertaTasaDolar() {
  const { user, empresa, updateEmpresa } = useAuth();
  const { showToast } = useToast();

  const [estado, setEstado] = useState(null);
  const [listo, setListo] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tasaManual, setTasaManual] = useState('');
  const [editandoManual, setEditandoManual] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const puedeGestionar = user?.rol === 'EMPRESA' && !!empresa?.id;

  // Se relee la empresa del backend antes de decidir: el backend aplica la
  // actualización automática del día (si corresponde) y así el aviso refleja la
  // tasa que realmente se está cobrando, no la que quedó guardada en la sesión.
  useEffect(() => {
    if (!puedeGestionar) {
      setListo(true);
      return undefined;
    }
    let cancelado = false;
    API.getEmpresaConfig(empresa.id)
      .then((fresca) => {
        if (cancelado) return;
        setEstado(fresca);
        setTasaManual(fresca?.tasaDolar != null ? String(fresca.tasaDolar) : '');
        updateEmpresa({ ...empresa, ...fresca });
      })
      .catch(() => {
        // Sin conexión: se usa lo que ya estaba en la sesión.
        if (!cancelado) {
          setEstado(empresa);
          setTasaManual(empresa?.tasaDolar != null ? String(empresa.tasaDolar) : '');
        }
      })
      .finally(() => {
        if (!cancelado) setListo(true);
      });
    return () => { cancelado = true; };
    // Se ejecuta al montar y al cambiar de empresa; `empresa` se actualiza aquí
    // mismo, así que depender del objeto provocaría un bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.id, puedeGestionar]);

  // Una sola aparición por día.
  useEffect(() => {
    if (!listo || !estado?.id) return;
    const hoy = fechaEnVenezuela();
    const clave = claveAviso(estado.id);
    if (localStorage.getItem(clave) === hoy) return;
    localStorage.setItem(clave, hoy);
    setVisible(true);
  }, [listo, estado?.id]);

  const cerrar = () => setVisible(false);

  useEffect(() => {
    if (!visible) return undefined;
    const alPresionar = (e) => {
      if (e.key === 'Escape') cerrar();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [visible]);

  if (!visible || !estado) return null;

  const alDia = esDeHoy(estado.tasaDolarActualizadaEn);
  const modoAuto = (estado.tasaDolarModo || 'AUTO') === 'AUTO';
  const tasaActual = Number(estado.tasaDolar) || 0;

  const aplicar = (fresca) => {
    setEstado(fresca);
    setTasaManual(fresca?.tasaDolar != null ? String(fresca.tasaDolar) : '');
    updateEmpresa({ ...empresa, ...fresca });
  };

  const actualizarDesdeBCV = async () => {
    setActualizando(true);
    try {
      aplicar(await API.actualizarTasaDolar());
      showToast('Tasa del día actualizada desde el BCV', 'success');
      cerrar();
    } catch (err) {
      showToast('No se pudo actualizar la tasa: ' + err.message, 'error');
    } finally {
      setActualizando(false);
    }
  };

  const guardarManual = async () => {
    const valor = parseFloat(tasaManual);
    if (!Number.isFinite(valor) || valor <= 0) {
      showToast('Ingrese una tasa válida mayor a cero', 'error');
      return;
    }
    setGuardando(true);
    try {
      aplicar(await API.updateEmpresaConfig(estado.id, { tasaDolar: valor }));
      showToast(`✅ Tasa ${valor.toFixed(2)} Bs./$ guardada`, 'success');
      cerrar();
    } catch (err) {
      showToast('Error al guardar la tasa: ' + err.message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  const color = alDia ? 'var(--success)' : 'var(--warning)';
  const colorDim = alDia ? 'var(--success-dim)' : 'var(--warning-dim)';

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alerta-tasa-titulo"
        style={{ maxWidth: 520 }}
      >
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: colorDim, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Icon icon={alDia ? checkCircleIcon : alertIcon} style={{ fontSize: '1.3rem' }} />
            </span>
            <div>
              <h3 className="modal-title" id="alerta-tasa-titulo">Tasa del día</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {alDia
                  ? 'Ya está registrada. Puedes seguir facturando.'
                  : 'Revísala antes de facturar: se cobra con la última tasa guardada.'}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={cerrar} aria-label="Cerrar">
            <Icon icon="mdi:close" className="h-5 w-5" />
          </button>
        </div>

        <div
          style={{
            border: `1px solid ${color}`, borderRadius: 'var(--radius-md)',
            background: colorDim, padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {tasaActual > 0 ? tasaActual.toFixed(2) : 'N/D'}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Bs. / USD</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <span className="badge badge-neutral" style={chip}>
              {estado.tasaDolarActualizadaEn
                ? `${alDia ? 'Actualizada' : 'Guardada'} el ${formatearFecha(estado.tasaDolarActualizadaEn)}`
                : 'Sin fecha de actualización'}
            </span>
            <span className="badge badge-neutral" style={chip}>
              {modoAuto ? 'Automática (BCV)' : 'Manual'}
            </span>
          </div>
        </div>

        {!alDia && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '14px 0 0' }}>
            {modoAuto
              ? 'La actualización automática todavía no ha podido aplicar la tasa de hoy (el BCV no respondió o el equipo estuvo apagado).'
              : 'La empresa está en modo manual: la tasa solo cambia cuando la guardas.'}
          </p>
        )}

        {editandoManual && (
          <div style={{ marginTop: 14 }}>
            <label htmlFor="tasa-manual" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tasa en bolívares por dólar
            </label>
            <input
              id="tasa-manual"
              type="number"
              step="0.01"
              min="0"
              value={tasaManual}
              onChange={(e) => setTasaManual(e.target.value)}
              placeholder="Ej: 859.06"
              autoFocus
              style={{
                width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 6,
                border: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem',
              }}
            />
          </div>
        )}

        <div className="modal-footer">
          {editandoManual ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditandoManual(false)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-success btn-sm" onClick={guardarManual} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar tasa'}
              </button>
            </>
          ) : alDia ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={cerrar}>
              Entendido
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={cerrar}>
                Después
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                onClick={() => setEditandoManual(true)}
                disabled={actualizando}
              >
                <Icon icon={pencilIcon} className="h-4 w-4" />
                Escribir a mano
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm inline-flex items-center gap-2"
                onClick={actualizarDesdeBCV}
                disabled={actualizando}
              >
                {actualizando ? (
                  <> <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} /> Actualizando... </>
                ) : (
                  <> <Icon icon={refreshIcon} className="h-4 w-4" /> Actualizar desde BCV </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
