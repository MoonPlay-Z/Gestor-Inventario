import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import closeIcon from '@iconify/icons-mdi/close';
import cashIcon from '@iconify/icons-mdi/cash';
import flashIcon from '@iconify/icons-mdi/flash';
import lockOpenIcon from '@iconify/icons-mdi/lock-open';
import scaleIcon from '@iconify/icons-mdi/scale';
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
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState('factura');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO_USD');
  const [referencia, setReferencia] = useState('');
  const [cuotas, setCuotas] = useState(1);
  const [loadingEmitir, setLoadingEmitir] = useState(false);
  const [monedaVisualizacion, setMonedaVisualizacion] = useState('USD'); // 'USD' o 'VES'

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [newCliente, setNewCliente] = useState(EMPTY_CLIENT);
  const [savingCliente, setSavingCliente] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastFactura, setLastFactura] = useState(null);
  const [tipoUltimoDocumento, setTipoUltimoDocumento] = useState('factura');

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

  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await API.getProductos({ q: term, limit: 20 });
        if (!cancelled) setSearchResults(res.data || []);
      } catch (err) {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const tasaDolar = parseFloat(config?.moneda?.tasaDolar) || 1;
  const currencySymbol = config?.moneda?.simbolo || '$';

  // Buscador de productos por texto usando el backend
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchResults;
  }, [searchTerm, searchResults]);

  const addToCart = (product) => {
    const stockActual = Number(product.stockActual);
    if (!stockActual || stockActual <= 0) {
      showToast(`El producto "${product.nombre}" no tiene stock disponible`, 'warning');
      return;
    }

    setCart(prev => {
      const exists = prev.find(item => item.productoId === product.id);
      if (exists) {
        const nuevaCantidad = exists.cantidad + 1;
        if (nuevaCantidad > stockActual) {
          showToast(`Stock insuficiente. Disponible: ${stockActual}`, 'warning');
          return prev;
        }
        return prev.map(item => item.productoId === product.id ? { ...item, cantidad: nuevaCantidad } : item);
      }
      return [...prev, {
        productoId: product.id,
        nombre: product.nombre,
        precioUnitario: parseFloat(product.esVentaPorPeso ? product.precioPorKilo : product.precioVenta),
        cantidad: 1,
        stockMax: stockActual,
        unidadMedida: product.unidadMedida || 'UNIDAD',
        esVentaPorPeso: product.esVentaPorPeso || false,
        precioPorKilo: product.precioPorKilo ? parseFloat(product.precioPorKilo) : null,
        unidadPeso: 'kg', // Por defecto kilogramos
      }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (productoId, newQty) => {
    const qty = parseFloat(newQty);
    // No eliminar si es 0 o NaN, solo actualizar la cantidad
    if (isNaN(qty)) {
      return;
    }
    // Si es 0 o negativo, no hacer nada (no eliminar)
    if (qty <= 0) {
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productoId === productoId) {
        // Convertir a kg para validar stock
        const cantidadEnKg = item.unidadPeso === 'g' ? qty / 1000 : qty;
        if (cantidadEnKg > item.stockMax) {
          showToast(`Stock máximo disponible: ${item.stockMax} kg`, 'warning');
          return { ...item, cantidad: item.stockMax, unidadPeso: 'kg' };
        }
        // Para productos por peso, redondear a 3 decimales; para unidades, a enteros
        const cantidadFinal = item.esVentaPorPeso ? Math.round(qty * 1000) / 1000 : Math.round(qty);
        return { ...item, cantidad: cantidadFinal };
      }
      return item;
    }));
  };

  const cambiarUnidadPeso = (productoId, nuevaUnidad) => {
    setCart(prev => prev.map(item => {
      if (item.productoId === productoId && item.esVentaPorPeso) {
        // Convertir la cantidad a la nueva unidad
        let nuevaCantidad = item.cantidad;
        if (item.unidadPeso === 'kg' && nuevaUnidad === 'g') {
          nuevaCantidad = item.cantidad * 1000; // kg a g
        } else if (item.unidadPeso === 'g' && nuevaUnidad === 'kg') {
          nuevaCantidad = item.cantidad / 1000; // g a kg
        }
        return { ...item, unidadPeso: nuevaUnidad, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const removeFromCart = (productoId) => {
    setCart(prev => prev.filter(item => item.productoId !== productoId));
  };

  // Calcular subtotal según la unidad de peso (kg/g)
  const calcularSubtotal = (item) => {
    if (item.esVentaPorPeso) {
      // Si es venta por peso, el precio es por kg
      // Si la unidad es gramos, convertir a kg para el cálculo
      const cantidadEnKg = item.unidadPeso === 'g' ? Number(item.cantidad) / 1000 : Number(item.cantidad);
      return item.precioUnitario * cantidadEnKg;
    }
    // Productos normales (por unidad)
    return item.precioUnitario * Number(item.cantidad);
  };

  const totalUsd = useMemo(() => {
    return cart.reduce((acc, item) => acc + calcularSubtotal(item), 0);
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
    const tipoDocumentoEmitido = tipoDocumento;
    try {
      const paymentMethodMap = {
        'EFECTIVO_USD': 'CASH',
        'EFECTIVO_VES': 'CASH',
        'PAGO_MOVIL': 'MOBILE_PAYMENT',
        'PUNTO': 'CREDIT_CARD',
        'TRANSFERENCIA': 'BANK_TRANSFER'
      };

      const payload = {
        clienteId: selectedClienteId,
        moneda: 'USD',
        tasaCambio: tasaDolar,
        monedaPago: metodoPago === 'EFECTIVO_VES' ? 'VES' : 'USD',
        items: cart.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          unidadPeso: item.unidadPeso || 'kg', // Enviar la unidad de peso al backend
        })),
        metodoPago: metodoPago ? paymentMethodMap[metodoPago] : null,
        referenciaTransaccion: referencia || null,
        fechaVencimiento: new Date().toISOString(),
        cuotas: parseInt(cuotas) || 1,
      };

      const res = await API.emitirFactura(payload);
      showToast(
        tipoDocumentoEmitido === 'nota-entrega'
          ? 'Nota de entrega generada con éxito'
          : `🎉 ¡Factura #${res.numeroFactura || ''} emitida con éxito!`,
        'success'
      );
      setCart([]);
      setReferencia('');
      setCuotas(1);
      setTipoDocumento('factura');
      
      // Mostrar el recibo
      setLastFactura(res);
      setTipoUltimoDocumento(tipoDocumentoEmitido);
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
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              No hay ningún turno activo. Para realizar ventas, primero debes <strong>abrir la caja</strong> desde el módulo de Cierre de Caja.
            </p>
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
                {searchLoading && searchTerm.trim() && (
                  <div className="small text-muted mt-2">Buscando productos...</div>
                )}
              </div>

              {filteredProducts.length > 0 && (
                <div style={{ marginTop: '12px', maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                      className="nav-item hover:bg-[var(--surface3)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.imagenUrl ? (
                          <img src={p.imagenUrl} alt={p.nombre} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Icon icon="mdi:package-variant" className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Stock: {p.stockActual}</span>
                            {p.esVentaPorPeso && (
                              <span style={{ 
                                background: 'rgba(16, 185, 129, 0.15)', 
                                color: 'var(--success)', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}>
                                <Icon icon={scaleIcon} style={{ fontSize: '0.85em', verticalAlign: 'middle', marginRight: '2px' }} />
                                Por peso
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            SKU: {p.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '140px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
                            {Utils.formatMoney(p.esVentaPorPeso ? p.precioPorKilo : p.precioVenta, '$')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {Utils.formatMoney(Number((Number(p.esVentaPorPeso ? p.precioPorKilo : p.precioVenta || 0) * tasaDolar).toFixed(2)), 'Bs.')}
                        </div>
                        {p.esVentaPorPeso && p.precioPorKilo && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            ${Number(p.precioPorKilo || 0).toFixed(2)}/kg
                          </div>
                        )}
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
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                            {item.esVentaPorPeso && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Icon icon={scaleIcon} style={{ fontSize: '0.9em' }} />
                                Venta por peso
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{Utils.formatMoney(item.precioUnitario, '$')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              {Utils.formatMoney(item.precioUnitario * tasaDolar, 'Bs.')}
                            </div>
                            {item.esVentaPorPeso && (
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                por kg
                              </div>
                            )}
                          </td>
                          <td>
                            {item.esVentaPorPeso ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="number"
                                    step={item.unidadPeso === 'g' ? '1' : '0.001'}
                                    className="form-control"
                                    style={{ width: '80px', padding: '4px 8px' }}
                                    value={item.cantidad}
                                    min={item.unidadPeso === 'g' ? '1' : '0.001'}
                                    max={item.unidadPeso === 'g' ? item.stockMax * 1000 : item.stockMax}
                                    onChange={e => updateQuantity(item.productoId, e.target.value)}
                                  />
                                  <select
                                    value={item.unidadPeso || 'kg'}
                                    onChange={e => cambiarUnidadPeso(item.productoId, e.target.value)}
                                    style={{ 
                                      padding: '4px 8px', 
                                      borderRadius: '4px', 
                                      border: '1px solid var(--border)',
                                      fontSize: '0.75rem',
                                      background: 'var(--bg-secondary)'
                                    }}
                                  >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                  </select>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                  = {(item.unidadPeso === 'g' ? Number(item.cantidad) / 1000 : Number(item.cantidad)).toFixed(3)} kg
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="number"
                                  step="1"
                                  className="form-control"
                                  style={{ width: '70px', padding: '4px 8px' }}
                                  value={item.cantidad}
                                  min={1}
                                  max={item.stockMax}
                                  onChange={e => updateQuantity(item.productoId, e.target.value)}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {item.unidadMedida === 'UNIDAD' ? 'ud' : item.unidadMedida.toLowerCase()}
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            <div>{Utils.formatMoney(calcularSubtotal(item), '$')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              {Utils.formatMoney(calcularSubtotal(item) * tasaDolar, 'Bs.')}
                            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Resumen de Cobro</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => setMonedaVisualizacion('USD')}
                  className={`btn btn-sm ${monedaVisualizacion === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  $
                </button>
                <button 
                  onClick={() => setMonedaVisualizacion('VES')}
                  className={`btn btn-sm ${monedaVisualizacion === 'VES' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Bs.
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border)' }}>
              {monedaVisualizacion === 'USD' ? (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total a Pagar (USD)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {Utils.formatMoney(totalUsd, '$')}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasa: {tasaDolar.toFixed(2)}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                      {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total a Pagar (VES)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                    {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasa: {tasaDolar.toFixed(2)}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {Utils.formatMoney(totalUsd, '$')}
                    </span>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleEmitirFactura} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tipo-documento-venta">Documento para el cliente</label>
                <select
                  id="tipo-documento-venta"
                  className="form-control"
                  value={tipoDocumento}
                  onChange={e => setTipoDocumento(e.target.value)}
                >
                  <option value="factura">Factura</option>
                  <option value="nota-entrega">Nota de entrega</option>
                </select>
                {tipoDocumento === 'nota-entrega' && (
                  <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-secondary)' }}>
                    La venta y el pago se guardarán; el comprobante impreso no será una factura fiscal.
                  </small>
                )}
              </div>

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
                  <option value="EFECTIVO_USD">Efectivo en USD</option>
                  <option value="EFECTIVO_VES">Efectivo en Bs.</option>
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

              {metodoPago && !['EFECTIVO_USD', 'EFECTIVO_VES'].includes(metodoPago) && (
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
          type={tipoUltimoDocumento}
        />
      )}
    </>
  );
}
