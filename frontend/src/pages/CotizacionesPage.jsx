import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import flashIcon from '@iconify/icons-mdi/flash';
import closeIcon from '@iconify/icons-mdi/close';
import plusIcon from '@iconify/icons-mdi/plus';
import formatListBulleted from '@iconify/icons-mdi/format-list-bulleted';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { ReceiptModal } from '../components/ui/ReceiptModal';

const EMPTY_CLIENT = { razonSocial: '', rifCedula: '', direccion: '', telefono: '', correo: '' };

export function CotizacionesPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('historial'); // 'historial' | 'nueva'

  // ==========================================
  // ESTADO HISTORIAL
  // ==========================================
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  // ==========================================
  // ESTADO NUEVA COTIZACIÓN
  // ==========================================
  const [config, setConfig] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [validezDias, setValidezDias] = useState(15);
  const [loadingEmitir, setLoadingEmitir] = useState(false);

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [newCliente, setNewCliente] = useState(EMPTY_CLIENT);
  const [savingCliente, setSavingCliente] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastCotizacion, setLastCotizacion] = useState(null);

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  const loadHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const data = await API.getCotizaciones();
      setCotizaciones(data.cotizaciones || data || []);
    } catch (err) {
      showToast('Error al cargar cotizaciones: ' + err.message, 'error');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [confRes, cliRes, prodRes] = await Promise.all([
        API.getConfig(),
        API.getClientes(),
        API.getProductos({ limite: 100 })
      ]);
      setConfig(confRes);
      const clienteList = cliRes.data || cliRes.clientes || cliRes || [];
      setClientes(clienteList);
      setProductos(prodRes.data || []);
      if (clienteList.length > 0) {
        setSelectedClienteId(clienteList[0].id);
      }
    } catch (err) {
      showToast('Error cargando datos: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'historial') {
      loadHistorial();
    } else {
      loadInitialData();
    }
  }, [activeTab]);

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

  // ==========================================
  // LÓGICA HISTORIAL
  // ==========================================
  const handleConvertir = async (id) => {
    if (!window.confirm('¿Deseas convertir esta cotización en una factura de venta oficial?')) return;
    try {
      await API.convertirCotizacion(id);
      showToast('🎉 Cotización convertida en factura con éxito', 'success');
      loadHistorial();
    } catch (err) {
      showToast('Error al convertir cotización: ' + err.message, 'error');
    }
  };

  const handleVerCotizacion = async (id) => {
    try {
      const configRes = await API.getConfig();
      setConfig(configRes);
      const fullCotizacion = await API.getCotizacion(id);
      setLastCotizacion(fullCotizacion);
      setShowReceipt(true);
    } catch (err) {
      showToast('Error al cargar cotización: ' + err.message, 'error');
    }
  };

  // ==========================================
  // LÓGICA NUEVA COTIZACIÓN
  // ==========================================
  const tasaDolar = Number((config?.moneda?.tasaDolar || 1).toFixed(2));
  const currencySymbol = config?.moneda?.simbolo || '$';

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchResults;
  }, [searchTerm, searchResults]);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.productoId === product.id);
      if (exists) {
        return prev.map(item => item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, {
        productoId: product.id,
        nombre: product.nombre,
        precioUnitario: parseFloat(product.precioVenta),
        cantidad: 1,
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
    setCart(prev => prev.map(item => item.productoId === productoId ? { ...item, cantidad: qty } : item));
  };

  const removeFromCart = (productoId) => {
    setCart(prev => prev.filter(item => item.productoId !== productoId));
  };

  const totalUsd = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  }, [cart]);
  const totalVes = totalUsd * tasaDolar;

  const handleEmitirCotizacion = async (e) => {
    e.preventDefault();
    if (!selectedClienteId) {
      showToast('Selecciona un cliente', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    setLoadingEmitir(true);
    try {
      const payload = {
        clienteId: selectedClienteId,
        validezDias: parseInt(validezDias),
        items: cart.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        }))
      };

      const res = await API.crearCotizacion(payload);
      showToast(`🎉 Presupuesto #${res.numero || ''} emitido con éxito`, 'success');
      setCart([]);
      setValidezDias(15);
      
      // Mostrar el recibo de cotización
      setLastCotizacion(res);
      setShowReceipt(true);
    } catch (err) {
      showToast('Error al emitir cotización: ' + err.message, 'error');
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
      const cliRes = await API.getClientes();
      const clienteList = cliRes.data || cliRes.clientes || cliRes || [];
      setClientes(clienteList);
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
        title="Cotizaciones"
        subtitle={activeTab === 'historial' ? "Presupuestos emitidos y conversión a venta" : "Crear un nuevo presupuesto"}
        toggleSidebar={toggleSidebar}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={activeTab === 'historial' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('historial')}
              icon="mdi:format-list-bulleted"
            >
              Historial
            </Button>
            <Button
              variant={activeTab === 'nueva' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('nueva')}
              icon="mdi:plus"
            >
              Nueva Cotización
            </Button>
          </div>
        }
      />

      <div className="page-body">
        {activeTab === 'historial' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Historial de Cotizaciones</h3>
              <Button variant="secondary" size="sm" icon="mdi:refresh" onClick={loadHistorial}>
                Recargar
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Fecha Emisión</th>
                    <th>Validez</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingHistorial ? (
                    <tr>
                      <td colSpan={7} className="empty-state">Cargando cotizaciones...</td>
                    </tr>
                  ) : cotizaciones.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">No hay cotizaciones registradas</td>
                    </tr>
                  ) : (
                    cotizaciones.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>#{c.numero?.toString().padStart(5, '0')}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{c.cliente?.razonSocial || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.cliente?.rifCedula}</div>
                        </td>
                        <td>{Utils.formatDate(c.fechaEmision)}</td>
                        <td>{Utils.formatDate(c.fechaVencimiento || c.fechaValidez)}</td>
                        <td style={{ fontWeight: 700 }}>{Utils.formatMoney(c.total)}</td>
                        <td>
                          {c.estado === 'ACCEPTED' || c.estado === 'CONVERTED' ? (
                            <span className="badge badge-success">Convertida</span>
                          ) : (
                            <span className="badge badge-warning">Pendiente</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleVerCotizacion(c.id)}
                              className="btn btn-ghost btn-sm"
                              title="Ver / Imprimir Presupuesto"
                            >
                              <Icon icon="mdi:printer" className="h-4 w-4" />
                            </button>
                            {c.estado === 'PENDING' && (
                              <button
                                onClick={() => handleConvertir(c.id)}
                                className="btn btn-primary btn-sm"
                                title="Convertir a Factura"
                              >
                                <Icon icon={flashIcon} className="h-4 w-4" />
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
        )}

        {activeTab === 'nueva' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Cliente</label>
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

              <div className="card">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Buscar Producto (Código o Nombre)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe el nombre o escanea código de barras..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {searchLoading && searchTerm.trim() && (
                    <div className="small text-muted mt-2">Buscando productos...</div>
                  )}
                </div>

                {filteredProducts.length > 0 && (
                  <div style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        className="nav-item"
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Inventario: {p.stockActual} | SKU: {p.sku || 'N/A'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '150px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            {Utils.formatMoney(p.precioVenta, '$')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {Utils.formatMoney(Number((Number(p.precioVenta || 0) * tasaDolar).toFixed(2)), 'Bs.')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Detalle del Presupuesto ({cart.length} ítems)</h3>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                      Vaciar
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
                          <td colSpan={5} className="empty-state">No hay productos agregados</td>
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
                                onChange={e => updateQuantity(item.productoId, e.target.value)}
                              />
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                              {Utils.formatMoney(item.precioUnitario * item.cantidad, currencySymbol)}
                            </td>
                            <td>
                              <button
                                onClick={() => removeFromCart(item.productoId)}
                                className="btn btn-ghost btn-sm"
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

            <div className="card" style={{ position: 'sticky', top: '20px' }}>
              <h3 className="card-title" style={{ marginBottom: '16px' }}>Resumen</h3>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monto Aproximado (USD)</div>
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

              <form onSubmit={handleEmitirCotizacion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Días de Validez</label>
                  <select
                    className="form-control"
                    value={validezDias}
                    onChange={e => setValidezDias(e.target.value)}
                  >
                    <option value={7}>7 Días</option>
                    <option value={15}>15 Días</option>
                    <option value={30}>30 Días</option>
                    <option value={60}>60 Días</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loadingEmitir || cart.length === 0}
                  style={{ marginTop: '10px' }}
                >
                  {loadingEmitir ? 'Procesando...' : <><Icon icon="mdi:printer" className="h-4 w-4" /> Generar Presupuesto</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

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
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Dirección Fiscal</label>
                  <input className="form-control" value={newCliente.direccion}
                    onChange={e => setNewCliente(f => ({ ...f, direccion: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={newCliente.telefono}
                    onChange={e => setNewCliente(f => ({ ...f, telefono: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input className="form-control" type="email" value={newCliente.correo}
                    onChange={e => setNewCliente(f => ({ ...f, correo: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="ghost" onClick={() => setShowClienteModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" disabled={savingCliente}>
                  {savingCliente ? 'Guardando...' : 'Guardar Cliente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReceipt && (
        <ReceiptModal
          factura={lastCotizacion}
          config={config}
          onClose={() => setShowReceipt(false)}
          type="cotizacion"
        />
      )}
    </>
  );
}
