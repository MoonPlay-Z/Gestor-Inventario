import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import closeIcon from '@iconify/icons-mdi/close';
import cashIcon from '@iconify/icons-mdi/cash';
import flashIcon from '@iconify/icons-mdi/flash';
import lockOpenIcon from '@iconify/icons-mdi/lock-open';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { ReceiptModal } from '../components/ui/ReceiptModal';

const EMPTY_CLIENT = { razonSocial: '', rifCedula: '', direccion: '', telefono: '', correo: '' };

export function PosPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cajaStatus, setCajaStatus] = useState(null);
  const [cajaLoading, setCajaLoading] = useState(true);

  const [config, setConfig] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');
  const [cuotas, setCuotas] = useState(1);
  const [loadingEmitir, setLoadingEmitir] = useState(false);

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [newCliente, setNewCliente] = useState(EMPTY_CLIENT);
  const [savingCliente, setSavingCliente] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastFactura, setLastFactura] = useState(null);

  const loadInitialData = async () => {
    try {
      const [confRes, cliRes, prodRes, cajaRes] = await Promise.all([
        API.getConfig(),
        API.getClientes(),
        API.getProductos({ limite: 100 }),
        API.getCajaActual().catch(() => ({ status: 'CLOSED' }))
      ]);
      setConfig(confRes);
      const clienteList = cliRes.data || cliRes.clientes || cliRes || [];
      setClientes(clienteList);
      setProductos(prodRes.data || []);
      if (clienteList.length > 0) {
        setSelectedClienteId(clienteList[0].id);
      }
      setCajaStatus(cajaRes?.estado === 'OPEN' ? 'OPEN' : 'CLOSED');
    } catch (err) {
      showToast('Error cargando datos del POS: ' + err.message, 'error');
      setCajaStatus('CLOSED');
    } finally {
      setCajaLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const tasaDolar = config?.moneda?.tasaDolar || 1;
  const currencySymbol = config?.moneda?.simbolo || '$';

  // Buscador de productos filtrado
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return productos.filter(p => {
      const matchNombre = p.nombre ? p.nombre.toLowerCase().includes(term) : false;
      const matchSku = p.sku ? p.sku.toLowerCase().includes(term) : false;
      return matchNombre || matchSku;
    });
  }, [searchTerm, productos]);

  const addToCart = (product) => {
    if (product.stockActual <= 0) {
      showToast(`El producto "${product.nombre}" no tiene stock disponible`, 'warning');
      return;
    }

    setCart(prev => {
      const exists = prev.find(item => item.productoId === product.id);
      if (exists) {
        if (exists.cantidad + 1 > product.stockActual) {
          showToast(`Stock insuficiente. Disponible: ${product.stockActual}`, 'warning');
          return prev;
        }
        return prev.map(item => item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, {
        productoId: product.id,
        nombre: product.nombre,
        precioUnitario: parseFloat(product.precioVenta),
        cantidad: 1,
        stockMax: product.stockActual
      }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productoId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productoId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productoId === productoId) {
        if (qty > item.stockMax) {
          showToast(`Stock máximo disponible: ${item.stockMax}`, 'warning');
          return { ...item, cantidad: item.stockMax };
        }
        return { ...item, cantidad: qty };
      }
      return item;
    }));
  };

  const removeFromCart = (productoId) => {
    setCart(prev => prev.filter(item => item.productoId !== productoId));
  };

  const totalUsd = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  }, [cart]);

  const totalVes = totalUsd * tasaDolar;

  const handleEmitirFactura = async (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      showToast('Selecciona un cliente para la factura', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    setLoadingEmitir(true);
    try {
      const paymentMethodMap = {
        'EFECTIVO': 'CASH',
        'PAGO_MOVIL': 'MOBILE_PAYMENT',
        'PUNTO': 'CREDIT_CARD',
        'TRANSFERENCIA': 'BANK_TRANSFER'
      };

      const payload = {
        clienteId: selectedClienteId,
        items: cart.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
        metodoPago: metodoPago ? paymentMethodMap[metodoPago] : null,
        referenciaTransaccion: referencia || null,
        fechaVencimiento: new Date().toISOString(),
        cuotas: parseInt(cuotas),
      };

      const res = await API.emitirFactura(payload);
      showToast(`🎉 ¡Factura #${res.numeroFactura || ''} emitida con éxito!`, 'success');
      setCart([]);
      setReferencia('');
      setCuotas(1);
      
      // Mostrar el recibo
      setLastFactura(res);
      setShowReceipt(true);
      // Recargar productos para refrescar el stock actualizado
      const prodRes = await API.getProductos({ limite: 100 });
      setProductos(prodRes.data || []);
    } catch (err) {
      showToast('Error al emitir factura: ' + err.message, 'error');
    } finally {
      setLoadingEmitir(false);
    }
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    setSavingCliente(true);
    try {
      const res = await API.crearCliente(newCliente);
      showToast('Cliente creado exitosamente', 'success');
      // Refrescar lista de clientes
      const cliRes = await API.getClientes();
      const clienteList = cliRes.data || cliRes.clientes || cliRes || [];
      setClientes(clienteList);
      // Auto-seleccionar el nuevo cliente
      setSelectedClienteId(res.id);
      setShowClienteModal(false);
      setNewCliente(EMPTY_CLIENT);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingCliente(false);
    }
  };

  return (
    <>
      <Header
        title="Nueva Factura (POS)"
        subtitle="Venta rápida multitasa en dólares y bolívares"
        toggleSidebar={toggleSidebar}
      />

      {/* ── Bloqueo: sin turno activo ── */}
      {cajaLoading ? (
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Verificando estado de caja...</div>
        </div>
      ) : cajaStatus !== 'OPEN' ? (
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
              <Icon icon={lockOpenIcon} style={{ fontSize: '4rem', color: 'var(--danger)' }} />
            </div>
            <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Turno No Iniciado</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>
              No hay ningún turno activo. Para realizar ventas, primero debes <strong>abrir la caja</strong> desde el módulo de Cierre de Caja.
            </p>
            <Button
              variant="primary"
              icon="mdi:lock-open"
              onClick={() => navigate('/app/caja')}
            >
              Ir a Cierre de Caja
            </Button>
          </div>
        </div>
      ) : (
      <div className="page-body">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Panel Izquierdo: Selección de Cliente y Buscador de Productos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Cliente Seleccionado</label>
                  <Button variant="ghost" size="sm" icon="mdi:account-plus" onClick={() => setShowClienteModal(true)}>
                    Nuevo Cliente
                  </Button>
                </div>
                <select
                  className="form-control"
                  value={selectedClienteId}
                  onChange={e => setSelectedClienteId(e.target.value)}
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.razonSocial} — ({c.rifCedula})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buscador de Productos */}
            <div className="card">
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Buscar Producto (Código o Nombre)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escribe el nombre o escanea código de barras..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              {filteredProducts.length > 0 && (
                <div style={{ marginTop: '12px', maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                      className="nav-item hover:bg-[var(--surface3)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.imagenUrl ? (
                          <img src={p.imagenUrl} alt={p.nombre} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Icon icon="mdi:package-variant" className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stock: {p.stockActual} | SKU: {p.sku || 'N/A'}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {Utils.formatMoney(p.precioVenta, currencySymbol)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabla del Carrito */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Detalle de la Venta ({cart.length} ítems)</h3>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                    Vaciar Carrito
                  </button>
                )}
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio Unit.</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">No hay productos agregados al carrito</td>
                      </tr>
                    ) : (
                      cart.map(item => (
                        <tr key={item.productoId}>
                          <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                          <td>{Utils.formatMoney(item.precioUnitario, currencySymbol)}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              style={{ width: '70px', padding: '4px 8px' }}
                              value={item.cantidad}
                              min={1}
                              max={item.stockMax}
                              onChange={e => updateQuantity(item.productoId, e.target.value)}
                            />
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            {Utils.formatMoney(item.precioUnitario * item.cantidad, currencySymbol)}
                          </td>
                          <td>
                            <button
                              onClick={() => removeFromCart(item.productoId)}
                              className="btn btn-ghost btn-sm inline-flex items-center justify-center"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Icon icon={closeIcon} className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Resumen Financiero y Pago */}
          <div className="card" style={{ position: 'sticky', top: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '16px' }}>Resumen de Cobro</h3>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total a Pagar (USD)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                {Utils.formatMoney(totalUsd, currencySymbol)}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasa de Cambio: {tasaDolar.toFixed(2)}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                  {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                </span>
              </div>
            </div>

            <form onSubmit={handleEmitirFactura} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Método de Pago</label>
                <select
                  className="form-control"
                  value={metodoPago}
                  onChange={e => {
                    setMetodoPago(e.target.value);
                    if (e.target.value !== '') setCuotas(1); // Si paga al contado, cuotas = 1
                  }}
                >
                  <option value="EFECTIVO">EFECTIVO (USD / VES)</option>
                  <option value="PAGO_MOVIL">Pago Móvil</option>
                  <option value="PUNTO">Punto de Venta</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="">(Facturar a Crédito / Financiado)</option>
                </select>
              </div>

              {!metodoPago && (
                <div className="form-group">
                  <label className="form-label">Número de Cuotas</label>
                  <select
                    className="form-control"
                    value={cuotas}
                    onChange={e => setCuotas(e.target.value)}
                  >
                    <option value={1}>1 (Pago Pendiente Único)</option>
                    <option value={2}>2 Cuotas</option>
                    <option value={3}>3 Cuotas</option>
                    <option value={4}>4 Cuotas</option>
                  </select>
                </div>
              )}

              {metodoPago && metodoPago !== 'EFECTIVO' && (
                <div className="form-group">
                  <label className="form-label">Número de Referencia</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 987654"
                    value={referencia}
                    onChange={e => setReferencia(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loadingEmitir || cart.length === 0}
                style={{ marginTop: '10px' }}
              >
                {loadingEmitir ? 'Procesando Venta...' : <><Icon icon={flashIcon} className="h-4 w-4" /> Completar Venta</>}
              </button>
            </form>
          </div>
        </div>
      </div>
      )} {/* end caja ternary */}

      {/* Modal Nuevo Cliente */}
      {showClienteModal && (
        <div className="modal-overlay open" onClick={() => setShowClienteModal(false)}>
          <div className="modal" style={{ maxWidth: '500px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Cliente</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowClienteModal(false)} icon="mdi:close" />
            </div>
            <form onSubmit={handleCrearCliente}>
              <div className="modal-body form-grid">
                <div className="form-group">
                  <label className="form-label">Razón Social o Nombre <span className="required">*</span></label>
                  <input className="form-control" value={newCliente.razonSocial}
                    onChange={e => setNewCliente(f => ({ ...f, razonSocial: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Documento / ID Fiscal <span className="required">*</span></label>
                  <input className="form-control" value={newCliente.rifCedula}
                    placeholder="Ej: J-123456789 / NIT 900123 / RUT 12345678-9"
                    onChange={e => setNewCliente(f => ({ ...f, rifCedula: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección Fiscal / Entrega</label>
                  <input className="form-control" value={newCliente.direccion}
                    onChange={e => setNewCliente(f => ({ ...f, direccion: e.target.value }))} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" value={newCliente.telefono}
                      onChange={e => setNewCliente(f => ({ ...f, telefono: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input type="email" className="form-control" value={newCliente.correo}
                      onChange={e => setNewCliente(f => ({ ...f, correo: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setShowClienteModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={savingCliente}>Crear Cliente</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recibo (Factura) */}
      {showReceipt && (
        <ReceiptModal
          factura={lastFactura}
          config={config}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
