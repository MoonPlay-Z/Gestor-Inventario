import React from 'react';
import { Button } from './Button';
import { Utils } from '../../services/api';

/**
 * CashRegisterReport
 * Receives a `cierre` object (from CierreCaja) and an optional `preview` object (from GET /caja/preview).
 * When used from historial, only `cierre` is needed.
 * When used for a live close, `preview` provides the breakdown.
 */
export function CashRegisterReport({ cierre, preview, onClose, config }) {
  if (!cierre) return null;

  const empresa = config?.empresa || {};
  const currency = config?.moneda?.simbolo || '$';

  const handlePrint = () => window.print();

  // Amounts — prefer preview (live data) over stored cierre fields
  const efectivo = parseFloat(preview?.desglose?.efectivo ?? cierre.ingresosEfectivo ?? 0);
  const pagoMovil = parseFloat(preview?.desglose?.pagoMovil ?? 0);
  const punto = parseFloat(preview?.desglose?.punto ?? 0);
  const transferencia = parseFloat(preview?.desglose?.transferencia ?? 0);
  const montoInicial = parseFloat(preview?.montoInicialUSD ?? cierre.montoInicial ?? 0);
  const totalEfectivo = montoInicial + efectivo;
  const totalBanco = pagoMovil + punto + transferencia;
  const totalIngresos = efectivo + totalBanco;
  const montoFinalContado = parseFloat(cierre.montoFinalEfectivo ?? cierre.montoFinal ?? 0);
  const diferencia = montoFinalContado - totalEfectivo;
  const totalTransacciones = preview?.totalTransacciones ?? '-';

  const row = (label, value, bold = false, color = null) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontWeight: bold ? 700 : 400, color: color || 'inherit' }}>
      <span>{label}</span>
      <span>{Utils.formatMoney(value, currency)}</span>
    </div>
  );

  return (
    <div className="modal-overlay open receipt-overlay" onClick={onClose}>
      <div className="modal receipt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%' }}>
        <div className="modal-header no-print">
          <h3 className="modal-title">Reporte de Cierre de Caja</h3>
          <Button variant="ghost" size="icon" onClick={onClose} icon="mdi:close" />
        </div>

        <div className="modal-body receipt-content" style={{ padding: '24px', background: '#fff', color: '#000', fontSize: '13px' }}>
          {/* Encabezado empresa */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>{empresa.nombre || 'Mi Empresa'}</h2>
            {empresa.documento && <div>ID Fiscal: {empresa.documento}</div>}
            {empresa.direccion && <div style={{ fontSize: '12px' }}>{empresa.direccion}</div>}
            <div style={{ margin: '12px 0', borderBottom: '1px dashed #ccc' }}></div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>REPORTE DE CIERRE DE CAJA</h3>
            {cierre.usuario && (
              <div style={{ fontSize: '12px' }}>Cajero: <strong>{cierre.usuario.nombre || cierre.usuario.username}</strong></div>
            )}
          </div>

          {/* Fechas del turno */}
          <div style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Apertura:</span>
              <span><strong>{Utils.formatDate(cierre.fechaApertura)}</strong></span>
            </div>
            {cierre.fechaCierre && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                <span>Cierre:</span>
                <span><strong>{Utils.formatDate(cierre.fechaCierre)}</strong></span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
              <span>Total Transacciones:</span>
              <span><strong>{totalTransacciones}</strong></span>
            </div>
          </div>

          {/* Desglose de ingresos por método */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '6px' }}>
              Ingresos por Método de Pago
            </div>
            {row('Efectivo (USD)', efectivo)}
            {row('Pago Móvil', pagoMovil)}
            {row('Punto de Venta', punto)}
            {row('Transferencia Bancaria', transferencia)}
            <div style={{ borderTop: '1px dashed #ccc', marginTop: '6px', paddingTop: '6px' }}>
              {row('Total Banco', totalBanco)}
              {row('Total Ingresos', totalIngresos, true)}
            </div>
          </div>

          {/* Cuadre de efectivo */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '6px' }}>
              Cuadre de Efectivo
            </div>
            {row('Monto Base Inicial', montoInicial)}
            {row('+ Ingresos Efectivo', efectivo)}
            {row('= Esperado en Caja', totalEfectivo, true)}
            {cierre.estado === 'CLOSED' && (
              <>
                {row('Contado Físicamente', montoFinalContado)}
                {row(
                  diferencia >= 0 ? '✓ Sobrante' : '✗ Faltante',
                  Math.abs(diferencia),
                  true,
                  diferencia >= 0 ? '#16a34a' : '#dc2626'
                )}
              </>
            )}
          </div>

          {/* Observaciones */}
          {cierre.observaciones && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '8px 10px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, marginBottom: '3px' }}>Observaciones:</div>
              <div>{cierre.observaciones}</div>
            </div>
          )}

          {/* Firma */}
          <div style={{ marginTop: '36px', borderTop: '1px solid #000', paddingTop: '6px', textAlign: 'center', fontSize: '12px', color: '#555' }}>
            Firma del Cajero
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#999' }}>
            Documento generado el {new Date().toLocaleDateString('es-VE')}
          </div>
        </div>

        <div className="modal-footer no-print" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" icon="mdi:printer" onClick={handlePrint}>
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
