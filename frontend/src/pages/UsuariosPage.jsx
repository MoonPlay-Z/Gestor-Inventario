import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const ROLES = [
  { value: 'CAJA', label: 'Caja (POS + Ventas)' },
  { value: 'INVENTARIO', label: 'Inventario (solo consulta)' },
];

const EMPTY_CREATE = { username: '', password: '', nombre: '', rol: 'CAJA' };
const EMPTY_EDIT = { nombre: '', rol: 'CAJA', activo: true, password: '' };

export function UsuariosPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const data = await API.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      showToast('Error al cargar usuarios: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsuarios(); }, []);

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE);
    setFieldErrors({});
    setShowCreateModal(true);
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditForm({ nombre: u.nombre, rol: u.rol, activo: u.activo, password: '' });
    setFieldErrors({});
    setShowEditModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    try {
      await API.crearUsuario(createForm);
      showToast('Usuario creado correctamente', 'success');
      setShowCreateModal(false);
      loadUsuarios();
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    const data = { nombre: editForm.nombre, rol: editForm.rol, activo: editForm.activo };
    if (editForm.password.trim()) data.password = editForm.password.trim();
    try {
      await API.actualizarUsuario(editTarget.id, data);
      showToast('Usuario actualizado', 'success');
      setShowEditModal(false);
      loadUsuarios();
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      showToast(err.message, 'error');
    } finally { setSaving(false); }
  };

  const handleDesactivar = async (u) => {
    if (!window.confirm(`¿Desactivar la cuenta de "${u.nombre}"? Podrá reactivarla desde editar.`)) return;
    try {
      await API.eliminarUsuario(u.id);
      showToast('Usuario desactivado', 'success');
      loadUsuarios();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const rolBadge = (rol) => {
    if (rol === 'EMPRESA') return <span className="badge badge-warning">EMPRESA</span>;
    if (rol === 'CAJA') return <span className="badge badge-info">CAJA</span>;
    return <span className="badge">INVENTARIO</span>;
  };

  return (
    <>
      <Header
        title="Usuarios / Cajas"
        subtitle="Gestión de sub-cuentas y operadores"
        toggleSidebar={toggleSidebar}
        actions={
          <Button onClick={openCreate} variant="primary" size="sm" icon="mdi:account-plus">
            Nuevo Usuario
          </Button>
        }
      />

      <div className="page-body">
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Facturas</th>
                  <th>Cierres</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="empty-state">Cargando usuarios...</td></tr>
                ) : usuarios.length === 0 ? (
                  <tr><td colSpan={7} className="empty-state">No hay sub-usuarios creados aún</td></tr>
                ) : usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'var(--surface3)', padding: '2px 6px', borderRadius: '4px' }}>
                        @{u.username}
                      </code>
                    </td>
                    <td>{rolBadge(u.rol)}</td>
                    <td><span className="badge badge-info">{u._count?.facturas ?? 0}</span></td>
                    <td><span className="badge">{u._count?.cierresCaja ?? 0}</span></td>
                    <td>
                      {u.activo
                        ? <span className="badge badge-success">Activo</span>
                        : <span className="badge badge-danger">Inactivo</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => openEdit(u)} className="btn btn-ghost btn-sm" title="Editar">
                          <Icon icon="mdi:pencil" className="h-4 w-4" />
                        </button>
                        {u.activo && u.id !== currentUser?.id && (
                          <button onClick={() => handleDesactivar(u)} className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)' }} title="Desactivar">
                            <Icon icon="mdi:account-off" className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="modal-overlay open" onClick={() => setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: '440px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Usuario</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateModal(false)}><Icon icon="mdi:close" className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre completo <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input className={`form-control${fieldErrors.nombre ? ' is-invalid' : ''}`} value={createForm.nombre}
                    onChange={e => setCreateForm(f => ({ ...f, nombre: e.target.value }))} required />
                  {fieldErrors.nombre && <div className="form-error">{fieldErrors.nombre}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de usuario <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input className={`form-control${fieldErrors.username ? ' is-invalid' : ''}`} value={createForm.username}
                    onChange={e => setCreateForm(f => ({ ...f, username: e.target.value.toLowerCase() }))}
                    placeholder="ej: caja1" required />
                  {fieldErrors.username && <div className="form-error">{fieldErrors.username}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="password" className={`form-control${fieldErrors.password ? ' is-invalid' : ''}`}
                    value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mín. 4 caracteres" required />
                  {fieldErrors.password && <div className="form-error">{fieldErrors.password}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-control" value={createForm.rol}
                    onChange={e => setCreateForm(f => ({ ...f, rol: e.target.value }))}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && editTarget && (
        <div className="modal-overlay open" onClick={() => setShowEditModal(false)}>
          <div className="modal" style={{ maxWidth: '440px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar — @{editTarget.username}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}><Icon icon="mdi:close" className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input className="form-control" value={editForm.nombre}
                    onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select className="form-control" value={editForm.rol}
                    onChange={e => setEditForm(f => ({ ...f, rol: e.target.value }))}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-control" value={editForm.activo ? 'true' : 'false'}
                    onChange={e => setEditForm(f => ({ ...f, activo: e.target.value === 'true' }))}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nueva contraseña <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>(dejar en blanco para no cambiar)</span></label>
                  <input type="password" className="form-control" value={editForm.password}
                    onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Mín. 4 caracteres" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
