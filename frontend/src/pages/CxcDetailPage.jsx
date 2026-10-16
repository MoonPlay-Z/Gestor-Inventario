import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowLeftIcon from '@iconify/icons-mdi/arrow-left';
import cashIcon from '@iconify/icons-mdi/cash';
import phoneIcon from '@iconify/icons-mdi/phone';
import emailIcon from '@iconify/icons-mdi/email';
import whatsappIcon from '@iconify/icons-mdi/whatsapp';
import accountIcon from '@iconify/icons-mdi/account';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, FieldError } from '../components/ui';

const ESTADOS = {
  PENDING: { label: 'Pendiente', color: '#f59e0b' },
  PARTIALLY_PAID: { label: 'Parcial', color: '#3b82f6' },
  PAID: { label: 'Pagada', color: '#10b981' }
};

export function CxcDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cuenta, setCuenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPago, setShowPago] = useState(false);
  const [showGestion, setShowGestion] = useState(false);
  const [savingPago, setSavingPago] = useState(false);
  const [savingGestion, setSavingGestion] = useState(false);
  const [pagoForm, setPagoForm] = useState({ monto: '', metodoPago: 'CASH', monedaPago: 'USD', referenciaTransaccion: '', notas: '' });
  const [gestionForm, setGestionForm] = useState({ accion: 'LLAMADA', notas: '' });
  const [errors, setErrors] = useState({});
  // La conversión la hace el backend. Solo se guarda lo que devuelve para
  // mostrarlo; el frontend NUNCA calcula el equivalente ni valida el sobrepago,
  // porque su tasa puede diferir de la que aplica el servidor.
  const [conversion, setConversion] = useState(null);

  // Consulta al backend cuánto vale el abono en la moneda elegida. El frontend
  // no calcula equivalencias: las pide para no divergir de la tasa del servidor.
  const consultarConversion = async (monto, moneda) => {
    try {
      const data = await API.request(
        `/cxc/${id}/conversion?moneda=${encodeURIComponent(moneda)}&monto=${encodeURIComponent(monto)}`
      );
      setConversion(data);
      return data;
    } catch (err) {
      console.error('Error consultando conversión:', err);
      return null;
    }
  };

  // Refleja el equivalente en pantalla mientras el usuario escribe.
  useEffect(() => {
    if (!showPago) return;
    const monto = Number(pagoForm.monto);
    if (!monto || monto <= 0) { setConversion(null); return; }
    const t = setTimeout(() => consultarConversion(monto, pagoForm.monedaPago), 300);
    return () => clearTimeout(t);
  }, [showPago, pagoForm.monto, pagoForm.monedaPago, id]);

  const loadCuenta = async () => {
    try {
      const data = await API.request(`/cxc/${id}`);
      setCuenta(data);
      // El monto por defecto es el pendiente en USD; en Bs lo deja el backend
      // para que el usuario vea un valor que no dispare el error de sobrepago.
      setPagoForm(p => ({ ...pagoForm, monto: data.montoPendiente }));
    } catch (err) {
      showToast('Error al cargar cuenta: ' + err.message, 'error');
      navigate('/cxc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCuenta(); }, [id]);

  const handlePago = async () => {
    const errs = {};
    if (!pagoForm.monto || Number(pagoForm.monto) <= 0) errs.monto = 'Ingrese un monto válido';
    if (pagoForm.metodoPago !== 'CASH' && !pagoForm.referenciaTransaccion.trim()) errs.referencia = 'Referencia obligatoria';
    // El sobrepago lo valida el backend, que es quien conoce la tasa efectiva
    // de la cuenta. Si lo validáramos aquí con la tasa del login mostraríamos un
    // error equivocado (o dejaríamos pasar uno real).
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingPago(true);
    try {
      const body = {
        monto: pagoForm.monto,
        metodoPago: pagoForm.metodoPago,
        monedaPago: pagoForm.monedaPago,
        referenciaTransaccion: pagoForm.metodoPago === 'CASH' ? null : pagoForm.referenciaTransaccion,
        notas: pagoForm.notas
      };
      await API.request(`/cxc/${id}/pago`, { method: 'POST', body });
      showToast('Pago registrado exitosamente', 'success');
      setShowPago(false);
      loadCuenta();
    } catch (err) {
      showToast('Error al registrar pago: ' + err.message, 'error');
    } finally {
      setSavingPago(false);
    }
  };

  const handleGestion = async () => {
    if (!gestionForm.notas.trim()) {
      setErrors({ notasG: 'Las notas son obligatorias' });
      return;
    }
    setSavingGestion(true);
    try {
      await API.request(`/cxc/${id}/gestion`, { method: 'POST', body: gestionForm });
      showToast('Gestion registrada', 'success');
      setShowGestion(false);
      setGestionForm({ accion: 'LLAMADA', notas: '' });
      loadCuenta();
    } catch (err) {
      showToast('Error al registrar gestion: ' + err.message, 'error');
    } finally {
      setSavingGestion(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;
  if (!cuenta) return null;

  const estado = ESTADOS[cuenta.estado] || { label: cuenta.estado, color: '#6b7280' };

  return (
    <>
      <Header title={`CxC Factura #${cuenta.factura?.numeroFactura || 'N/A'}`} subtitle="Detalle de cuenta por cobrar" />
      <div className="p-4 md:p-6 space-y-4">
        <button onClick={() => navigate('/cxc')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <Icon icon={arrowLeftIcon} width={18} height={18} /> Volver a Cuentas por Cobrar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon icon={accountIcon} width={20} height={20} /> Informacion del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Nombre:</span><p className="font-medium">{cuenta.cliente?.razonSocial}</p></div>
                <div><span className="text-gray-500">RIF/Cedula:</span><p className="font-medium">{cuenta.cliente?.rifCedula}</p></div>
                <div><span className="text-gray-500">Telefono:</span><p className="font-medium">{cuenta.cliente?.telefono || '-'}</p></div>
                <div><span className="text-gray-500">Correo:</span><p className="font-medium">{cuenta.cliente?.correo || '-'}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Detalle de la Factura</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div><span className="text-gray-500">Factura #</span><p className="font-medium">{cuenta.factura?.numeroFactura}</p></div>
                <div><span className="text-gray-500">Fecha Emision</span><p className="font-medium">{Utils.formatDate(cuenta.factura?.fechaEmision)}</p></div>
                <div><span className="text-gray-500">Vencimiento</span><p className="font-medium">{Utils.formatDate(cuenta.fechaVencimiento)}</p></div>
                <div><span className="text-gray-500">Dias Vencido</span><p className={`font-bold ${cuenta.diasVencido > 0 ? 'text-red-600' : 'text-green-600'}`}>{cuenta.diasVencido > 0 ? cuenta.diasVencido : 'Al dia'}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cant.</th><th className="text-right py-2">P. Unit.</th><th className="text-right py-2">Total</th></tr></thead>
                <tbody>
                  {cuenta.factura?.items?.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2">{item.descripcionHistorica}</td>
                      <td className="text-center py-2">{item.cantidad}</td>
                      <td className="text-right py-2">{Utils.formatMoney(item.precioUnitarioHistorico)}</td>
                      <td className="text-right py-2 font-medium">{Utils.formatMoney(item.totalLinea)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
              {cuenta.factura?.pagos?.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin pagos registrados</p>
              ) : (
                <div className="space-y-2">
                  {cuenta.factura?.pagos?.map((pago) => (
                    <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{Utils.formatMoney(pago.monto)} <span className="text-gray-500">({pago.monedaPago})</span></p>
                        <p className="text-xs text-gray-500">{pago.metodoPago} - {Utils.formatDate(pago.fechaPago)}</p>
                        {pago.tasaBCV && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            Tasa BCV: {Number(pago.tasaBCV).toFixed(2)} Bs/USD
                          </p>
                        )}
                      </div>
                      {pago.referenciaTransaccion && <p className="text-xs text-gray-400">{pago.referenciaTransaccion}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Gestiones de Cobranza</h3>
              {cuenta.gestions?.length === 0 ? (
                <p className="text-gray-400 text-sm">Sin gestiones registradas</p>
              ) : (
                <div className="space-y-2">
                  {cuenta.gestions?.map((g) => (
                    <div key={g.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">{g.accion}</span>
                        <span className="text-xs text-gray-400">{Utils.formatDateTime(g.fecha)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{g.notas}</p>
                      <p className="text-xs text-gray-400 mt-1">Por: {g.usuario?.nombre || g.usuario?.username}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: estado.color + '20', color: estado.color }}>
                  {estado.label}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Monto Original</span><span className="font-medium">{Utils.formatMoney(cuenta.montoOriginal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Monto Cobrado</span><span className="font-medium text-green-600">{Utils.formatMoney(cuenta.montoCobrado)}</span></div>
                <div className="border-t pt-3 flex justify-between"><span className="text-gray-500 font-semibold">Pendiente</span><span className="font-bold text-lg">{Utils.formatMoney(cuenta.montoPendiente)}</span></div>
              </div>
              {cuenta.estado !== 'PAID' && (
                <div className="mt-4 space-y-2">
                  <Button variant="primary" className="w-full" onClick={() => { setShowPago(true); setShowGestion(false); }}>
                    <Icon icon={cashIcon} width={16} height={16} className="mr-2" /> Registrar Pago
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => { setShowGestion(true); setShowPago(false); }}>
                    <Icon icon={phoneIcon} width={16} height={16} className="mr-2" /> Registrar Gestion
                  </Button>
                </div>
              )}
            </div>

            {showPago && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">Registrar Pago</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <input type="number" step="0.01" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                    {conversion?.montoUsd !== undefined && (
                      <p className="mt-1 text-xs text-gray-500">
                        Equivale a {Utils.formatMoney(conversion.montoUsd)} USD · tasa {conversion.tasaUsada} Bs/USD
                      </p>
                    )}
                    {conversion?.excedePendiente && (
                      <p className="mt-1 text-xs text-red-600">
                        Excede el pendiente ({Utils.formatMoney(cuenta.montoPendiente)}). Se aplicara solo {Utils.formatMoney(conversion.usdAplicable)}.
                      </p>
                    )}
                    {errors.monto && <FieldError message={errors.monto} />}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metodo de Pago</label>
                    <select value={pagoForm.metodoPago} onChange={(e) => setPagoForm({ ...pagoForm, metodoPago: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="CASH">Efectivo</option>
                      <option value="BANK_TRANSFER">Transferencia</option>
                      <option value="CREDIT_CARD">Tarjeta de Credito</option>
                      <option value="MOBILE_PAYMENT">Pago Movil</option>
                      <option value="PAGO_MOVIL">Pago Movil (alternativo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <select value={pagoForm.monedaPago} onChange={async (e) => {
                      const moneda = e.target.value;
                      const montoActual = Number(pagoForm.monto);
                      setPagoForm(p => ({ ...p, monedaPago: moneda }));
                      // Conserva el valor real del abono al cambiar de moneda,
                      // preguntando al backend la tasa que EL aplicaría.
                      if (montoActual > 0) {
                        const convActual = await consultarConversion(montoActual, pagoForm.monedaPago);
                        if (convActual?.montoUsd !== undefined) {
                          const enNueva = await consultarConversion(convActual.montoUsd, moneda);
                          if (enNueva?.maximoAceptable !== undefined) {
                            const equivalente = moneda === 'VES'
                              ? Number(convActual.montoUsd) * Number(enNueva.tasaUsada)
                              : Number(convActual.montoUsd);
                            setPagoForm(p => ({ ...p, monto: equivalente.toFixed(2) }));
                          }
                        }
                      }
                    }} className="w-full px-3 py-2 border rounded-lg">
                      <option value="USD">USD</option>
                      <option value="VES">VES (Bs.)</option>
                    </select>
                  </div>
                  {pagoForm.metodoPago !== 'CASH' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                      <input type="text" value={pagoForm.referenciaTransaccion} onChange={(e) => setPagoForm({ ...pagoForm, referenciaTransaccion: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                      {errors.referencia && <FieldError message={errors.referencia} />}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea value={pagoForm.notas} onChange={(e) => setPagoForm({ ...pagoForm, notas: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={handlePago} disabled={savingPago} className="flex-1">{savingPago ? 'Guardando...' : 'Registrar'}</Button>
                    <Button variant="ghost" onClick={() => setShowPago(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}

            {showGestion && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">Registrar Gestion</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Gestion</label>
                    <select value={gestionForm.accion} onChange={(e) => setGestionForm({ ...gestionForm, accion: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="LLAMADA">Llamada</option>
                      <option value="CORREO">Correo</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="VISITA">Visita</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                    <textarea value={gestionForm.notas} onChange={(e) => setGestionForm({ ...gestionForm, notas: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Describe la gestion realizada..." />
                    {errors.notasG && <FieldError message={errors.notasG} />}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={handleGestion} disabled={savingGestion} className="flex-1">{savingGestion ? 'Guardando...' : 'Registrar'}</Button>
                    <Button variant="ghost" onClick={() => setShowGestion(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
