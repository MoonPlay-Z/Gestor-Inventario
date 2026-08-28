import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import cashMultipleIcon from '@iconify/icons-mdi/cash-multiple';
import closeIcon from '@iconify/icons-mdi/close';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';

export function PagosPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalFactura, setModalFactura] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.getFacturas();
      const all = res.data || res.facturas || res || [];
      setFacturasPendientes(all.filter(f => f.estado === 'PENDING' || f.estado === 'PARTIALLY_PAID'));
    } catch (err) {
      showToast('Error al cargar cuentas por cobrar: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAbonarSubmit = async (e) => {
    e.preventDefault();
    if (!montoAbono || parseFloat(montoAbono) <= 0) {
      showToast('Monto inválido', 'error');
      return;
    }

    const paymentMethodMap = {
      'EFECTIVO': 'CASH',
      'PAGO_MOVIL': 'MOBILE_PAYMENT',
      'PUNTO': 'CREDIT_CARD',
      'TRANSFERENCIA': 'BANK_TRANSFER'
    };

    setSubmitting(true);
    try {
      await API.registrarPago({
        facturaId: modalFactura.id,
        monto: parseFloat(montoAbono),
        metodoPago: paymentMethodMap[metodoPago],
        referenciaTransaccion: referencia || null
      });
      showToast('🎉 Pago registrado correctamente', 'success');
      setModalFactura(null);
      setMontoAbono('');
      setReferencia('');
      loadData();
    } catch (err) {
      showToast('Error registrando pago: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Cuentas por Cobrar"
        subtitle="Registro de abonos y saldo de facturas pendientes"
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
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="empty-state">Cargando facturas...</td>
                  </tr>
                ) : facturasPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">No hay cuentas por cobrar pendientes</td>
                  </tr>
                ) : (
                  facturasPendientes.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>#{f.numeroFactura?.toString().padStart(5, '0')}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{f.cliente?.razonSocial || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cliente?.rifCedula}</div>
                      </td>
                      <td>{Utils.formatDate(f.fechaEmision)}</td>
                      <td style={{ fontWeight: 600 }}>{Utils.formatMoney(f.total)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--danger)' }}>
                        {Utils.formatMoney(f.saldoPendiente !== undefined ? f.saldoPendiente : f.total)}
                      </td>
                      <td>
                        <span className={`badge ${f.estado === 'PARTIALLY_PAID' ? 'badge-info' : 'badge-warning'}`}>
                          {f.estado === 'PARTIALLY_PAID' ? 'Abonada' : 'Pendiente'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setModalFactura(f);
                            setMontoAbono(f.saldoPendiente !== undefined ? f.saldoPendiente : f.total);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Icon icon={cashMultipleIcon} className="h-4 w-4" /> Registrar Abono
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Abonar */}
        {modalFactura && (
          <div className="modal-overlay open">
            <div className="modal modal-md">
              <div className="modal-header">
                <h3 className="modal-title">Registrar Abono a Factura #{modalFactura.numeroFactura}</h3>
                <button className="modal-close" onClick={() => setModalFactura(null)}><Icon icon={closeIcon} className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleAbonarSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Monto del Abono (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={montoAbono}
                      onChange={e => setMontoAbono(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Método de Pago</label>
                    <select
                      className="form-control"
                      value={metodoPago}
                      onChange={e => setMetodoPago(e.target.value)}
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="PAGO_MOVIL">Pago Móvil</option>
                      <option value="PUNTO">Punto de Venta</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>
                  {metodoPago !== 'EFECTIVO' && (
                    <div className="form-group">
                      <label className="form-label">Referencia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={referencia}
                        onChange={e => setReferencia(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalFactura(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Procesando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
