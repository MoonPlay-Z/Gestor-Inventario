import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from './Button';
import { Utils } from '../../services/api';

export function ReceiptModal({ factura, onClose, config, type = 'factura' }) {
  if (!factura) return null;
  const isCotizacion = type === 'cotizacion';
  const numero = isCotizacion ? factura.numero : factura.numeroFactura;

  const handlePrint = () => {
    window.print();
  };

  const currency = config?.moneda?.simbolo || '$';
  const empresa = config?.empresa || {};

  return (
    <div className="modal-overlay open receipt-overlay" onClick={onClose}>
      <div className="modal receipt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '100%' }}>
        <div className="modal-header no-print">
          <h3 className="modal-title">
            {isCotizacion ? 'Cotización' : 'Factura'} #{numero?.toString().padStart(5, '0')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} icon="mdi:close" />
        </div>

        <div className="modal-body receipt-content" style={{ padding: '24px', background: '#fff', color: '#000', fontSize: '14px' }}>
          {/* Cabecera de la factura */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold' }}>{empresa.nombre || 'Mi Empresa'}</h2>
            {empresa.documento && <div style={{ fontSize: '13px' }}>ID Fiscal: {empresa.documento}</div>}
            {empresa.direccion && <div style={{ fontSize: '13px' }}>{empresa.direccion}</div>}
            {empresa.telefono && <div style={{ fontSize: '13px' }}>Tel: {empresa.telefono}</div>}
            <div style={{ margin: '15px 0', borderBottom: '1px dashed #ccc' }}></div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
              {isCotizacion ? 'PRESUPUESTO' : (['PAID', 'PARTIALLY_PAID'].includes(factura.estado) ? 'RECIBO DE PAGO' : 'NOTA DE ENTREGA')}
            </h3>
            <div style={{ fontSize: '13px' }}>N° {numero?.toString().padStart(5, '0')}</div>
            <div style={{ fontSize: '13px' }}>Fecha: {Utils.formatDate(factura.fechaEmision || new Date())}</div>
            {isCotizacion && factura.fechaValidez && (
              <div style={{ fontSize: '13px' }}>Validez hasta: {Utils.formatDate(factura.fechaValidez)}</div>
            )}
          </div>

          {/* Datos del Cliente */}
          <div style={{ marginBottom: '15px', fontSize: '13px' }}>
            <div><strong>Cliente:</strong> {factura.cliente?.razonSocial}</div>
            <div><strong>ID Fiscal:</strong> {factura.cliente?.rifCedula}</div>
            {factura.cliente?.direccion && <div><strong>Dir:</strong> {factura.cliente.direccion}</div>}
          </div>

          <div style={{ borderBottom: '1px dashed #ccc', marginBottom: '10px' }}></div>

          {/* Ítems */}
          <table style={{ width: '100%', fontSize: '13px', marginBottom: '15px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Cant</th>
                <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Descripción</th>
                <th style={{ textAlign: 'right', paddingBottom: '5px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {factura.items?.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '4px 0', verticalAlign: 'top' }}>{item.cantidad}</td>
                  <td style={{ padding: '4px 0', paddingRight: '5px' }}>
                    {item.descripcionHistorica || item.producto?.nombre}
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {Utils.formatMoney(item.precioUnitarioHistorico, currency)} c/u
                    </div>
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right', verticalAlign: 'top' }}>
                    {Utils.formatMoney(item.totalLinea || (item.precioUnitarioHistorico * item.cantidad), currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderBottom: '1px dashed #ccc', marginBottom: '10px' }}></div>

          {/* Totales */}
          <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>{Utils.formatMoney(factura.subtotal, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Impuesto:</span>
              <span>{Utils.formatMoney(factura.impuestoTotal, currency)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #eee' }}>
              <span>TOTAL:</span>
              <span>{Utils.formatMoney(factura.total, currency)}</span>
            </div>
          </div>

          {/* Cuotas si es financiada */}
          {!isCotizacion && factura.cuotasTotales > 1 && (
            <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px', fontSize: '13px', border: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Financiamiento</div>
              <div>Cuotas Totales: {factura.cuotasTotales}</div>
              <div>Monto Cuota: {Utils.formatMoney(factura.total / factura.cuotasTotales, currency)}</div>
              <div>Vencimiento: {Utils.formatDate(factura.fechaVencimiento)}</div>
            </div>
          )}

          {/* Registro de Pagos */}
          {!isCotizacion && factura.pagos?.length > 0 && (
            <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px', fontSize: '13px', border: '1px solid #eee' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>
                Registro de Pagos
              </div>
              {factura.pagos.map((pago, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', marginBottom: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {Utils.formatDate(pago.fechaPago)} - {
                        pago.metodoPago === 'CASH' ? 'Efectivo' :
                        pago.metodoPago === 'MOBILE_PAYMENT' ? 'Pago Móvil' :
                        pago.metodoPago === 'CREDIT_CARD' ? 'Punto' : 'Transferencia'
                      }
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{Utils.formatMoney(pago.monto, currency)}</span>
                  </div>
                  {pago.referenciaTransaccion && (
                    <div style={{ color: '#666' }}>Ref: {pago.referenciaTransaccion}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '12px', color: '#555' }}>
            {isCotizacion ? 'Precios sujetos a cambio sin previo aviso.' : '¡Gracias por su compra!'}
          </div>
        </div>

        <div className="modal-footer no-print" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isCotizacion && (
              <Button
                variant="secondary"
                icon="mdi:receipt"
                onClick={async () => {
                  try {
                    const { API } = require('../../services/api');
                    await API.imprimirFiscal(factura.id);
                    alert('🎉 Imprimiendo en máquina fiscal...');
                  } catch (err) {
                    alert('Error Máquina Fiscal: ' + err.message);
                  }
                }}
              >
                Imprimir Fiscal
              </Button>
            )}
            <Button variant="primary" icon="mdi:printer" onClick={handlePrint}>
              Imprimir / Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
