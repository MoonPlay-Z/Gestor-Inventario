import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';

const EMPTY_FORM = {
  sku: '', nombre: '', descripcion: '', imagenUrl: '', categoria: 'General',
  precioVenta: '', costoCompra: '0', tasaImpuesto: '16',
  stockActual: '0', stockMinimo: '5', activo: true,
  // ── NUEVOS CAMPOS ──
  unidadMedida: 'UNIDAD',
  esVentaPorPeso: false,
  precioPorKilo: '',
  toleranciaPeso: '',
};

const UNIDADES_MEDIDA = [
  { value: 'UNIDAD', label: 'Unidad (Ud)' },
  { value: 'KILOGRAMO', label: 'Kilogramo (kg)' },
  { value: 'GRAMO', label: 'Gramo (g)' },
  { value: 'LITRO', label: 'Litro (L)' },
  { value: 'MILILITRO', label: 'Mililitro (ml)' },
  { value: 'METRO', label: 'Metro (m)' },
  { value: 'CENTIMETRO', label: 'Centímetro (cm)' },
  { value: 'BULTO', label: 'Bulto' },
  { value: 'PAQUETE', label: 'Paquete' },
  { value: 'CAJA', label: 'Caja' },
  { value: 'SACO', label: 'Saco' },
  { value: 'BOTELLA', label: 'Botella' },
  { value: 'LATA', label: 'Lata' },
  { value: 'DOCENA', label: 'Docena (12)' },
  { value: 'MEDIA_DOCENA', label: 'Media Docena (6)' },
];

export function InventarioPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState(['General']);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockTarget, setStockTarget] = useState(null);
  const [stockForm, setStockForm] = useState({ cantidad: '', operacion: 'set' });
  const [metricas, setMetricas] = useState(null);
  const [skuTocado, setSkuTocado] = useState(false);
  const debounceRef = useRef(null);
  const LIMIT = 20;

  const loadMetricas = useCallback(async () => {
    try {
      const data = await API.getMetricasInventario();
      setMetricas(data);
    } catch (err) {
      console.error('Error cargando métricas:', err);
    }
  }, []);

  const loadProductos = useCallback(async (q, p, bajo, cat) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (q) params.q = q;
      if (bajo) params.stockBajo = 'true';
      if (cat) params.categoria = cat;
      const data = await API.getProductos(params);
      setProductos(data.data || []);
      setTotal(data.total || 0);
      
      // Auto-actualizar categorías disponibles
      const nuevasCategorias = new Set(categorias);
      (data.data || []).forEach(p => {
        if (p.categoria && !nuevasCategorias.has(p.categoria)) {
          nuevasCategorias.add(p.categoria);
        }
      });
      setCategorias(Array.from(nuevasCategorias).sort());
    } catch (err) {
      showToast('Error al cargar productos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [categorias]);

  useEffect(() => { 
    loadProductos(search, page, soloStockBajo, categoriaFiltro); 
    loadMetricas();
  }, [page, soloStockBajo, categoriaFiltro]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadProductos(val, 1, soloStockBajo, categoriaFiltro), 350);
  };

  const openCreate = async () => {
    setEditTarget(null);
    setFieldErrors({});
    setSkuTocado(false);
    try {
      const { sku } = await API.getNextSku();
      setForm({ ...EMPTY_FORM, sku });
    } catch { setForm({ ...EMPTY_FORM }); }
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setFieldErrors({});
    setForm({
      sku: p.sku, nombre: p.nombre, descripcion: p.descripcion || '',
      imagenUrl: p.imagenUrl || '',
      categoria: p.categoria || 'General', precioVenta: p.precioVenta,
      costoCompra: p.costoCompra, tasaImpuesto: p.tasaImpuesto,
      stockActual: p.stockActual, stockMinimo: p.stockMinimo, activo: p.activo,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      if (editTarget) {
        await API.actualizarProducto(editTarget.id, form);
        showToast('Producto actualizado', 'success');
      } else {
        // Si el SKU no fue modificado manualmente, obtener el siguiente automáticamente
        let skuFinal = form.sku;
        if (!skuTocado) {
          try {
            const { sku } = await API.getNextSku();
            skuFinal = sku;
          } catch {
            // Si falla, usar el SKU del formulario
          }
        }
        // Preparar datos para enviar (manejar campos de venta por peso)
        const datosProducto = { ...form, sku: skuFinal };
        
        // Si no es venta por peso, enviar null para estos campos
        if (!form.esVentaPorPeso) {
          datosProducto.precioPorKilo = null;
          datosProducto.toleranciaPeso = null;
        } else {
          // Si es venta por peso, asegurar que los valores sean números
          datosProducto.precioPorKilo = form.precioPorKilo ? parseFloat(form.precioPorKilo) : null;
          datosProducto.toleranciaPeso = form.toleranciaPeso ? parseFloat(form.toleranciaPeso) : null;
        }
        
        await API.crearProducto(datosProducto);
        showToast('Producto creado', 'success');
      }
      setShowModal(false);
      loadProductos(search, page, soloStockBajo, categoriaFiltro);
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (p) => {
    if (!window.confirm(`¿Desactivar "${p.nombre}"?`)) return;
    try {
      await API.eliminarProducto(p.id);
      showToast('Producto desactivado', 'success');
      loadProductos(search, page, soloStockBajo);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleStockSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.ajustarStock(stockTarget.id, parseInt(stockForm.cantidad), stockForm.operacion);
      showToast('Stock ajustado', 'success');
      setShowStockModal(false);
      loadProductos(search, page, soloStockBajo);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <Header
        title="Inventario de Productos"
        subtitle={`${total} producto${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
        toggleSidebar={toggleSidebar}
        actions={
          <Button onClick={openCreate} variant="primary" size="sm" icon="mdi:plus">
            Nuevo Producto
          </Button>
        }
      />
      <div className="page-body">
        {/* Resumen de inventario */}
        <div className="metric-grid" style={{ marginBottom: '1rem' }}>
          <div className="metric-card accent">
            <div className="metric-icon"><Icon icon="mdi:cash" className="h-6 w-6" /></div>
            <div>
              <div className="metric-value">{metricas ? Utils.formatMoney(metricas.valorTotalVenta) : '...'}</div>
              <div className="metric-label">Valor Total Inventario</div>
            </div>
          </div>
          <div className="metric-card success">
            <div className="metric-icon"><Icon icon="mdi:trending-up" className="h-6 w-6" /></div>
            <div>
              <div className="metric-value">{metricas ? Utils.formatMoney(metricas.gananciaPotencial) : '...'}</div>
              <div className="metric-label">Ganancias Netas</div>
            </div>
          </div>
          <div className="metric-card warning">
            <div className="metric-icon"><Icon icon="mdi:package-variant" className="h-6 w-6" /></div>
            <div>
              <div className="metric-value">{metricas ? Utils.formatMoney(metricas.valorTotalCosto) : '...'}</div>
              <div className="metric-label">Valor Invertido (Costo)</div>
            </div>
          </div>
          <div className="metric-card danger">
            <div className="metric-icon"><Icon icon="mdi:alert" className="h-6 w-6" /></div>
            <div>
              <div className="metric-value">{metricas ? metricas.productosStockBajo : '...'}</div>
              <div className="metric-label">Stock Bajo</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" className="form-control" placeholder="Buscar por nombre, SKU, categoría..."
              value={search} onChange={handleSearchChange} style={{ flex: 1, minWidth: '220px' }} />
            <select 
              className="form-select" 
              style={{ width: 'auto', minWidth: '150px' }}
              value={categoriaFiltro} 
              onChange={(e) => { setCategoriaFiltro(e.target.value); setPage(1); }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={soloStockBajo} onChange={(e) => { setSoloStockBajo(e.target.checked); setPage(1); }} style={{ accentColor: 'var(--danger)' }} />
              Solo stock bajo
            </label>
            <button onClick={() => loadProductos(search, page, soloStockBajo, categoriaFiltro)} className="btn btn-secondary btn-sm inline-flex items-center gap-1">
              <Icon icon="mdi:refresh" className="h-4 w-4" /> Recargar
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Imagen</th><th>SKU</th><th>Nombre / Categoría</th><th>Precio USD</th>
                  <th>Costo</th><th>Ganancia</th><th>IVA %</th><th>Stock</th><th>Mín.</th>
                  <th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="empty-state">Cargando productos...</td></tr>
                ) : productos.length === 0 ? (
                  <tr><td colSpan={11} className="empty-state">No se encontraron productos</td></tr>
                ) : productos.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.imagenUrl ? (
                        <img
                          src={p.imagenUrl}
                          alt={p.nombre}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <Icon icon="mdi:package-variant" className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td><code style={{ fontSize: '0.78rem', background: 'var(--surface3)', padding: '2px 6px', borderRadius: '4px' }}>{p.sku}</code></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.categoria}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{Utils.formatMoney(p.precioVenta)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{Utils.formatMoney(p.costoCompra)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{Utils.formatMoney(p.precioVenta - p.costoCompra)}</td>
                    <td>{p.tasaImpuesto}%</td>
                    <td>
                      <span style={{ fontWeight: 700, color: p.stockBajoMinimo ? 'var(--danger)' : 'var(--success)' }}>
                        {p.stockActual}
                        {p.stockBajoMinimo && <Icon icon="mdi:alert" style={{ marginLeft: '4px', fontSize: '0.85em' }} />}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.stockMinimo}</td>
                    <td>{p.activo ? <span className="badge badge-success">Activo</span> : <span className="badge badge-danger">Inactivo</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => { setStockTarget(p); setStockForm({ cantidad: '', operacion: 'set' }); setShowStockModal(true); }}
                          className="btn btn-ghost btn-sm" title="Ajustar stock">
                          <Icon icon="mdi:package-variant-plus" className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" title="Editar">
                          <Icon icon="mdi:pencil" className="h-4 w-4" />
                        </button>
                        {p.activo && (
                          <button onClick={() => handleEliminar(p)} className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)' }} title="Desactivar">
                            <Icon icon="mdi:archive-off" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><Icon icon="mdi:chevron-left" /></button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Página {page} de {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><Icon icon="mdi:chevron-right" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Producto */}
      {showModal && (
        <div className="modal-overlay open" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className="modal" style={{ maxWidth: '650px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><Icon icon="mdi:close" className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {/* ── SECCIÓN: INFORMACIÓN BÁSICA ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Información Básica
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Nombre del Producto <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input className={`form-control${fieldErrors.nombre ? ' is-invalid' : ''}`} value={form.nombre}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Coca Cola 1.5L" required />
                      {fieldErrors.nombre && <div className="form-error">{fieldErrors.nombre}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">SKU</label>
                      <input className={`form-control${fieldErrors.sku ? ' is-invalid' : ''}`} value={form.sku}
                        onChange={e => { 
                          setSkuTocado(true);
                          setForm(f => ({ ...f, sku: e.target.value }));
                        }} placeholder="PROD-00001" />
                      {fieldErrors.sku && <div className="form-error">{fieldErrors.sku}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Categoría</label>
                      <input className="form-control" value={form.categoria}
                        onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} placeholder="General" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Descripción</label>
                      <textarea className="form-control" rows={2} value={form.descripcion}
                        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción del producto..." />
                    </div>
                  </div>
                </div>

                {/* ── SECCIÓN: IMAGEN ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Imagen del Producto
                  </h4>
                  <div className="form-group">
                    <label className="form-label">URL de Imagen</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <input className="form-control" value={form.imagenUrl}
                        onChange={e => setForm(f => ({ ...f, imagenUrl: e.target.value }))}
                        placeholder="https://ejemplo.com/imagen.jpg" />
                      {form.imagenUrl && (
                        <img src={form.imagenUrl} alt="Vista previa" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} onError={e => { e.target.style.display = 'none'; }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                      Enlace directo a la imagen del producto para mostrar en el POS y catálogo.
                    </span>
                  </div>
                </div>

                {/* ── SECCIÓN: UNIDAD DE MEDIDA Y VENTA ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Unidad de Medida y Tipo de Venta
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Unidad de Medida</label>
                      <select className="form-control" value={form.unidadMedida}
                        onChange={e => setForm(f => ({ ...f, unidadMedida: e.target.value }))}>
                        {UNIDADES_MEDIDA.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Venta por Peso</label>
                      <div style={{ 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        background: form.esVentaPorPeso ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                        border: `1px solid ${form.esVentaPorPeso ? 'var(--success)' : 'var(--border)'}`
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={form.esVentaPorPeso}
                            onChange={e => setForm(f => ({ ...f, esVentaPorPeso: e.target.checked }))} />
                          <span style={{ fontSize: '0.875rem' }}>
                            {form.esVentaPorPeso ? 'Sí, se vende por peso' : 'No, se vende por unidad'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ── CAMPOS DE VENTA POR PESO ── */}
                  {form.esVentaPorPeso && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '1rem', 
                      background: 'rgba(16, 185, 129, 0.05)', 
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Precio por Kilo (USD) <span style={{ color: 'var(--danger)' }}>*</span></label>
                          <input type="number" step="0.01" min="0.01" className="form-control" 
                            value={form.precioPorKilo}
                            onChange={e => setForm(f => ({ ...f, precioPorKilo: e.target.value }))}
                            placeholder="Ej: 3.00" required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Tolerancia de Peso (%)</label>
                          <input type="number" step="0.01" min="0" max="100" className="form-control" 
                            value={form.toleranciaPeso}
                            onChange={e => setForm(f => ({ ...f, toleranciaPeso: e.target.value }))}
                            placeholder="Ej: 5" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                            % de tolerancia (ej: 5% para verduras)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── SECCIÓN: PRECIOS Y STOCK ── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Precios y Stock
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Precio de Venta (USD) <span style={{ color: 'var(--danger)' }}>*</span>
                        <span className="help-icon" title="Precio al que se vende el producto al cliente. Es el monto final que paga el comprador.">?</span>
                      </label>
                      <input type="number" step="0.01" min="0.01" className={`form-control${fieldErrors.precioVenta ? ' is-invalid' : ''}`}
                        value={form.precioVenta} onChange={e => setForm(f => ({ ...f, precioVenta: e.target.value }))} required />
                      {fieldErrors.precioVenta && <div className="form-error">{fieldErrors.precioVenta}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Costo de Compra (USD)
                        <span className="help-icon" title="Precio al que se adquirió el producto del proveedor. Se usa para calcular la ganancia bruta.">?</span>
                      </label>
                      <input type="number" step="0.01" min="0" className="form-control" value={form.costoCompra}
                        onChange={e => setForm(f => ({ ...f, costoCompra: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        IVA (%)
                        <span className="help-icon" title="Porcentaje de impuesto al valor agregado que se aplica al precio de venta.">?</span>
                      </label>
                      <input type="number" step="0.01" min="0" max="100" className="form-control" value={form.tasaImpuesto}
                        onChange={e => setForm(f => ({ ...f, tasaImpuesto: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Stock Actual
                        <span className="help-icon" title="Cantidad disponible en inventario para la venta.">?</span>
                      </label>
                      <input type="number" step="0.0001" min="0" className="form-control" value={form.stockActual}
                        onChange={e => setForm(f => ({ ...f, stockActual: e.target.value }))} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                        {form.unidadMedida === 'KILOGRAMO' || form.unidadMedida === 'GRAMO' ? 'Peso en kg' : 'Cantidad en unidades'}
                      </span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Stock Mínimo
                        <span className="help-icon" title="Cantidad mínima en inventario antes de generar una alerta de stock bajo.">?</span>
                      </label>
                      <input type="number" step="0.0001" min="0" className="form-control" value={form.stockMinimo}
                        onChange={e => setForm(f => ({ ...f, stockMinimo: e.target.value }))} />
                    </div>
                    {editTarget && (
                      <div className="form-group">
                        <label className="form-label">Estado</label>
                        <select className="form-control" value={form.activo ? 'true' : 'false'}
                          onChange={e => setForm(f => ({ ...f, activo: e.target.value === 'true' }))}>
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editTarget ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajuste de Stock */}
      {showStockModal && stockTarget && (
        <div className="modal-overlay open" onClick={() => setShowStockModal(false)}>
          <div className="modal" style={{ maxWidth: '380px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Ajustar Stock</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowStockModal(false)}><Icon icon="mdi:close" className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleStockSave}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{stockTarget.nombre}</strong><br />
                  Stock actual: <strong style={{ color: 'var(--accent)' }}>{stockTarget.stockActual} uds</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Operación</label>
                  <select className="form-control" value={stockForm.operacion}
                    onChange={e => setStockForm(f => ({ ...f, operacion: e.target.value }))}>
                    <option value="add">+ Sumar</option>
                    <option value="sub">- Restar</option>
                    <option value="set">= Establecer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad</label>
                  <input type="number" min="0" className="form-control" value={stockForm.cantidad}
                    onChange={e => setStockForm(f => ({ ...f, cantidad: e.target.value }))} required autoFocus />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Ajustando...' : 'Confirmar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
