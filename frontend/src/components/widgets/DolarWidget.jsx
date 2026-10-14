import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import editIcon from '@iconify/icons-mdi/pencil';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import refreshIcon from '@iconify/icons-mdi/refresh';
import flashIcon from '@iconify/icons-mdi/flash';
import historyIcon from '@iconify/icons-mdi/history';
import { API } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export function DolarWidget() {
  const { empresa, updateEmpresa } = useAuth();
  const { showToast } = useToast();
  const [tasa, setTasa] = useState('');
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  useEffect(() => {
    if (empresa?.tasaDolar) {
      setTasa(String(empresa.tasaDolar));
    }
  }, [empresa?.tasaDolar]);

  const guardarTasa = async (valor) => {
    if (!Number.isFinite(valor) || valor <= 0) {
      showToast('Ingrese una tasa válida mayor a cero', 'error');
      return false;
    }
    if (!empresa?.id) {
      showToast('No hay empresa autenticada', 'error');
      return false;
    }
    setGuardando(true);
    try {
      const actualizada = await API.updateEmpresaConfig(empresa.id, { tasaDolar: valor });
      updateEmpresa(actualizada);
      showToast(`✅ Tasa ${valor.toFixed(2)} Bs./$ guardada para ${actualizada.nombre}`, 'success');
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
      setUltimaActualizacion(new Date().toLocaleString('es-VE'));
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
      // La consulta va por el backend (no desde el navegador): evita depender
      // de CORS contra dolarapi.com y reutiliza la caché de 6 h del servidor.
      const data = await API.getTasaBCV();
      const tasaBCV = parseFloat(data.tasa);

      if (!Number.isFinite(tasaBCV) || tasaBCV <= 0) {
        throw new Error('Tasa inválida recibida del BCV');
      }

      const ok = await guardarTasa(tasaBCV);
      if (ok) {
        setTasa(String(tasaBCV));
        showToast(`Tasa BCV actualizada: ${tasaBCV.toFixed(2)} Bs./$`, 'success');
      }
    } catch (err) {
      console.error('Error actualizando tasa automática:', err);
      showToast('Error al consultar BCV: ' + err.message, 'error');
    } finally {
      setActualizando(false);
    }
  };

  const [backfilling, setBackfilling] = useState(false);

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

  const tasaActual = empresa?.tasaDolar || 0;

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
                Tasa {editando ? 'Manual' : 'Actual'} — {empresa?.nombre || 'Empresa'}
              </span>
              {ultimaActualizacion && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: 4 }}>
                  Actualizado: {ultimaActualizacion}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {tasaActual > 0 ? Number(tasaActual).toFixed(2) : 'N/D'}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bs. / USD</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {editando ? 'Modo edición manual' : 'Configuración por empresa'}
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
          ) : (
            <>
              <button
                onClick={handleActualizarAuto}
                disabled={actualizando || guardando}
                className="btn btn-primary btn-sm inline-flex items-center gap-2"
                title="Consultar tasa oficial BCV y actualizar automáticamente"
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
              <button onClick={() => setEditando(true)} className="btn btn-secondary btn-sm inline-flex items-center gap-2" title="Editar tasa manual">
                <Icon icon={editIcon} className="h-4 w-4" />
                Editar Manual
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}