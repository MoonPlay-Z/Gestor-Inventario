import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, FieldError, FormError } from '../components/ui';
import { ValidationRules, getErrorMessage } from '../utils/validation';

// Iconos
import domainIcon from '@iconify/icons-mdi/domain';
import historyIcon from '@iconify/icons-mdi/history';
import tagIcon from '@iconify/icons-mdi/tag-multiple';
import newsIcon from '@iconify/icons-mdi/newspaper';
import keyIcon from '@iconify/icons-mdi/key-variant';
import refreshIcon from '@iconify/icons-mdi/refresh';
import plusIcon from '@iconify/icons-mdi/plus';
import deleteIcon from '@iconify/icons-mdi/delete';
import editIcon from '@iconify/icons-mdi/pencil';
import checkIcon from '@iconify/icons-mdi/check';
import closeIcon from '@iconify/icons-mdi/close';
import accountIcon from '@iconify/icons-mdi/account';
import calendarIcon from '@iconify/icons-mdi/calendar-check';
import blockIcon from '@iconify/icons-mdi/account-cancel';
import unblockIcon from '@iconify/icons-mdi/account-check';
import deleteForeverIcon from '@iconify/icons-mdi/delete-forever';
import chartIcon from '@iconify/icons-mdi/chart-bar';
import searchIcon from '@iconify/icons-mdi/magnify';
import downloadIcon from '@iconify/icons-mdi/download';
import alertIcon from '@iconify/icons-mdi/alert-circle';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import clockIcon from '@iconify/icons-mdi/clock-outline';
import currencyIcon from '@iconify/icons-mdi/currency-usd';

const ESTADO_BADGE = {
  APROBADA: 'badge-success',
  PENDIENTE: 'badge-warning',
  RECHAZADA: 'badge-danger',
};

const PLAN_LABEL = { monthly: 'Mensual', lifetime: 'Vitalicio' };

const SUB_BADGE = {
  trialing: { cls: 'badge-warning', label: 'Trial' },
  active: { cls: 'badge-success', label: 'Activo' },
  expired_trial: { cls: 'badge-danger', label: 'Trial Expirado' },
  canceled: { cls: 'badge-danger', label: 'Cancelado' },
  lifetime: { cls: 'badge-info', label: 'Vitalicio' },
};

const EMPTY_PROMOCION = {
  codigo: '',
  titulo: '',
  descripcion: '',
  descuentoPorc: '',
  diasExtraTrial: 0,
  planDestino: 'monthly',
  usosMaximos: 100,
  fechaFin: '',
  activo: true,
};

const EMPTY_NOTICIA = {
  titulo: '',
  subtitulo: '',
  contenido: '',
  imagenUrl: '',
  categoria: 'Anuncio',
  destacado: false,
  publicado: true,
};

export function AdminPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();

  const [tab, setTab] = useState('empresas');
  const [loading, setLoading] = useState(false);

  // Datos
  const [empresas, setEmpresas] = useState([]);
  const [activaciones, setActivaciones] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalTarget, setModalTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Formularios
  const [activarForm, setActivarForm] = useState({ plan_type: 'monthly', meses: 1 });
  const [promocionForm, setPromocionForm] = useState(EMPTY_PROMOCION);
  const [noticiaForm, setNoticiaForm] = useState(EMPTY_NOTICIA);
  const [resetForm, setResetForm] = useState({ userId: '', newPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Búsqueda y filtros
  const [searchEmpresas, setSearchEmpresas] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos'); // todos, activos, bloqueados

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalEmpresas = empresas.length;
    const empresasActivas = empresas.filter(e => e.activo).length;
    const empresasBloqueadas = totalEmpresas - empresasActivas;
    const enTrial = empresas.filter(e => e.subscriptionStatus === 'trialing').length;
    const suscripcionesActivas = empresas.filter(e => e.subscriptionStatus === 'active').length;
    const suscripcionesVitalicas = empresas.filter(e => e.subscriptionStatus === 'lifetime').length;
    const totalUsuarios = usuarios.length;
    const totalPromociones = promociones.length;
    const promocionesActivas = promociones.filter(p => p.activo).length;
    const totalNoticias = noticias.length;
    const noticiasPublicadas = noticias.filter(n => n.publicado).length;

    return {
      totalEmpresas,
      empresasActivas,
      empresasBloqueadas,
      enTrial,
      suscripcionesActivas,
      suscripcionesVitalicas,
      totalUsuarios,
      totalPromociones,
      promocionesActivas,
      totalNoticias,
      noticiasPublicadas,
    };
  }, [empresas, usuarios, promociones, noticias]);

  // Filtrar empresas por búsqueda y estado
  const empresasFiltradas = useMemo(() => {
    return empresas.filter(e => {
      const matchSearch = !searchEmpresas || 
        e.nombre?.toLowerCase().includes(searchEmpresas.toLowerCase()) ||
        e.username?.toLowerCase().includes(searchEmpresas.toLowerCase());
      const matchEstado = filterEstado === 'todos' || 
        (filterEstado === 'activos' && e.activo) ||
        (filterEstado === 'bloqueados' && !e.activo);
      return matchSearch && matchEstado;
    });
  }, [empresas, searchEmpresas, filterEstado]);

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      return !searchUsuarios || 
        u.nombre?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchUsuarios.toLowerCase());
    });
  }, [usuarios, searchUsuarios]);

  // ─── Carga de datos ─────────────────────────────────────────────────────────

  const loadEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getEmpresas();
      setEmpresas(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando empresas'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadActivaciones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getActivaciones();
      setActivaciones(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando activaciones'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadPromociones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getPromociones();
      setPromociones(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando promociones'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadNoticias = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getNoticias();
      setNoticias(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando noticias'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getUsuarios({ limit: 100 });
      setUsuarios(data.data || data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando usuarios'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (tab === 'empresas') loadEmpresas();
    else if (tab === 'historial') loadActivaciones();
    else if (tab === 'promociones') loadPromociones();
    else if (tab === 'noticias') loadNoticias();
    else if (tab === 'usuarios') loadUsuarios();
  }, [tab, loadEmpresas, loadActivaciones, loadPromociones, loadNoticias, loadUsuarios]);

  // ─── Acciones de Empresas ───────────────────────────────────────────────────

  const openActivarModal = (u) => {
    setModalType('activar');
    setModalTarget(u);
    setActivarForm({ plan_type: 'monthly', meses: 1 });
    setShowModal(true);
  };

  const handleActivar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { plan_type: activarForm.plan_type };
      if (activarForm.plan_type === 'monthly') payload.meses = activarForm.meses;
      
      await API.activarManual(modalTarget.id, payload);
      showToast(`${modalTarget.nombre} activado como plan ${PLAN_LABEL[activarForm.plan_type]}`, 'success');
      setShowModal(false);
      loadEmpresas();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al activar'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async (u) => {
    const nuevoEstado = !u.activo;
    const accion = nuevoEstado ? 'Desbloquear' : 'Bloquear/Suspender';
    if (!window.confirm(`¿Estás seguro de ${accion} a la empresa ${u.nombre}?`)) return;

    try {
      await API.cambiarEstadoEmpresa(u.id, nuevoEstado);
      showToast(`Empresa ${nuevoEstado ? 'desbloqueada' : 'bloqueada'} exitosamente`, 'success');
      loadEmpresas();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al cambiar estado'), 'error');
    }
  };

  const handleEliminarEmpresa = async (u) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const promptAns = window.prompt(
      `CUIDADO: Esto eliminará permanentemente la empresa ${u.nombre} y TODOS sus datos.\n\nIngresa el código ${code} para confirmar:`
    );
    
    if (promptAns !== code) {
      if (promptAns !== null) showToast('Código incorrecto. Eliminación cancelada.', 'error');
      return;
    }

    try {
      await API.eliminarEmpresa(u.id);
      showToast(`Empresa ${u.nombre} eliminada por completo.`, 'success');
      loadEmpresas();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al eliminar'), 'error');
    }
  };

  // ─── Acciones de Promociones ────────────────────────────────────────────────

  const openPromocionModal = (p = null) => {
    setModalType('promocion');
    setModalTarget(p);
    setPromocionForm(p ? { ...p } : EMPTY_PROMOCION);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSavePromocion = async (e) => {
    e.preventDefault();
    
    const errors = {};
    const codigoError = ValidationRules.required(promocionForm.codigo, 'El código');
    if (codigoError) errors.codigo = codigoError;
    
    const tituloError = ValidationRules.required(promocionForm.titulo, 'El título');
    if (tituloError) errors.titulo = tituloError;
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      if (modalTarget) {
        await API.actualizarPromocion(modalTarget.id, promocionForm);
        showToast('Promoción actualizada exitosamente', 'success');
      } else {
        await API.crearPromocion(promocionForm);
        showToast('Promoción creada exitosamente', 'success');
      }
      setShowModal(false);
      loadPromociones();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al guardar promoción'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarPromocion = async (p) => {
    if (!window.confirm(`¿Eliminar la promoción "${p.titulo}"?`)) return;
    
    try {
      await API.eliminarPromocion(p.id);
      showToast('Promoción eliminada', 'success');
      loadPromociones();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al eliminar'), 'error');
    }
  };

  // ─── Acciones de Noticias ───────────────────────────────────────────────────

  const openNoticiaModal = (n = null) => {
    setModalType('noticia');
    setModalTarget(n);
    setNoticiaForm(n ? { ...n } : EMPTY_NOTICIA);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSaveNoticia = async (e) => {
    e.preventDefault();
    
    const errors = {};
    const tituloError = ValidationRules.required(noticiaForm.titulo, 'El título');
    if (tituloError) errors.titulo = tituloError;
    
    const contenidoError = ValidationRules.required(noticiaForm.contenido, 'El contenido');
    if (contenidoError) errors.contenido = contenidoError;
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      if (modalTarget) {
        await API.actualizarNoticia(modalTarget.id, noticiaForm);
        showToast('Noticia actualizada exitosamente', 'success');
      } else {
        await API.crearNoticia(noticiaForm);
        showToast('Noticia creada exitosamente', 'success');
      }
      setShowModal(false);
      loadNoticias();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al guardar noticia'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarNoticia = async (n) => {
    if (!window.confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return;
    
    try {
      await API.eliminarNoticia(n.id);
      showToast('Noticia eliminada', 'success');
      loadNoticias();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al eliminar'), 'error');
    }
  };

  // ─── Reset de Contraseña ────────────────────────────────────────────────────

  const openResetModal = (u) => {
    setModalType('reset');
    setModalTarget(u);
    setResetForm({ userId: u.id, newPassword: '' });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const errors = {};
    const passwordError = ValidationRules.minLength(resetForm.newPassword, 4, 'La contraseña');
    if (passwordError) errors.newPassword = passwordError;
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await API.resetPassword(resetForm.userId, resetForm.newPassword);
      showToast(`Contraseña de ${modalTarget.username} actualizada exitosamente`, 'success');
      setShowModal(false);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al resetear contraseña'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Exportar a CSV ─────────────────────────────────────────────────────────

  const exportarCSV = (tipo) => {
    let csvContent = '';
    let filename = '';

    if (tipo === 'empresas') {
      const headers = ['Nombre', 'Usuario', 'Estado', 'Suscripción', 'Plan', 'Vence'];
      const rows = empresasFiltradas.map(e => [
        e.nombre,
        e.username,
        e.activo ? 'Activo' : 'Bloqueado',
        e.subscriptionStatus,
        e.planType || '—',
        e.currentPeriodEnd ? Utils.formatDate(e.currentPeriodEnd) : '—',
      ]);
      csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      filename = `empresas_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (tipo === 'usuarios') {
      const headers = ['Usuario', 'Nombre', 'Rol', 'Estado'];
      const rows = usuariosFiltrados.map(u => [
        u.username,
        u.nombre || '—',
        u.rol,
        u.activo ? 'Activo' : 'Inactivo',
      ]);
      csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      filename = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (tipo === 'activaciones') {
      const headers = ['Usuario', 'Plan', 'Método Pago', 'Referencia', 'Estado', 'Fecha'];
      const rows = activaciones.map(a => [
        a.usuario?.nombre || '—',
        a.plan,
        a.metodoPago?.replace('_', ' '),
        a.referencia || '—',
        a.estado,
        Utils.formatDate(a.createdAt),
      ]);
      csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      filename = `activaciones_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Archivo CSV exportado correctamente', 'success');
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const tabStyle = (t) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    border: tab === t ? 'none' : '2px solid var(--border)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 700,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: tab === t ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'var(--surface)',
    color: tab === t ? '#fff' : 'var(--text-secondary)',
    boxShadow: tab === t ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
  });

  const inputStyle = (hasError) => ({
    border: hasError ? '2px solid #ef4444' : '2px solid var(--border)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    outline: 'none',
    backgroundColor: 'var(--surface)',
    width: '100%',
    transition: 'all 0.2s',
  });

  const statCardStyle = {
    background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
  };

  const statIconStyle = (color) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    color: '#fff',
    flexShrink: 0,
    boxShadow: `0 4px 12px ${color}40`,
  });

  const actionBtnStyle = (type) => {
    const colors = {
      primary: { bg: '#3b82f6', hover: '#2563eb' },
      danger: { bg: '#ef4444', hover: '#dc2626' },
      success: { bg: '#10b981', hover: '#059669' },
      warning: { bg: '#f59e0b', hover: '#d97706' },
    };
    const c = colors[type] || colors.primary;
    return {
      padding: '0.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: c.bg,
      color: '#fff',
      transition: 'all 0.2s',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    };
  };

  return (
    <>
      <Header
        title="Administración del Sistema"
        subtitle="Panel exclusivo para Super Administrador"
        toggleSidebar={toggleSidebar}
        actions={
          <Button
            onClick={() => {
              if (tab === 'empresas') loadEmpresas();
              else if (tab === 'historial') loadActivaciones();
              else if (tab === 'promociones') loadPromociones();
              else if (tab === 'noticias') loadNoticias();
              else if (tab === 'usuarios') loadUsuarios();
            }}
            variant="secondary"
            size="sm"
            icon="mdi:refresh"
          >
            Recargar
          </Button>
        }
      />

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button style={tabStyle('dashboard')} onClick={() => setTab('dashboard')}>
            <Icon icon={chartIcon} className="h-4 w-4" />
            Dashboard
          </button>
          <button style={tabStyle('empresas')} onClick={() => setTab('empresas')}>
            <Icon icon={domainIcon} className="h-4 w-4" />
            Empresas
          </button>
          <button style={tabStyle('historial')} onClick={() => setTab('historial')}>
            <Icon icon={historyIcon} className="h-4 w-4" />
            Historial
          </button>
          <button style={tabStyle('promociones')} onClick={() => setTab('promociones')}>
            <Icon icon={tagIcon} className="h-4 w-4" />
            Promociones
          </button>
          <button style={tabStyle('noticias')} onClick={() => setTab('noticias')}>
            <Icon icon={newsIcon} className="h-4 w-4" />
            Noticias
          </button>
          <button style={tabStyle('usuarios')} onClick={() => setTab('usuarios')}>
            <Icon icon={keyIcon} className="h-4 w-4" />
            Usuarios
          </button>
        </div>

        {/* ─── TAB: DASHBOARD ─── */}
        {tab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Empresas */}
            <div style={statCardStyle}>
              <div style={statIconStyle('#3b82f6')}>
                <Icon icon={domainIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalEmpresas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Empresas Totales</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#10b981')}>
                <Icon icon={checkCircleIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.empresasActivas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Empresas Activas</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#ef4444')}>
                <Icon icon={blockIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.empresasBloqueadas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bloqueadas</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#f59e0b')}>
                <Icon icon={clockIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.enTrial}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>En Trial</div>
              </div>
            </div>

            {/* Suscripciones */}
            <div style={statCardStyle}>
              <div style={statIconStyle('#10b981')}>
                <Icon icon={checkCircleIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.suscripcionesActivas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Suscripciones Activas</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#6366f1')}>
                <Icon icon={currencyIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.suscripcionesVitalicas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vitalicias</div>
              </div>
            </div>

            {/* Usuarios y Contenido */}
            <div style={statCardStyle}>
              <div style={statIconStyle('#8b5cf6')}>
                <Icon icon={accountIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalUsuarios}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Usuarios</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#ec4899')}>
                <Icon icon={tagIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.promocionesActivas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Promociones Activas</div>
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statIconStyle('#14b8a6')}>
                <Icon icon={newsIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.noticiasPublicadas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Noticias Publicadas</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: EMPRESAS ─── */}
        {tab === 'empresas' && (
          <div className="card">
            {/* Búsqueda y filtros */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                <Icon icon={searchIcon} className="h-4 w-4" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o usuario..."
                  value={searchEmpresas}
                  onChange={e => setSearchEmpresas(e.target.value)}
                  style={{ ...inputStyle(false), paddingLeft: '32px' }}
                />
              </div>
              <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ ...inputStyle(false), width: 'auto' }}>
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="bloqueados">Bloqueados</option>
              </select>
              <Button onClick={() => exportarCSV('empresas')} variant="secondary" size="sm" icon="mdi:download">
                Exportar CSV
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Acceso</th>
                    <th>Suscripción</th>
                    <th>Plan</th>
                    <th>Vence</th>
                    <th style={{ minWidth: '200px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-state">Cargando empresas...</td></tr>
                  ) : empresasFiltradas.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No hay empresas registradas</td></tr>
                  ) : empresasFiltradas.map(u => {
                    const sub = SUB_BADGE[u.subscriptionStatus] || { cls: '', label: u.subscriptionStatus };
                    return (
                      <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.6 }}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>
                            {u.activo ? 'ACTIVO' : 'BLOQUEADO'}
                          </span>
                        </td>
                        <td><span className={`badge ${sub.cls}`}>{sub.label}</span></td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {u.planType ? PLAN_LABEL[u.planType] || u.planType : '—'}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {u.currentPeriodEnd ? Utils.formatDate(u.currentPeriodEnd) : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button onClick={() => openActivarModal(u)} style={actionBtnStyle('primary')} title="Activar/Renovar">
                              <Icon icon={calendarIcon} className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleCambiarEstado(u)} style={actionBtnStyle(u.activo ? 'warning' : 'success')} title={u.activo ? 'Bloquear' : 'Desbloquear'}>
                              <Icon icon={u.activo ? blockIcon : unblockIcon} className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleEliminarEmpresa(u)} style={actionBtnStyle('danger')} title="Eliminar">
                              <Icon icon={deleteForeverIcon} className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: HISTORIAL ─── */}
        {tab === 'historial' && (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Plan</th>
                    <th>Método Pago</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-state">Cargando historial...</td></tr>
                  ) : activaciones.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No hay activaciones registradas</td></tr>
                  ) : activaciones.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.usuario?.nombre || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{a.usuario?.username}</div>
                      </td>
                      <td>
                        <span className={`badge ${a.plan === 'lifetime' ? 'badge-info' : 'badge-warning'}`}>
                          {PLAN_LABEL[a.plan] || a.plan}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {a.metodoPago?.replace('_', ' ')}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.referencia || '—'}
                      </td>
                      <td>
                        <span className={`badge ${ESTADO_BADGE[a.estado] || ''}`}>{a.estado}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {Utils.formatDate(a.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: PROMOCIONES ─── */}
        {tab === 'promociones' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Gestión de Promociones</h3>
              <Button onClick={() => openPromocionModal()} variant="primary" size="sm" icon="mdi:plus">
                Nueva Promoción
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Descuento</th>
                    <th>Días Extra</th>
                    <th>Usos</th>
                    <th>Estado</th>
                    <th style={{ minWidth: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="empty-state">Cargando promociones...</td></tr>
                  ) : promociones.length === 0 ? (
                    <tr><td colSpan={7} className="empty-state">No hay promociones creadas</td></tr>
                  ) : promociones.map(p => (
                    <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.6 }}>
                      <td>
                        <code style={{ background: 'var(--surface3)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {p.codigo}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.titulo}</td>
                      <td>{p.descuentoPorc ? `${p.descuentoPorc}%` : '—'}</td>
                      <td>{p.diasExtraTrial || 0}</td>
                      <td>{p.usosMaximos || '∞'}</td>
                      <td>
                        <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>
                          {p.activo ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openPromocionModal(p)} style={actionBtnStyle('primary')} title="Editar">
                            <Icon icon={editIcon} className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleEliminarPromocion(p)} style={actionBtnStyle('danger')} title="Eliminar">
                            <Icon icon={deleteIcon} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: NOTICIAS ─── */}
        {tab === 'noticias' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Gestión de Noticias</h3>
              <Button onClick={() => openNoticiaModal()} variant="primary" size="sm" icon="mdi:plus">
                Nueva Noticia
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Destacado</th>
                    <th>Publicado</th>
                    <th>Fecha</th>
                    <th style={{ minWidth: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-state">Cargando noticias...</td></tr>
                  ) : noticias.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">No hay noticias creadas</td></tr>
                  ) : noticias.map(n => (
                    <tr key={n.id} style={{ opacity: n.publicado ? 1 : 0.6 }}>
                      <td style={{ fontWeight: 600 }}>{n.titulo}</td>
                      <td>
                        <span className="badge badge-info">{n.categoria}</span>
                      </td>
                      <td>
                        {n.destacado && <Icon icon={checkIcon} className="h-4 w-4" style={{ color: 'var(--success)' }} />}
                      </td>
                      <td>
                        <span className={`badge ${n.publicado ? 'badge-success' : 'badge-warning'}`}>
                          {n.publicado ? 'SÍ' : 'NO'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {Utils.formatDate(n.createdAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openNoticiaModal(n)} style={actionBtnStyle('primary')} title="Editar">
                            <Icon icon={editIcon} className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleEliminarNoticia(n)} style={actionBtnStyle('danger')} title="Eliminar">
                            <Icon icon={deleteIcon} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: USUARIOS ─── */}
        {tab === 'usuarios' && (
          <div className="card">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                <Icon icon={searchIcon} className="h-4 w-4" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o usuario..."
                  value={searchUsuarios}
                  onChange={e => setSearchUsuarios(e.target.value)}
                  style={{ ...inputStyle(false), paddingLeft: '32px' }}
                />
              </div>
              <Button onClick={() => exportarCSV('usuarios')} variant="secondary" size="sm" icon="mdi:download">
                Exportar CSV
              </Button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Reset de Contraseñas</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Selecciona un usuario para resetear su contraseña. Esto invalidará todas sus sesiones activas.
              </p>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th style={{ minWidth: '100px' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="empty-state">Cargando usuarios...</td></tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr><td colSpan={5} className="empty-state">No hay usuarios registrados</td></tr>
                  ) : usuariosFiltrados.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon icon={accountIcon} className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontWeight: 600 }}>@{u.username}</span>
                        </div>
                      </td>
                      <td>{u.nombre || '—'}</td>
                      <td>
                        <span className="badge badge-info">{u.rol}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>
                          {u.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openResetModal(u)} className="btn btn-sm" style={{ background: 'var(--surface3)' }} title="Resetear contraseña">
                          <Icon icon={keyIcon} className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALES ─── */}
      {showModal && (
        <div className="modal-overlay open" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '500px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalType === 'activar' && 'Activar / Renovar Plan'}
                {modalType === 'promocion' && (modalTarget ? 'Editar Promoción' : 'Nueva Promoción')}
                {modalType === 'noticia' && (modalTarget ? 'Editar Noticia' : 'Nueva Noticia')}
                {modalType === 'reset' && 'Resetear Contraseña'}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <Icon icon={closeIcon} className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Activar */}
            {modalType === 'activar' && modalTarget && (
              <form onSubmit={handleActivar}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--surface3)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700 }}>{modalTarget.nombre}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>@{modalTarget.username}</div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo de Plan</label>
                    <select className="form-control" value={activarForm.plan_type} onChange={e => setActivarForm(f => ({ ...f, plan_type: e.target.value }))}>
                      <option value="monthly">Mensual</option>
                      <option value="lifetime">Vitalicio</option>
                    </select>
                  </div>

                  {activarForm.plan_type === 'monthly' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Meses</label>
                      <input type="number" className="form-control" value={activarForm.meses} onChange={e => setActivarForm(f => ({ ...f, meses: parseInt(e.target.value) || 1 }))} min="1" max="12" />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Activando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Promoción */}
            {modalType === 'promocion' && (
              <form onSubmit={handleSavePromocion}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Código *</label>
                    <input style={inputStyle(fieldErrors.codigo)} value={promocionForm.codigo} onChange={e => setPromocionForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej: VERANO2026" />
                    <FieldError message={fieldErrors.codigo} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Título *</label>
                    <input style={inputStyle(fieldErrors.titulo)} value={promocionForm.titulo} onChange={e => setPromocionForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Promoción de Verano" />
                    <FieldError message={fieldErrors.titulo} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Descripción</label>
                    <textarea style={inputStyle(false)} rows={2} value={promocionForm.descripcion} onChange={e => setPromocionForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción de la promoción..." />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Descuento (%)</label>
                      <input type="number" style={inputStyle(false)} value={promocionForm.descuentoPorc} onChange={e => setPromocionForm(f => ({ ...f, descuentoPorc: e.target.value }))} placeholder="Ej: 10" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Días Extra Trial</label>
                      <input type="number" style={inputStyle(false)} value={promocionForm.diasExtraTrial} onChange={e => setPromocionForm(f => ({ ...f, diasExtraTrial: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Usos Máximos</label>
                      <input type="number" style={inputStyle(false)} value={promocionForm.usosMaximos} onChange={e => setPromocionForm(f => ({ ...f, usosMaximos: parseInt(e.target.value) || 100 }))} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Fecha Fin</label>
                      <input type="date" style={inputStyle(false)} value={promocionForm.fechaFin} onChange={e => setPromocionForm(f => ({ ...f, fechaFin: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : modalTarget ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Noticia */}
            {modalType === 'noticia' && (
              <form onSubmit={handleSaveNoticia}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Título *</label>
                    <input style={inputStyle(fieldErrors.titulo)} value={noticiaForm.titulo} onChange={e => setNoticiaForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título de la noticia" />
                    <FieldError message={fieldErrors.titulo} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Subtítulo</label>
                    <input style={inputStyle(false)} value={noticiaForm.subtitulo} onChange={e => setNoticiaForm(f => ({ ...f, subtitulo: e.target.value }))} placeholder="Subtítulo (opcional)" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contenido *</label>
                    <textarea style={inputStyle(fieldErrors.contenido)} rows={4} value={noticiaForm.contenido} onChange={e => setNoticiaForm(f => ({ ...f, contenido: e.target.value }))} placeholder="Contenido de la noticia..." />
                    <FieldError message={fieldErrors.contenido} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>URL de Imagen</label>
                    <input style={inputStyle(false)} value={noticiaForm.imagenUrl} onChange={e => setNoticiaForm(f => ({ ...f, imagenUrl: e.target.value }))} placeholder="https://ejemplo.com/imagen.jpg" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Categoría</label>
                      <input style={inputStyle(false)} value={noticiaForm.categoria} onChange={e => setNoticiaForm(f => ({ ...f, categoria: e.target.value }))} placeholder="Ej: Anuncio" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={noticiaForm.destacado} onChange={e => setNoticiaForm(f => ({ ...f, destacado: e.target.checked }))} />
                        Destacado
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={noticiaForm.publicado} onChange={e => setNoticiaForm(f => ({ ...f, publicado: e.target.checked }))} />
                        Publicado
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : modalTarget ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Reset Password */}
            {modalType === 'reset' && modalTarget && (
              <form onSubmit={handleResetPassword}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--surface3)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700 }}>@{modalTarget.username}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{modalTarget.nombre}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nueva Contraseña *</label>
                    <input type="password" style={inputStyle(fieldErrors.newPassword)} value={resetForm.newPassword} onChange={e => setResetForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Mínimo 4 caracteres" />
                    <FieldError message={fieldErrors.newPassword} />
                  </div>
                  <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.8rem', color: '#ef4444' }}>
                    <Icon icon={alertCircleIcon} className="h-4 w-4" style={{ display: 'inline', marginRight: '4px' }} />
                    Esto invalidará todas las sesiones activas del usuario.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Reseteando...' : 'Resetear'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
