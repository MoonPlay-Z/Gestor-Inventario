import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import flashIcon from '@iconify/icons-mdi/flash';
import currencyUsdIcon from '@iconify/icons-mdi/currency-usd';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import { API } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export function DolarWidget() {
  const [rateData, setRateData] = useState({
    tasa: 0,
    fuente: 'BCV',
    ultima: '',
    status: 'loading' // 'loading', 'online', 'error'
  });
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const { showToast } = useToast();

  const fetchRate = async () => {
    setRateData(prev => ({ ...prev, status: 'loading' }));
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const tasa = parseFloat(data.promedio);
      const fuente = data.fuente || 'BCV';
      const ultima = data.fechaActualizacion
        ? new Date(data.fechaActualizacion).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })
        : 'Fecha no disponible';

      setRateData({
        tasa,
        fuente,
        ultima,
        status: 'online'
      });
    } catch (err) {
      console.error('Error fetching dolar rate:', err);
      setRateData({
        tasa: 0,
        fuente: 'BCV',
        ultima: 'No se pudo consultar la tasa del BCV.',
        status: 'error'
      });
    }
  };

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = async () => {
    if (!rateData.tasa) return;
    setApplying(true);
    try {
      const currentConfig = await API.getConfig();
      const updatedConfig = {
        ...currentConfig,
        moneda: {
          ...currentConfig.moneda,
          tasaDolar: rateData.tasa
        }
      };
      await API.saveConfig(updatedConfig);
      showToast(`✅ Tasa ${rateData.tasa.toFixed(2)} Bs./$ aplicada al sistema`, 'success');
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3000);
    } catch (err) {
      showToast('Error al aplicar la tasa: ' + err.message, 'error');
    } finally {
      setApplying(false);
    }
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
            <Icon icon={currencyUsdIcon} className="h-6 w-6" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: rateData.status === 'online' ? 'var(--success)' : rateData.status === 'error' ? 'var(--danger)' : 'var(--text-muted)',
                animation: rateData.status === 'online' ? 'dolar-pulse 1.8s ease-in-out infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: rateData.status === 'online' ? 'var(--success)' : 'var(--text-muted)' }}>
                Tasa Oficial BCV {rateData.status === 'online' ? '(En línea)' : rateData.status === 'loading' ? '(Consultando...)' : '(Sin conexión)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {rateData.status === 'online' ? rateData.tasa.toFixed(2) : 'N/D'}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bs. / USD</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {rateData.status === 'online' ? `Última actualización: ${rateData.ultima} — ${rateData.fuente}` : rateData.ultima}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={fetchRate} className="btn btn-secondary btn-sm inline-flex items-center gap-2" title="Actualizar tasa BCV">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Actualizar
          </button>
          {rateData.status === 'online' && (
            <button
              onClick={handleApply}
              disabled={applying || appliedSuccess}
              className="btn btn-success btn-sm inline-flex items-center gap-2"
            >
              {appliedSuccess ? <><Icon icon={checkCircleIcon} className="h-4 w-4" /> Tasa Aplicada</> : applying ? 'Aplicando...' : <><Icon icon={flashIcon} className="h-4 w-4" /> Aplicar Tasa al Sistema</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
