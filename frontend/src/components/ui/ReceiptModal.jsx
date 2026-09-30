import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from './Button';
import { Utils } from '../../services/api';

export function ReceiptModal({ factura, onClose, config, type = 'factura' }) {
  const [monedaImpresion, setMonedaImpresion] = useState('VES'); // 'VES' o 'USD'
  
  if (!factura) return null;
  const isCotizacion = type === 'cotizacion';
  const numero = isCotizacion ? factura.numero : factura.numeroFactura;
  const tasaBcv = Number(config?.moneda?.tasaDolar || 1);

  const sanitizeFilenamePart = (value) => {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._\- ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40) || 'cliente';
  };

  const buildPrintableTitle = () => {
    const cliente = sanitizeFilenamePart(factura.cliente?.razonSocial || 'cliente');
    const fecha = (factura.fechaEmision ? new Date(factura.fechaEmision) : new Date())
      .toISOString()
      .slice(0, 10);
    const referencia = sanitizeFilenamePart(
      factura.pagos?.find(pago => pago.referenciaTransaccion)?.referenciaTransaccion ||
      factura.referenciaTransaccion ||
      'sin-referencia'
    );
    return `Factura_${cliente}_${fecha}_${referencia}`;
  };

  const handlePrint = () => {
    const previousTitle = document.title;
    const printableTitle = buildPrintableTitle();
    document.title = printableTitle;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle, { once: true });
    window.print();
  };

  const empresa = config?.empresa || {};
  const simboloMoneda = monedaImpresion === 'VES' ? 'Bs.' : '$';

  // Calcular totales por tipo de IVA
  const calcularTotalesPorAliquota = () => {
    const totales = { G: { base: 0, iva: 0 }, E: { base: 0, iva: 0 }, R: { base: 0, iva: 0 } };
    
    factura.items?.forEach(item => {
      const tipoIVA = item.tipoIVA || 'G'; // G = General, E = Exento, R = Reducido
      const subtotal = Number(item.subtotalLinea || 0);
      const iva = Number(item.impuestoLinea || 0);
      
      if (totales[tipoIVA]) {
        totales[tipoIVA].base += subtotal;
        totales[tipoIVA].iva += iva;
      }
    });
    
    return totales;
  };

  const totalesIVA = calcularTotalesPorAliquota();
  const subtotalUSD = Number(factura.subtotal || 0);
  const impuestoTotalUSD = Number(factura.impuestoTotal || 0);
  const totalUSD = Number(factura.total || 0);

  // Convertir valores según la moneda seleccionada
  const convertir = (valorUSD) => {
    return monedaImpresion === 'VES' ? valorUSD * tasaBcv : valorUSD;
  };

  const subtotal = convertir(subtotalUSD);
  const impuestoTotal = convertir(impuestoTotalUSD);
  const total = convertir(totalUSD);

  // Formatear valores
  const formatValue = (valor) => {
    return valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Obtener letra de tipo IVA para un item
  const getTipoIVALetra = (item) => {
    const tasa = Number(item.tasaImpuestoAplicada || 16);
    if (tasa === 0) return 'E'; // Exento
    if (tasa === 16) return 'G'; // General
    return 'R'; // Reducido
  };

  // Agrupar items por tipo de IVA para mostrar en la factura
  const itemsAgrupados = () => {
    const grupos = {};
    factura.items?.forEach(item => {
      const tipo = getTipoIVALetra(item);
      if (!grupos[tipo]) grupos[tipo] = [];
      grupos[tipo].push(item);
    });
    return grupos;
  };

  const itemsPorTipo = itemsAgrupados();

  return (
    <div className="modal-overlay open receipt-overlay" onClick={onClose}>
      <div className="modal receipt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%' }}>
        <div className="modal-header no-print">
          <h3 className="modal-title">
            {isCotizacion ? 'Cotización' : 'Factura'} #{numero?.toString().padStart(5, '0')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} icon="mdi:close" />
        </div>

        <div className="modal-body receipt-content" style={{ padding: '20px', background: '#fff', color: '#000', fontSize: '12px', fontFamily: 'monospace' }}>
          {/* ── CABECERA ── */}
          <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {empresa.nombre || 'MI EMPRESA'}
            </div>
            <div style={{ fontSize: '11px' }}>RIF: {empresa.rif || empresa.documento || 'J-00000000-0'}</div>
            {empresa.direccion && <div style={{ fontSize: '10px', marginTop: '2px' }}>{empresa.direccion}</div>}
            {empresa.telefono && <div style={{ fontSize: '10px' }}>Tel: {empresa.telefono}</div>}
          </div>

          {/* ── IDENTIFICACIÓN DEL DOCUMENTO ── */}
          <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '11px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px' }}>
              {isCotizacion ? 'PRESUPUESTO' : 'FACTURA'}
            </div>
            <div>NRO: {numero?.toString().padStart(8, '0')}</div>
            {!isCotizacion && <div>NRO CONTROL: 00-{numero?.toString().padStart(8, '0')}</div>}
            <div>
              FECHA: {new Date(factura.fechaEmision || new Date()).toLocaleDateString('es-VE')} 
              HORA: {new Date(factura.fechaEmision || new Date()).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

          {/* ── DATOS DEL CLIENTE ── */}
          <div style={{ marginBottom: '10px', fontSize: '11px' }}>
            <div><strong>CLIENTE:</strong> {factura.cliente?.razonSocial || 'N/A'}</div>
            <div><strong>C.I/RIF:</strong> {factura.cliente?.rifCedula || 'N/A'}</div>
            {factura.cliente?.direccion && <div><strong>DIR:</strong> {factura.cliente.direccion}</div>}
          </div>

          <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

          {/* ── ÍTEMS ── */}
          <table style={{ width: '100%', fontSize: '11px', marginBottom: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '4px 2px' }}>CANT</th>
                <th style={{ textAlign: 'left', padding: '4px 2px' }}>DESCRIPCION</th>
                <th style={{ textAlign: 'right', padding: '4px 2px' }}>P.UNIT</th>
                <th style={{ textAlign: 'right', padding: '4px 2px' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {factura.items?.map((item, idx) => {
                const tipoIVA = getTipoIVALetra(item);
                return (
                  <tr key={idx} style={{ borderBottom: '1px dotted #ccc' }}>
                    <td style={{ padding: '4px 2px', verticalAlign: 'top' }}>
                      {item.cantidad}
                      {item.unidadMedida && item.unidadMedida !== 'UNIDAD' && (
                        <span style={{ fontSize: '9px' }}> ({item.unidadMedida.substring(0, 3)})</span>
                      )}
                    </td>
                    <td style={{ padding: '4px 2px', paddingRight: '4px' }}>
                      {item.descripcionHistorica || item.producto?.nombre}
                      <span style={{ 
                        display: 'inline-block', 
                        marginLeft: '4px',
                        padding: '0 3px',
                        border: '1px solid #000',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}>
                        {tipoIVA}
                      </span>
                    </td>
                    <td style={{ padding: '4px 2px', textAlign: 'right', verticalAlign: 'top' }}>
                      {formatValue(Number(item.precioUnitarioHistorico || 0))}
                    </td>
                    <td style={{ padding: '4px 2px', textAlign: 'right', verticalAlign: 'top' }}>
                      {formatValue(Number(item.totalLinea || 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

          {/* ── TOTALES ── */}
          <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SUBTOTAL:</span>
              <span>{simboloMoneda} {formatValue(subtotal)}</span>
            </div>
            
            {/* Base Exenta */}
            {totalesIVA.E.base > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>BASE EXENTA (E):</span>
                <span>{simboloMoneda} {formatValue(totalesIVA.E.base)}</span>
              </div>
            )}
            
            {/* Base Imponible General */}
            {totalesIVA.G.base > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BASE IMPONIBLE (G) 16%:</span>
                  <span>{simboloMoneda} {formatValue(totalesIVA.G.base)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IVA 16%:</span>
                  <span>{simboloMoneda} {formatValue(totalesIVA.G.iva)}</span>
                </div>
              </>
            )}
            
            {/* Base Imponible Reducido */}
            {totalesIVA.R.base > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BASE IMPONIBLE (R) 8%:</span>
                  <span>{simboloMoneda} {formatValue(totalesIVA.R.base)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IVA 8%:</span>
                  <span>{simboloMoneda} {formatValue(totalesIVA.R.iva)}</span>
                </div>
              </>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '6px', paddingTop: '6px', borderTop: '2px solid #000' }}>
              <span>TOTAL {simboloMoneda}:</span>
              <span>{simboloMoneda} {formatValue(total)}</span>
            </div>
          </div>

          {/* ── INFORMACIÓN ADICIONAL ── */}
          <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #000', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>TASA BCV: {tasaBcv.toFixed(2)} BS/USD</span>
            </div>
            {/* Solo mostrar la moneda seleccionada, sin mezclar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>TOTAL {monedaImpresion}:</span>
              <span>{simboloMoneda} {formatValue(total)}</span>
            </div>
            
            {/* Método de Pago */}
            {factura.pagos && factura.pagos.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <strong>METODO DE PAGO:</strong>
                {factura.pagos.map((pago, i) => (
                  <div key={i} style={{ marginLeft: '10px' }}>
                    {pago.metodoPago === 'CASH' ? 'EFECTIVO' :
                     pago.metodoPago === 'MOBILE_PAYMENT' ? 'PAGO MOVIL' :
                     pago.metodoPago === 'CREDIT_CARD' ? 'PUNTO DE VENTA' :
                     pago.metodoPago === 'BANK_TRANSFER' ? 'TRANSFERENCIA' : pago.metodoPago}
                    {pago.referenciaTransaccion && ` - Ref: ${pago.referenciaTransaccion}`}
                  </div>
                ))}
              </div>
            )}
            
            {/* Cuotas si es financiada */}
            {!isCotizacion && factura.cuotasTotales > 1 && (
              <div style={{ marginTop: '6px' }}>
                <strong>FINANCIAMIENTO:</strong> {factura.cuotasTotales} cuotas de {simboloMoneda} {formatValue(total / factura.cuotasTotales)}
              </div>
            )}
          </div>

          {/* ── PIE DE PÁGINA ── */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '9px', color: '#333', borderTop: '1px solid #000', paddingTop: '10px' }}>
            <div>Requisitos Estructurales (SENIAT)</div>
            <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
              {isCotizacion ? 'Precios sujetos a cambio sin previo aviso.' : 'GRACIAS POR SU COMPRA'}
            </div>
          </div>
        </div>

        {/* ── CONTROLES DE IMPRESIÓN ── */}
        <div className="modal-footer no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Imprimir en:</span>
            <button 
              onClick={() => setMonedaImpresion('VES')}
              className={`btn btn-sm ${monedaImpresion === 'VES' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Bs.
            </button>
            <button 
              onClick={() => setMonedaImpresion('USD')}
              className={`btn btn-sm ${monedaImpresion === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
            >
              USD
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
            {!isCotizacion && (
              <Button
                variant="secondary"
                icon="mdi:receipt"
                onClick={async () => {
                  try {
                    const { API } = require('../../services/api');
                    await API.imprimirFiscal(factura.id);
                    alert('Imprimiendo en máquina fiscal...');
                  } catch (err) {
                    alert('Error Máquina Fiscal: ' + err.message);
                  }
                }}
              >
                Fiscal
              </Button>
            )}
            <Button variant="primary" icon="mdi:printer" onClick={handlePrint}>
              Imprimir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
