import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';

const EMPTY_FORM = { razonSocial: '', rifCedula: '', direccion: '', telefono: '', correo: '' };

export function ClientesPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [clientes, setClientes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const debounceRef = useRef(null);
  const LIMIT = 25;

  const loadClientes = async (q = search, p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (q) params.q = q;
      const data = await API.getClientes(params);
      setClientes(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      showToast('Error al cargar clientes: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClientes(search, page); }, [page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadClientes(val, 1), 350);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditTarget(c);
    setForm({
      razonSocial: c.razonSocial,
      rifCedula: c.rifCedula,
      direccion: c.direccion || '',
      telefono: c.telefono || '',
      correo: c.correo || '',
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      if (editTarget) {
        await API.actualizarCliente(editTarget.id, form);
        showToast('Cliente actualizado', 'success');
      } else {
        await API.crearCliente(form);
        showToast('Cliente creado', 'success');
      }
      setShowModal(false);
      loadClientes(search, page);
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (c) => {
    if (!window.confirm(`¿Eliminar el cliente "${c.razonSocial}"? Esta acción no se puede deshacer.`)) return;
    try {
      await API.eliminarCliente(c.id);
      showToast('Cliente eliminado', 'success');
      loadClientes(search, page);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <Header
        title="Clientes"
        subtitle={`${total} cliente${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
        toggleSidebar={toggleSidebar}
        actions={
          <Button onClick={openCreate} variant="primary" size="sm" icon="mdi:account-plus">
            Nuevo Cliente
          </Button>
        }
      />

      <div className="page-body">
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" className="form-control" placeholder="Buscar por nombre, ID fiscal, correo..."
              value={search} onChange={handleSearchChange} style={{ flex: 1, minWidth: '220px' }} />
            <button onClick={() => loadClientes(search, page)} className="btn btn-secondary btn-sm inline-flex items-center gap-1">
              <Icon icon="mdi:refresh" className="h-4 w-4" /> Recargar
            </button>
          </div>
        </div>

        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Razón Social</th>
                  <th>Documento / ID Fiscal</th>
                  <th>Contacto</th>
                  <th>Dirección</th>
                  <th>Facturas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="empty-state">Cargando clientes...</td></tr>
                ) : clientes.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No se encontraron clientes</td></tr>
                ) : clientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.razonSocial}</td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'var(--surface3)', padding: '2px 6px', borderRadius: '4px' }}>
                        {c.rifCedula}
                      </code>
                    </td>
                    <td>
                      {c.telefono && <div style={{ fontSize: '0.85rem' }}><Icon icon="mdi:phone" style={{ marginRight: '4px', opacity: 0.6 }} />{c.telefono}</div>}
                      {c.correo && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.correo}</div>}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.direccion || '—'}
                    </td>
                    <td>
                      <span className="badge badge-info">{c._count?.facturas ?? 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openEdit(c)} className="btn btn-ghost btn-sm" title="Editar">
                          <Icon icon="mdi:pencil" className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleEliminar(c)} className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }} title="Eliminar"
                          disabled={(c._count?.facturas ?? 0) > 0}>
                          <Icon icon="mdi:delete" className="h-4 w-4" />
                        </button>
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

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '500px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><Icon icon="mdi:close" className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Razón Social <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input className={`form-control${fieldErrors.razonSocial ? ' is-invalid' : ''}`} value={form.razonSocial}
                    onChange={e => setForm(f => ({ ...f, razonSocial: e.target.value }))} required />
                  {fieldErrors.razonSocial && <div className="form-error">{fieldErrors.razonSocial}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Documento / ID Fiscal <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input className={`form-control${fieldErrors.rifCedula ? ' is-invalid' : ''}`} value={form.rifCedula}
                    onChange={e => setForm(f => ({ ...f, rifCedula: e.target.value }))}
                    placeholder="Ej: J-123456789 / NIT 900123 / RUT 76.123.456-7" required />
                  {fieldErrors.rifCedula && <div className="form-error">{fieldErrors.rifCedula}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="+58 412 1234567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" value={form.correo}
                    onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <textarea className="form-control" rows={2} value={form.direccion}
                    onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editTarget ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
