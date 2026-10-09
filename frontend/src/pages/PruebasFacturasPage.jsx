import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';

const estadoLabels = {
  PAID: 'Pagada',
  PENDING: 'Pendiente',
  PARTIALLY_PAID: 'Abonada',
  VOIDED: 'Anulada',
};
const unitGroups = [
  ['KILOGRAMO', 'GRAMO'],
  ['LITRO', 'MILILITRO'],
  ['METRO', 'CENTIMETRO'],
];
const unitLabels = {
  UNIDAD: 'Unidad',
  KILOGRAMO: 'Kilogramo (kg)',
  GRAMO: 'Gramo (g)',
  LITRO: 'Litro (L)',
  MILILITRO: 'Mililitro (mL)',
  METRO: 'Metro (m)',
  CENTIMETRO: 'Centímetro (cm)',
  BULTO: 'Bulto',
  PAQUETE: 'Paquete',
  CAJA: 'Caja',
  SACO: 'Saco',
  BOTELLA: 'Botella',
  LATA: 'Lata',
  DOCENA: 'Docena',
  MEDIA_DOCENA: 'Media docena',
};

const getCompatibleUnits = (item) => {
  const baseUnit = item.producto?.esVentaPorPeso ? 'KILOGRAMO' : item.producto?.unidadMedida;
  const group = unitGroups.find((units) => units.includes(baseUnit));
  return group || [baseUnit || item.unidadMedida];
};

const getQuantityStep = (unit) => (
  ['GRAMO', 'MILILITRO', 'CENTIMETRO', 'UNIDAD', 'BULTO', 'PAQUETE', 'CAJA', 'SACO', 'BOTELLA', 'LATA', 'DOCENA', 'MEDIA_DOCENA'].includes(unit)
    ? '1'
    : '0.0001'
);
const unitFactors = { KILOGRAMO: 1000n, GRAMO: 1n, LITRO: 1000n, MILILITRO: 1n, METRO: 100n, CENTIMETRO: 1n };
const unitShortLabels = {
  UNIDAD: 'ud', KILOGRAMO: 'kg', GRAMO: 'g', LITRO: 'L', MILILITRO: 'mL',
  METRO: 'm', CENTIMETRO: 'cm', BULTO: 'bulto', PAQUETE: 'paq.', CAJA: 'caja',
  SACO: 'saco', BOTELLA: 'botella', LATA: 'lata', DOCENA: 'doc.', MEDIA_DOCENA: '1/2 doc.',
};

const toScaledInteger = (value, decimals) => {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(String(value ?? ''));
  if (!match || (match[2] || '').length > decimals) return null;
  const scale = 10n ** BigInt(decimals);
  const fraction = BigInt((match[2] || '').padEnd(decimals, '0') || '0');
  return BigInt(match[1]) * scale + fraction;
};

const roundRatio = (numerator, denominator) => (numerator + denominator / 2n) / denominator;

const getBaseUnit = (item) => item.producto?.esVentaPorPeso ? 'KILOGRAMO' : item.producto?.unidadMedida || item.unidadMedida;

const lineSubtotalCents = (line, item) => {
  const priceCents = toScaledInteger(line?.precioUnitarioHistorico, 2);
  const quantity = toScaledInteger(line?.cantidad, 4);
  const baseUnit = getBaseUnit(item);
  const selectedUnit = line?.unidadMedida || item.unidadMedida;
  if (priceCents === null || quantity === null) return null;

  let unitNumerator = 1n;
  let unitDenominator = 1n;
  if (selectedUnit !== baseUnit) {
    const group = unitGroups.find((units) => units.includes(selectedUnit) && units.includes(baseUnit));
    if (!group || !unitFactors[selectedUnit] || !unitFactors[baseUnit]) return null;
    unitNumerator = unitFactors[selectedUnit];
    unitDenominator = unitFactors[baseUnit];
  }
  return roundRatio(priceCents * quantity * unitNumerator, 10000n * unitDenominator);
};

const convertCentsToBolivares = (cents, tasaCambio) => {
  const rate = toScaledInteger(tasaCambio || '1', 4);
  if (cents === null || rate === null) return null;
  return roundRatio(cents * rate, 10000n);
};

const formatCents = (cents, symbol) => (
  cents === null ? '—' : Utils.formatMoney(Number(cents) / 100, symbol)
);

const getEquivalentQuantity = (item, line) => {
  const unit = line?.unidadMedida || item.unidadMedida;
  const baseUnit = getBaseUnit(item);
  const quantity = Number(line?.cantidad);
  if (!Number.isFinite(quantity) || unit === baseUnit) return '';
  if (!unitFactors[unit] || !unitFactors[baseUnit]) return '';
  const group = unitGroups.find((units) => units.includes(unit) && units.includes(baseUnit));
  if (!group) return '';
  const converted = quantity * Number(unitFactors[unit]) / Number(unitFactors[baseUnit]);
  return `= ${converted.toFixed(3)} ${unitShortLabels[baseUnit] || baseUnit.toLowerCase()}`;
};

export function PruebasFacturasPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [codigo, setCodigo] = useState('');
  const [factura, setFactura] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [editPayments, setEditPayments] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const searchCode = codigo.trim().replace(/^#/, '');
    if (!/^\d+$/.test(searchCode)) {
      setError('Escribe el código numérico de la factura.');
      setFactura(null);
      return;
    }

    setSearching(true);
    setError('');
    setFactura(null);
    setEditing(false);
    try {
      const result = await API.getFacturaPruebas(searchCode);
      setFactura(result);
    } catch (err) {
      setError(err.message || 'No se pudo buscar la factura.');
    } finally {
      setSearching(false);
    }
  };

  const startEditing = () => {
    setFechaVencimiento(factura.fechaVencimiento?.slice(0, 10) || '');
    setObservaciones(factura.observaciones || '');
    setEditItems((factura.items || []).map((item) => ({
      id: item.id,
      cantidad: String(item.cantidad),
      unidadMedida: item.unidadMedida,
      precioUnitarioHistorico: String(item.precioUnitarioHistorico),
    })));
    setEditPayments((factura.pagos || []).map((pago) => ({
      id: pago.id,
      monto: String(pago.monto),
      metodoPago: pago.metodoPago,
      referenciaTransaccion: pago.referenciaTransaccion || '',
    })));
    setEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await API.actualizarFacturaPruebas(factura.id, {
        fechaVencimiento,
        observaciones,
        items: editItems.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
          unidadMedida: item.unidadMedida,
          precioUnitarioHistorico: item.precioUnitarioHistorico,
        })),
        pagos: editPayments.map((pago) => ({
          id: pago.id,
          monto: pago.monto,
          metodoPago: pago.metodoPago,
          referenciaTransaccion: pago.referenciaTransaccion,
        })),
      });
      setFactura(updated);
      setEditing(false);
      showToast('Factura actualizada', 'success');
    } catch (err) {
      showToast('No se pudo actualizar la factura: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Pruebas de facturas"
        subtitle="Entorno de desarrollo · búsqueda por código"
        toggleSidebar={toggleSidebar}
      />
      <div className="page-body">
        <section className="card" style={{ padding: '20px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 240px', maxWidth: '420px' }}>
              <label className="form-label" htmlFor="invoice-code">Código de factura</label>
              <input
                id="invoice-code"
                className="form-input"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ej. 00042"
                inputMode="numeric"
                autoComplete="off"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={searching}>
              <Icon icon="mdi:magnify" className="h-4 w-4" />
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {error && <p role="alert" style={{ color: 'var(--danger)', marginTop: '12px' }}>{error}</p>}
        </section>

        {factura && (
          <section className="card" style={{ padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Factura #{String(factura.numeroFactura).padStart(5, '0')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                  {factura.cliente?.razonSocial || 'Sin cliente'} · {estadoLabels[factura.estado] || factura.estado}
                </p>
              </div>
              {!editing && (
                <button type="button" className="btn btn-secondary" onClick={startEditing}>
                  <Icon icon="mdi:pencil-outline" className="h-4 w-4" />
                  Editar
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginTop: '20px' }}>
              <div><div className="form-label">Fecha de emisión</div><div>{Utils.formatDate(factura.fechaEmision)}</div></div>
              <div><div className="form-label">Total</div><div style={{ fontWeight: 700 }}>{Utils.formatMoney(factura.total)}</div></div>
              <div><div className="form-label">Vencimiento</div><div>{Utils.formatDate(factura.fechaVencimiento)}</div></div>
              <div><div className="form-label">Observaciones</div><div>{factura.observaciones || 'Sin observaciones'}</div></div>
            </div>

            {editing && (
              <form onSubmit={handleSave} style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border)' }}>
                {!!editItems.length && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700 }}>Productos y cantidades</h3>
                    <div className="table-wrapper">
                      <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)' }}>Producto</th>
                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)' }}>Precio unit.</th>
                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid var(--border)' }}>Cantidad</th>
                            <th style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid var(--border)' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(factura.items || []).map((item, index) => (
                            <tr key={item.id}>
                              <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontWeight: 700 }}>{item.descripcionHistorica}</div>
                                {item.producto?.esVentaPorPeso && <div style={{ color: 'var(--success)', fontSize: '0.72rem' }}>Venta por peso</div>}
                              </td>
                              <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <span style={{ fontSize: '0.8rem' }}>$</span>
                                  <input
                                    aria-label={`Precio unitario de ${item.descripcionHistorica}`}
                                    className="form-input"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={factura.estado === 'VOIDED'}
                                    value={editItems[index]?.precioUnitarioHistorico ?? ''}
                                    onChange={(event) => setEditItems((current) => current.map((row, rowIndex) => (
                                      rowIndex === index ? { ...row, precioUnitarioHistorico: event.target.value } : row
                                    )))}
                                    style={{ width: '82px', padding: '4px', fontWeight: 700 }}
                                  />
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', paddingLeft: '12px' }}>
                                  {formatCents(convertCentsToBolivares(toScaledInteger(editItems[index]?.precioUnitarioHistorico, 2), factura.tasaCambio), 'Bs.')}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', paddingLeft: '12px' }}>
                                  por {unitShortLabels[getBaseUnit(item)] || getBaseUnit(item).toLowerCase()}
                                </div>
                              </td>
                              <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {(() => {
                                    const quantityStep = getQuantityStep(editItems[index]?.unidadMedida || item.unidadMedida);
                                    return (
                                  <input
                                    aria-label={`Cantidad de ${item.descripcionHistorica}`}
                                    className="form-input"
                                    type="number"
                                    min={quantityStep === '1' ? '1' : '0.0001'}
                                    step={quantityStep}
                                    required
                                    disabled={factura.estado === 'VOIDED' || !item.producto}
                                    value={editItems[index]?.cantidad ?? ''}
                                    onChange={(event) => setEditItems((current) => current.map((row, rowIndex) => (
                                      rowIndex === index ? { ...row, cantidad: event.target.value } : row
                                    )))}
                                    style={{ width: '80px', textAlign: 'right' }}
                                  />
                                    );
                                  })()}
                                  <select
                                    aria-label={`Unidad de ${item.descripcionHistorica}`}
                                    className="form-input"
                                    disabled={factura.estado === 'VOIDED' || !item.producto || getCompatibleUnits(item).length === 1}
                                    value={editItems[index]?.unidadMedida || item.unidadMedida}
                                    onChange={(event) => setEditItems((current) => current.map((row, rowIndex) => (
                                      rowIndex === index ? { ...row, unidadMedida: event.target.value } : row
                                    )))}
                                    style={{ width: '66px', padding: '5px' }}
                                  >
                                    {getCompatibleUnits(item).map((unit) => (
                                      <option value={unit} key={unit}>{unitShortLabels[unit] || unit}</option>
                                    ))}
                                  </select>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', paddingTop: '3px', paddingLeft: '2px' }}>
                                  {getEquivalentQuantity(item, editItems[index])}
                                </div>
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCents(lineSubtotalCents(editItems[index], item), '$')}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{formatCents(convertCentsToBolivares(lineSubtotalCents(editItems[index], item), factura.tasaCambio), 'Bs.')}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '8px 0 0' }}>
                      El subtotal, los impuestos y el total se recalculan al guardar usando cantidades, unidades, precios e impuestos. El stock se ajusta en la misma operación.
                    </p>
                  </div>
                )}

                {!!editPayments.length && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700 }}>Pagos</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      {editPayments.map((pago, index) => {
                        const payment = factura.pagos[index];
                        return (
                          <div key={pago.id} style={{ display: 'grid', gap: '10px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                            <div className="form-group">
                              <label className="form-label" htmlFor={`payment-method-${pago.id}`}>Método de pago</label>
                              <select
                                id={`payment-method-${pago.id}`}
                                className="form-input"
                                value={pago.metodoPago}
                                onChange={(event) => setEditPayments((current) => current.map((row, rowIndex) => (
                                  rowIndex === index ? { ...row, metodoPago: event.target.value } : row
                                )))}
                              >
                                <option value="CASH">Efectivo</option>
                                <option value="BANK_TRANSFER">Transferencia</option>
                                <option value="CREDIT_CARD">Tarjeta</option>
                                <option value="MOBILE_PAYMENT">Pago móvil (MOBILE_PAYMENT)</option>
                                {pago.metodoPago === 'PAGO_MOVIL' && <option value="PAGO_MOVIL">Pago móvil (legado)</option>}
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label" htmlFor={`payment-amount-${pago.id}`}>Monto pagado</label>
                              <input
                                id={`payment-amount-${pago.id}`}
                                className="form-input"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={pago.monto}
                                onChange={(event) => setEditPayments((current) => current.map((row, rowIndex) => (
                                  rowIndex === index ? { ...row, monto: event.target.value } : row
                                )))}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label" htmlFor={`payment-reference-${pago.id}`}>Folio o referencia</label>
                              <input
                                id={`payment-reference-${pago.id}`}
                                className="form-input"
                                value={pago.referenciaTransaccion}
                                maxLength={200}
                                onChange={(event) => setEditPayments((current) => current.map((row, rowIndex) => (
                                  rowIndex === index ? { ...row, referenciaTransaccion: event.target.value } : row
                                )))}
                                placeholder="Folio o referencia"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="invoice-due-date">Fecha de vencimiento</label>
                    <input
                      id="invoice-due-date"
                      className="form-input"
                      type="date"
                      value={fechaVencimiento}
                      onChange={(event) => setFechaVencimiento(event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="invoice-notes">Observaciones</label>
                    <textarea
                      id="invoice-notes"
                      className="form-input"
                      rows={3}
                      maxLength={1000}
                      value={observaciones}
                      onChange={(event) => setObservaciones(event.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Icon icon="mdi:content-save-outline" className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </>
  );
}
