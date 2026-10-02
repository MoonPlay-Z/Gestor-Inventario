import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { ReceiptModal } from '../components/ui/ReceiptModal';

export function VentasPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [config, setConfig] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, conf] = await Promise.all([
        API.getFacturas(),
        API.getConfig()
      ]);
      setFacturas(data.data || data.facturas || data || []);
      setConfig(conf);
    } catch (err) {
      showToast('Error al cargar ventas: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnular = async (id) => {
    if (!window.confirm('¿Estás seguro de anular esta factura? Se repondrá el stock de los productos.')) return;
    try {
      await API.anularFactura(id);
      showToast('Factura anulada con éxito', 'success');
      loadData();
    } catch (err) {
      showToast('Error al anular factura: ' + err.message, 'error');
    }
  };

  const handleVerFactura = async (id) => {
    try {
      const fullFactura = await API.getFactura(id);
      setSelectedFactura(fullFactura);
      setShowReceipt(true);
    } catch (err) {
      showToast('Error al cargar detalles de la factura: ' + err.message, 'error');
    }
  };

  return (
    <>
      <Header
        title="Historial de Ventas"
        subtitle="Registro completo de facturación e ingresos"
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={loadData} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Recargar
          </button>
        }
      />

      <div className="page-body">
        <div className="card">
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>N° Factura</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Cliente</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Fecha</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Total USD</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Total Bs.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="empty-state" style={{ padding: '32px' }}>Cargando historial...</td>
                  </tr>
                ) : facturas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state" style={{ padding: '32px' }}>No hay facturas registradas</td>
                  </tr>
                ) : (
                  facturas.map(f => (
                    <tr key={f.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>#{f.numeroFactura?.toString().padStart(5, '0')}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 500 }}>{f.cliente?.razonSocial || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cliente?.rifCedula}</div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{Utils.formatDate(f.fechaEmision)}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, textAlign: 'right' }}>{Utils.formatMoney(f.total)}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--success)', fontWeight: 600, textAlign: 'right' }}>
                        {(() => { const tasa = f.tasaDolar || f.tasaCambio || config?.tasaDolar || 1; const totalBS = (f.total || 0) * tasa; return `${totalBS.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`; })()}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        {f.estado === 'PAID' ? (
                          <span className="badge badge-success">Pagada</span>
                        ) : f.estado === 'PENDING' ? (
                          <span className="badge badge-warning">Pendiente</span>
                        ) : f.estado === 'PARTIALLY_PAID' ? (
                          <span className="badge badge-info">Abonada</span>
                        ) : (
                          <span className="badge badge-danger">Anulada</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleVerFactura(f.id)}
                            className="btn btn-ghost btn-sm"
                            title="Ver / Imprimir Factura"
                          >
                            <Icon icon="mdi:printer" className="h-4 w-4" />
                          </button>
                          
                          {f.estado !== 'VOIDED' && (
                            <button
                              onClick={() => handleAnular(f.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Anular"
                            >
                              <Icon icon="mdi:close-circle-outline" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showReceipt && (
        <ReceiptModal
          factura={selectedFactura}
          config={config}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
