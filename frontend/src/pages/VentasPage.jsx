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
            <table>
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total USD</th>
                  <th>Total Bs.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="empty-state">Cargando historial...</td>
                  </tr>
                ) : facturas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">No hay facturas registradas</td>
                  </tr>
                ) : (
                  facturas.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>#{f.numeroFactura?.toString().padStart(5, '0')}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{f.cliente?.razonSocial || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cliente?.rifCedula}</div>
                      </td>
                      <td>{Utils.formatDate(f.fechaEmision)}</td>
                      <td style={{ fontWeight: 700 }}>{Utils.formatMoney(f.total)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {((f.total || 0) * (f.tasaDolar || 1)).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                      </td>
                      <td>
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
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
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
