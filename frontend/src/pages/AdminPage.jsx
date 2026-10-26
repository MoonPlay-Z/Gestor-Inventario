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
import archiveDownIcon from '@iconify/icons-mdi/archive-arrow-down';
import archiveUpIcon from '@iconify/icons-mdi/archive-arrow-up';
import chartIcon from '@iconify/icons-mdi/chart-bar';
import searchIcon from '@iconify/icons-mdi/magnify';
import downloadIcon from '@iconify/icons-mdi/download';
import alertIcon from '@iconify/icons-mdi/alert-circle';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import clockIcon from '@iconify/icons-mdi/clock-outline';
import currencyIcon from '@iconify/icons-mdi/currency-usd';
import videoIcon from '@iconify/icons-mdi/video-outline';
import { parseVideoUrl, validarUrlMedia } from '../utils/media';

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
  videoUrl: '',
  categoria: 'Anuncio',
  destacado: false,
  publicado: true,
};

function formatearDetalle(log) {
  const data = log?.datosNuevos ?? log?.datosAnteriores;
  if (!data) return '—';
  try {
    const obj = typeof data === 'string' ? JSON.parse(data) : data;
    const texto = JSON.stringify(obj);
    return texto.length > 220 ? `${texto.slice(0, 220)}…` : texto;
  } catch {
    return String(data);
  }
}

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
  const [auditoria, setAuditoria] = useState([]);
  const [salud, setSalud] = useState(null);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalTarget, setModalTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Formularios
  const [activarForm, setActivarForm] = useState({ plan_type: 'monthly', meses: 1 });
  const [aprobarForm, setAprobarForm] = useState({ plan_type: 'monthly', meses: 1, notas: '' });
  const [rechazarForm, setRechazarForm] = useState({ notas: '' });
  const [promocionForm, setPromocionForm] = useState(EMPTY_PROMOCION);
  const [noticiaForm, setNoticiaForm] = useState(EMPTY_NOTICIA);
  const [resetForm, setResetForm] = useState({ userId: '', newPassword: '' });
  const [deleteUserForm, setDeleteUserForm] = useState({ username: '', confirmation: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Búsqueda y filtros
  const [searchEmpresas, setSearchEmpresas] = useState('');
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos'); // todos, activos, bloqueados, archivadas
  const [filterPago, setFilterPago] = useState('PENDIENTE'); // todos, PENDIENTE, APROBADA, RECHAZADA

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalEmpresas = empresas.length;
    const empresasArchivadas = empresas.filter(e => e.archivada).length;
    const empresasActivas = empresas.filter(e => e.activo && !e.archivada).length;
    const empresasBloqueadas = totalEmpresas - empresasActivas - empresasArchivadas;
    const enTrial = empresas.filter(e => e.subscriptionStatus === 'trialing').length;
    const suscripcionesActivas = empresas.filter(e => e.subscriptionStatus === 'active').length;
    const suscripcionesVitalicas = empresas.filter(e => e.subscriptionStatus === 'lifetime').length;
    const totalUsuarios = usuarios.length;
    const totalPromociones = promociones.length;
    const promocionesActivas = promociones.filter(p => p.activo).length;
    const totalNoticias = noticias.length;
    const noticiasPublicadas = noticias.filter(n => n.publicado).length;
    const pagosPendientes = activaciones.filter(a => a.estado === 'PENDIENTE').length;

    return {
      totalEmpresas,
      empresasActivas,
      empresasBloqueadas,
      empresasArchivadas,
      enTrial,
      suscripcionesActivas,
      suscripcionesVitalicas,
      totalUsuarios,
      totalPromociones,
      promocionesActivas,
      totalNoticias,
      noticiasPublicadas,
      pagosPendientes,
    };
  }, [empresas, usuarios, promociones, noticias, activaciones]);

  // Filtrar empresas por búsqueda y estado
  const empresasFiltradas = useMemo(() => {
    return empresas.filter(e => {
      const matchSearch = !searchEmpresas || 
        e.nombre?.toLowerCase().includes(searchEmpresas.toLowerCase()) ||
        e.username?.toLowerCase().includes(searchEmpresas.toLowerCase());
      const matchEstado = filterEstado === 'todos' ||
        (filterEstado === 'activos' && e.activo && !e.archivada) ||
        (filterEstado === 'bloqueados' && !e.activo && !e.archivada) ||
        (filterEstado === 'archivadas' && e.archivada);
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

  // Filtrar solicitudes de pago por estado
  const activacionesFiltradas = useMemo(() => {
    if (filterPago === 'todos') return activaciones;
    return activaciones.filter(a => a.estado === filterPago);
  }, [activaciones, filterPago]);

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
      const data = await API.getAdminUsuarios();
      setUsuarios(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando usuarios'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadAuditoria = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getAuditoria();
      setAuditoria(data);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando la auditoría'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadSalud = useCallback(async () => {
    try {
      const data = await API.getSaludSuscripciones();
      setSalud(data);
    } catch {
      // La salud es informativa: no debe interrumpir el dashboard.
      setSalud(null);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [empresasData, usuariosData, promocionesData, noticiasData, activacionesData] = await Promise.all([
        API.getEmpresas(),
        API.getAdminUsuarios(),
        API.getPromociones(),
        API.getNoticias(),
        API.getActivaciones(),
      ]);
      setEmpresas(empresasData);
      setUsuarios(usuariosData);
      setPromociones(promocionesData);
      setNoticias(noticiasData);
      setActivaciones(activacionesData);
      loadSalud();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error cargando las estadísticas del panel'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, loadSalud]);

  useEffect(() => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'empresas') loadEmpresas();
    else if (tab === 'historial') loadActivaciones();
    else if (tab === 'auditoria') loadAuditoria();
    else if (tab === 'promociones') loadPromociones();
    else if (tab === 'noticias') loadNoticias();
    else if (tab === 'usuarios') loadUsuarios();
  }, [tab, loadDashboard, loadEmpresas, loadActivaciones, loadAuditoria, loadPromociones, loadNoticias, loadUsuarios]);

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

  // ─── Bandeja de pagos ───────────────────────────────────────────────────────

  const openAprobarModal = (solicitud) => {
    setModalType('aprobar');
    setModalTarget(solicitud);
    setAprobarForm({
      plan_type: solicitud.plan === 'lifetime' ? 'lifetime' : 'monthly',
      meses: 1,
      notas: '',
    });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleAprobar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...aprobarForm };
      if (payload.plan_type === 'lifetime') delete payload.meses;
      await API.aprobarSolicitud(modalTarget.id, payload);
      const nombre = modalTarget.usuario?.nombre || modalTarget.usuario?.username || 'la empresa';
      showToast(`Pago de ${nombre} aprobado y cuenta activada.`, 'success');
      setShowModal(false);
      await Promise.all([loadActivaciones(), loadEmpresas()]);
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al aprobar el pago'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const openRechazarModal = (solicitud) => {
    setModalType('rechazar');
    setModalTarget(solicitud);
    setRechazarForm({ notas: '' });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleRechazar = async (e) => {
    e.preventDefault();
    const notas = rechazarForm.notas.trim();
    if (notas.length < 3) {
      setFieldErrors({ notas: 'Indica el motivo del rechazo (mínimo 3 caracteres).' });
      return;
    }

    setSaving(true);
    try {
      await API.rechazarSolicitud(modalTarget.id, { notas });
      showToast('Solicitud rechazada. La empresa no fue activada.', 'success');
      setShowModal(false);
      loadActivaciones();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al rechazar el pago'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async (u) => {
    if (u.archivada) {
      showToast('La empresa está archivada. Usa Restaurar para devolverle el acceso.', 'error');
      return;
    }
    const nuevoEstado = !u.activo;
    const accion = nuevoEstado ? 'Desbloquear' : 'Bloquear/Suspender';
    const aviso = nuevoEstado
      ? 'Las subcuentas podrán volver a iniciar sesión.'
      : 'También se cerrarán las sesiones de sus cajeros y subcuentas.';
    if (!window.confirm(`¿Estás seguro de ${accion} la empresa ${u.nombre}?\n\n${aviso}`)) return;

    try {
      await API.cambiarEstadoEmpresa(u.id, nuevoEstado);
      showToast(`Empresa ${nuevoEstado ? 'desbloqueada' : 'bloqueada'} exitosamente`, 'success');
      loadEmpresas();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al cambiar estado'), 'error');
    }
  };

  const handleEliminarEmpresa = async (u) => {
    if (u.archivada) {
      showToast('La empresa ya está archivada. Puedes restaurarla desde el botón de archivo.', 'error');
      return;
    }
    const expectedName = u.nombre || u.username;
    const nameConfirmation = window.prompt(
      `La empresa ${expectedName} se ARCHIVARÁ por 30 días y se eliminará definitivamente al vencer ese plazo.\n\nEscribe el nombre exacto de la empresa para continuar:`
    );
    if (nameConfirmation === null) return;
    if (nameConfirmation !== expectedName) {
      showToast('El nombre no coincide. Archivado cancelado.', 'error');
      return;
    }

    const deleteConfirmation = window.prompt('Escribe "archivar" para confirmar:');
    if (deleteConfirmation === null) return;
    if (deleteConfirmation !== 'archivar') {
      showToast('La confirmación no coincide. Archivado cancelado.', 'error');
      return;
    }

    try {
      const respuesta = await API.eliminarEmpresa(u.id, nameConfirmation, deleteConfirmation);
      showToast(respuesta?.message || `Empresa ${u.nombre} archivada por 30 días.`, 'success');
      loadEmpresas();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al archivar'), 'error');
    }
  };

  const handleRestaurarEmpresa = async (u) => {
    if (!window.confirm(`¿Restaurar la empresa ${u.nombre}? Se cancelará el borrado programado y recuperará el acceso.`)) return;
    try {
      const respuesta = await API.restaurarEmpresa(u.id);
      showToast(respuesta?.message || `Empresa ${u.nombre} restaurada.`, 'success');
      loadEmpresas();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al restaurar'), 'error');
    }
  };

  // ─── Acciones de Promociones ────────────────────────────────────────────────

  const openPromocionModal = (p = null) => {
    setModalType('promocion');
    setModalTarget(p);
    setPromocionForm(p ? {
      ...p,
      fechaFin: p.fechaFin ? new Date(p.fechaFin).toISOString().slice(0, 10) : '',
    } : EMPTY_PROMOCION);
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
    setNoticiaForm(n ? {
      ...EMPTY_NOTICIA,
      ...n,
      subtitulo: n.subtitulo || '',
      imagenUrl: n.imagenUrl || '',
      videoUrl: n.videoUrl || '',
      categoria: n.categoria || 'Anuncio',
    } : { ...EMPTY_NOTICIA });
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

    const imagenError = validarUrlMedia(noticiaForm.imagenUrl, 'La URL de la imagen');
    if (imagenError) errors.imagenUrl = imagenError;

    const videoError = validarUrlMedia(noticiaForm.videoUrl, 'La URL del video');
    if (videoError) errors.videoUrl = videoError;

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

  const openDeleteUserModal = (user) => {
    setModalType('deleteUser');
    setModalTarget(user);
    setDeleteUserForm({ username: '', confirmation: '' });
    setFieldErrors({});
    setShowModal(true);
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();
    if (deleteUserForm.username !== modalTarget.username || deleteUserForm.confirmation !== 'archivar') {
      setFieldErrors({ confirmation: 'Escribe el nombre de usuario exacto y la palabra archivar.' });
      return;
    }

    setSaving(true);
    try {
      const respuesta = await API.eliminarAdminUsuario(modalTarget.id, deleteUserForm.username, deleteUserForm.confirmation);
      showToast(respuesta?.message || `Usuario ${modalTarget.username} archivado por 30 días`, 'success');
      setShowModal(false);
      setModalTarget(null);
      loadUsuarios();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al archivar el usuario'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurarUsuario = async (u) => {
    if (!window.confirm(`¿Restaurar la cuenta @${u.username}? Se cancelará el borrado programado y recuperará el acceso.`)) return;
    try {
      const respuesta = await API.restaurarAdminUsuario(u.id);
      showToast(respuesta?.message || `Cuenta @${u.username} restaurada.`, 'success');
      loadUsuarios();
    } catch (err) {
      showToast(getErrorMessage(err, 'Error al restaurar la cuenta'), 'error');
    }
  };

  // ─── Exportar a CSV ─────────────────────────────────────────────────────────

  const exportarCSV = (tipo) => {
    let csvContent = '';
    let filename = '';

    if (tipo === 'empresas') {
      const headers = ['Nombre', 'Usuario', 'Estado', 'Suscripción', 'Plan', 'Vence', 'Eliminación programada'];
      const rows = empresasFiltradas.map(e => [
        e.nombre,
        e.username,
        e.archivada ? 'Archivada' : (e.activo ? 'Activo' : 'Bloqueado'),
        e.subscriptionStatus,
        e.planType || '—',
        e.currentPeriodEnd ? Utils.formatDate(e.currentPeriodEnd) : '—',
        e.scheduledDeletionAt ? Utils.formatDate(e.scheduledDeletionAt) : '—',
      ]);
      csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      filename = `empresas_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (tipo === 'usuarios') {
      const headers = ['Usuario', 'Nombre', 'Rol', 'Estado', 'IP de registro', 'Fecha de creación', 'Último acceso', 'IP último acceso', 'Latitud', 'Longitud', 'Eliminación programada'];
      const rows = usuariosFiltrados.map(u => [
        u.username,
        u.nombre || '—',
        u.rol,
        u.archivado ? 'Archivado' : (u.activo ? 'Activo' : 'Inactivo'),
        u.registrationIp || 'No disponible',
        u.createdAt ? new Date(u.createdAt).toLocaleString('es-VE') : 'No disponible',
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('es-VE') : 'Nunca',
        u.lastLoginIp || 'No disponible',
        u.registrationLatitude ?? 'No disponible',
        u.registrationLongitude ?? 'No disponible',
        u.scheduledDeletionAt ? Utils.formatDate(u.scheduledDeletionAt) : '—',
      ]);
      csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      filename = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (tipo === 'activaciones') {
      const headers = ['Usuario', 'Plan', 'Método Pago', 'Referencia', 'Estado', 'Notas', 'Revisado', 'Fecha'];
      const rows = activaciones.map(a => [
        a.usuario?.nombre || '—',
        a.plan,
        a.metodoPago?.replaceAll('_', ' '),
        a.referencia || '—',
        a.estado,
        a.notas || '—',
        a.revisadoEn ? Utils.formatDate(a.revisadoEn) : '—',
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

  const noticiaVideoPreview = parseVideoUrl(noticiaForm.videoUrl);

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
              if (tab === 'dashboard') loadDashboard();
              else if (tab === 'empresas') loadEmpresas();
              else if (tab === 'historial') loadActivaciones();
              else if (tab === 'auditoria') loadAuditoria();
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
            Pagos
            {stats.pagosPendientes > 0 && (
              <span className="badge badge-warning" style={{ marginLeft: '2px' }}>
                {stats.pagosPendientes}
              </span>
            )}
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
          <button style={tabStyle('auditoria')} onClick={() => setTab('auditoria')}>
            <Icon icon={alertIcon} className="h-4 w-4" />
            Auditoría
          </button>
        </div>

        {/* ─── TAB: DASHBOARD ─── */}
        {tab === 'dashboard' && (
          <>
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
              <div style={statIconStyle('#6b7280')}>
                <Icon icon={archiveDownIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.empresasArchivadas}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Archivadas (30 días)</div>
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
            <div style={statCardStyle}>
              <div style={statIconStyle('#f97316')}>
                <Icon icon={historyIcon} className="h-5 w-5" />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.pagosPendientes}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pagos por revisar</div>
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

          {salud?.total > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Salud de suscripciones</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {salud.total} inconsistencia(s) entre Usuario y Empresa.
                  </p>
                </div>
                <Button onClick={() => setTab('auditoria')} variant="secondary" size="sm" icon="mdi:shield-alert">
                  Ver auditoría
                </Button>
              </div>
              <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {(salud.items || []).slice(0, 5).map((item, index) => (
                  <li key={`${item.tipo}-${item.usuarioId}-${index}`} style={{ marginBottom: '0.35rem' }}>
                    <strong>{item.empresa || 'Empresa'}:</strong> {item.detalle}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </>
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
                <option value="archivadas">Archivadas</option>
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
                      <tr key={u.id} style={{ opacity: u.archivada ? 0.65 : (u.activo ? 1 : 0.6) }}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{u.username}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.archivada ? 'badge-warning' : (u.activo ? 'badge-success' : 'badge-danger')}`}>
                            {u.archivada ? 'ARCHIVADA' : (u.activo ? 'ACTIVO' : 'BLOQUEADO')}
                          </span>
                          {u.archivada && u.scheduledDeletionAt && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              Se elimina: {Utils.formatDate(u.scheduledDeletionAt)}
                            </div>
                          )}
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
                            {u.archivada ? (
                              <button onClick={() => handleRestaurarEmpresa(u)} style={actionBtnStyle('success')} title="Restaurar empresa">
                                <Icon icon={archiveUpIcon} className="h-4 w-4" />
                              </button>
                            ) : (
                              <>
                                <button onClick={() => openActivarModal(u)} style={actionBtnStyle('primary')} title="Activar/Renovar">
                                  <Icon icon={calendarIcon} className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleCambiarEstado(u)} style={actionBtnStyle(u.activo ? 'warning' : 'success')} title={u.activo ? 'Bloquear' : 'Desbloquear'}>
                                  <Icon icon={u.activo ? blockIcon : unblockIcon} className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleEliminarEmpresa(u)} style={actionBtnStyle('danger')} title="Archivar 30 días">
                                  <Icon icon={archiveDownIcon} className="h-4 w-4" />
                                </button>
                              </>
                            )}
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

        {/* ─── TAB: PAGOS (bandeja de solicitudes) ─── */}
        {tab === 'historial' && (
          <div className="card">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Pagos reportados</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Aprueba o rechaza cada solicitud. Aprobar activa la cuenta y renueva su período.
                </p>
              </div>
              <select value={filterPago} onChange={e => setFilterPago(e.target.value)} style={{ ...inputStyle(false), width: 'auto' }}>
                <option value="todos">Todos</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="APROBADA">Aprobados</option>
                <option value="RECHAZADA">Rechazados</option>
              </select>
              <Button onClick={() => exportarCSV('activaciones')} variant="secondary" size="sm" icon="mdi:download">
                Exportar CSV
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Empresa / Usuario</th>
                    <th>Plan</th>
                    <th>Método Pago</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th style={{ minWidth: '110px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="empty-state">Cargando pagos...</td></tr>
                  ) : activacionesFiltradas.length === 0 ? (
                    <tr><td colSpan={7} className="empty-state">
                      {filterPago === 'PENDIENTE' ? 'No hay pagos pendientes por revisar' : 'No hay solicitudes con este estado'}
                    </td></tr>
                  ) : activacionesFiltradas.map(a => (
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
                        {a.metodoPago?.replaceAll('_', ' ')}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '210px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.referencia || ''}>
                          {a.referencia || '—'}
                        </div>
                        {a.notas && (
                          <div style={{ fontSize: '0.72rem', fontStyle: 'italic', whiteSpace: 'normal' }} title={a.notas}>
                            {a.notas}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${ESTADO_BADGE[a.estado] || ''}`}>{a.estado}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {Utils.formatDate(a.createdAt)}
                        {a.revisadoEn && (
                          <div style={{ fontSize: '0.7rem' }}>Revisado: {Utils.formatDate(a.revisadoEn)}</div>
                        )}
                      </td>
                      <td>
                        {a.estado === 'PENDIENTE' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => openAprobarModal(a)} style={actionBtnStyle('success')} title="Aprobar pago y activar">
                              <Icon icon={checkIcon} className="h-4 w-4" />
                            </button>
                            <button onClick={() => openRechazarModal(a)} style={actionBtnStyle('danger')} title="Rechazar pago">
                              <Icon icon={closeIcon} className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB: AUDITORÍA ─── */}
        {tab === 'auditoria' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Auditoría de acciones</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Activaciones, bloqueos, bajas y cambios de contenido con su actor e IP.
                </p>
              </div>
              <Button onClick={loadAuditoria} variant="secondary" size="sm" icon="mdi:refresh">
                Actualizar
              </Button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Entidad</th>
                    <th>Empresa</th>
                    <th>Actor</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="empty-state">Cargando auditoría...</td></tr>
                  ) : auditoria.length === 0 ? (
                    <tr><td colSpan={6} className="empty-state">Aún no hay acciones registradas</td></tr>
                  ) : auditoria.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {Utils.formatDate(log.createdAt)}
                      </td>
                      <td><span className="badge badge-info">{log.accion}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {log.entidad}
                        {log.entidadId && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            #{String(log.entidadId).slice(0, 8)}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{log.empresa?.nombre || '—'}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {log.usuario ? `@${log.usuario.username}` : 'Sistema'}
                        {log.ipAddress && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{log.ipAddress}</div>
                        )}
                      </td>
                      <td style={{ maxWidth: '320px' }}>
                        <code style={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {formatearDetalle(log)}
                        </code>
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
                    <th>Media</th>
                    <th>Destacado</th>
                    <th>Publicado</th>
                    <th>Fecha</th>
                    <th style={{ minWidth: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="empty-state">Cargando noticias...</td></tr>
                  ) : noticias.length === 0 ? (
                    <tr><td colSpan={7} className="empty-state">No hay noticias creadas</td></tr>
                  ) : noticias.map(n => (
                    <tr key={n.id} style={{ opacity: n.publicado ? 1 : 0.6 }}>
                      <td style={{ fontWeight: 600 }}>{n.titulo}</td>
                      <td>
                        <span className="badge badge-info">{n.categoria}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {n.imagenUrl && (
                            <img
                              src={n.imagenUrl}
                              alt=""
                              width={40}
                              height={40}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          {n.videoUrl && (
                            <Icon icon={videoIcon} className="h-5 w-5" style={{ color: 'var(--primary)' }} title="Tiene video" />
                          )}
                          {!n.imagenUrl && !n.videoUrl && (
                            <span style={{ color: 'var(--text-secondary)' }}>—</span>
                          )}
                        </div>
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
                    <th>IP de registro</th>
                    <th>Fecha de creación</th>
                    <th>Último acceso</th>
                    <th>Ubicación de creación</th>
                    <th style={{ minWidth: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="empty-state">Cargando usuarios...</td></tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr><td colSpan={9} className="empty-state">No hay usuarios registrados</td></tr>
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
                        <span className={`badge ${u.archivado ? 'badge-warning' : (u.activo ? 'badge-success' : 'badge-danger')}`}>
                          {u.archivado ? 'ARCHIVADO' : (u.activo ? 'ACTIVO' : 'INACTIVO')}
                        </span>
                        {u.archivado && u.scheduledDeletionAt && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Se elimina: {Utils.formatDate(u.scheduledDeletionAt)}
                          </div>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{u.registrationIp || 'No registrada'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleString('es-VE') : 'No disponible'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('es-VE') : 'Nunca'}
                        {u.lastLoginIp && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{u.lastLoginIp}</div>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {Number.isFinite(u.registrationLatitude) && Number.isFinite(u.registrationLongitude)
                          ? `${u.registrationLatitude.toFixed(5)}, ${u.registrationLongitude.toFixed(5)}`
                          : 'No disponible'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {u.archivado ? (
                            <button
                              onClick={() => handleRestaurarUsuario(u)}
                              className="btn btn-sm"
                              style={{ background: 'var(--success, #10b981)', color: 'white' }}
                              title="Restaurar cuenta"
                            >
                              <Icon icon={archiveUpIcon} className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => openResetModal(u)} className="btn btn-sm" style={{ background: 'var(--surface3)' }} title="Resetear contraseña">
                                <Icon icon={keyIcon} className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteUserModal(u)}
                                className="btn btn-sm"
                                style={{ background: 'var(--danger)', color: 'white' }}
                                title="Archivar 30 días"
                              >
                                <Icon icon={archiveDownIcon} className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
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
                {modalType === 'aprobar' && 'Aprobar Pago'}
                {modalType === 'rechazar' && 'Rechazar Pago'}
                {modalType === 'promocion' && (modalTarget ? 'Editar Promoción' : 'Nueva Promoción')}
                {modalType === 'noticia' && (modalTarget ? 'Editar Noticia' : 'Nueva Noticia')}
                {modalType === 'reset' && 'Resetear Contraseña'}
                {modalType === 'deleteUser' && 'Eliminar Usuario Permanentemente'}
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

            {/* Modal Aprobar pago */}
            {modalType === 'aprobar' && modalTarget && (
              <form onSubmit={handleAprobar}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'var(--surface3)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700 }}>{modalTarget.usuario?.nombre || modalTarget.usuario?.username || 'Empresa'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      @{modalTarget.usuario?.username} · Ref. {modalTarget.referencia}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Método: {modalTarget.metodoPago?.replaceAll('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo de Plan</label>
                    <select className="form-control" value={aprobarForm.plan_type} onChange={e => setAprobarForm(f => ({ ...f, plan_type: e.target.value }))}>
                      <option value="monthly">Mensual</option>
                      <option value="lifetime">Vitalicio</option>
                    </select>
                  </div>

                  {aprobarForm.plan_type === 'monthly' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Meses</label>
                      <input
                        type="number"
                        className="form-control"
                        value={aprobarForm.meses}
                        onChange={e => setAprobarForm(f => ({ ...f, meses: parseInt(e.target.value) || 1 }))}
                        min="1"
                        max="12"
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Notas internas (opcional)</label>
                    <textarea
                      rows={2}
                      style={inputStyle(false)}
                      value={aprobarForm.notas}
                      onChange={e => setAprobarForm(f => ({ ...f, notas: e.target.value }))}
                      placeholder="Ej: Referencia verificada en Banesco"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Activando...' : 'Confirmar y activar'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Rechazar pago */}
            {modalType === 'rechazar' && modalTarget && (
              <form onSubmit={handleRechazar}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}>
                    <div style={{ fontWeight: 700 }}>La solicitud quedará como RECHAZADA.</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      La cuenta no se activará. {modalTarget.usuario?.nombre || modalTarget.usuario?.username} podrá reportar un nuevo pago.
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Motivo del rechazo *</label>
                    <textarea
                      rows={3}
                      style={inputStyle(fieldErrors.notas)}
                      value={rechazarForm.notas}
                      onChange={e => {
                        setRechazarForm({ notas: e.target.value });
                        setFieldErrors({});
                      }}
                      placeholder="Ej: La referencia no aparece en el estado de cuenta"
                    />
                    <FieldError message={fieldErrors.notas} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-danger" disabled={saving}>
                    {saving ? 'Rechazando...' : 'Rechazar solicitud'}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Descuento (%)</label>
                      <input type="number" style={inputStyle(false)} value={promocionForm.descuentoPorc} onChange={e => setPromocionForm(f => ({ ...f, descuentoPorc: e.target.value }))} placeholder="Ej: 10" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Días Extra Trial</label>
                      <input type="number" style={inputStyle(false)} value={promocionForm.diasExtraTrial} onChange={e => setPromocionForm(f => ({ ...f, diasExtraTrial: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
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
                    <input style={inputStyle(fieldErrors.imagenUrl)} value={noticiaForm.imagenUrl} onChange={e => setNoticiaForm(f => ({ ...f, imagenUrl: e.target.value }))} placeholder="https://ejemplo.com/imagen.jpg" />
                    <FieldError message={fieldErrors.imagenUrl} />
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Pega un enlace público (https://…). Para archivos locales, súbelos antes a un servicio como Cloudinary, Imgur o YouTube.
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>URL de Video</label>
                    <input style={inputStyle(fieldErrors.videoUrl)} value={noticiaForm.videoUrl} onChange={e => setNoticiaForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=... o https://.../video.mp4" />
                    <FieldError message={fieldErrors.videoUrl} />
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Acepta YouTube, Vimeo o un enlace directo .mp4/.webm/.ogg. El video se muestra antes que la imagen.
                    </p>
                  </div>
                  {(noticiaForm.imagenUrl || noticiaForm.videoUrl) && (
                    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--surface3)' }}>
                      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Vista previa</div>
                      {noticiaVideoPreview?.tipo === 'iframe' && (
                        <iframe
                          src={noticiaVideoPreview.src}
                          title="Vista previa del video"
                          style={{ width: '100%', aspectRatio: '16 / 9', border: 0, display: 'block' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                      {noticiaVideoPreview?.tipo === 'video' && (
                        <video src={noticiaVideoPreview.src} controls preload="metadata" style={{ width: '100%', aspectRatio: '16 / 9', display: 'block', backgroundColor: '#000' }} />
                      )}
                      {noticiaVideoPreview?.tipo === 'link' && (
                        <p style={{ margin: 0, padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Se mostrará como enlace: <a href={noticiaVideoPreview.src} target="_blank" rel="noreferrer">{noticiaVideoPreview.src}</a>
                        </p>
                      )}
                      {!noticiaVideoPreview && noticiaForm.imagenUrl && (
                        <img
                          src={noticiaForm.imagenUrl}
                          alt="Vista previa"
                          style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
                          onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
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
                    <Icon icon={alertIcon} className="h-4 w-4" style={{ display: 'inline', marginRight: '4px' }} />
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

            {modalType === 'deleteUser' && modalTarget && (
              <form onSubmit={handleDeleteUser}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '8px', color: '#b45309' }}>
                    <div style={{ fontWeight: 700 }}>La cuenta se archivará por 30 días.</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      {modalTarget.rol === 'EMPRESA'
                        ? 'Se bloqueará toda la empresa (subusuarios incluidos) y se programará el borrado definitivo de sus ventas, pagos, productos, clientes y demás datos. Puedes restaurarla antes de que venza el plazo.'
                        : 'Se bloqueará la cuenta y se programará el borrado definitivo de sus ventas, pagos y actividad asociada. Puedes restaurarla antes de que venza el plazo.'}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Escribe el nombre del usuario a archivar: <strong>{modalTarget.username}</strong>
                    </label>
                    <input
                      autoComplete="off"
                      style={inputStyle(fieldErrors.username)}
                      value={deleteUserForm.username}
                      onChange={e => {
                        setDeleteUserForm(form => ({ ...form, username: e.target.value }));
                        setFieldErrors({});
                      }}
                    />
                    <FieldError message={fieldErrors.username} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Luego escribe <strong>archivar</strong>
                    </label>
                    <input
                      autoComplete="off"
                      style={inputStyle(fieldErrors.confirmation)}
                      value={deleteUserForm.confirmation}
                      onChange={e => {
                        setDeleteUserForm(form => ({ ...form, confirmation: e.target.value }));
                        setFieldErrors({});
                      }}
                    />
                    <FieldError message={fieldErrors.confirmation} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={saving || deleteUserForm.username !== modalTarget.username || deleteUserForm.confirmation !== 'archivar'}
                  >
                    {saving ? 'Archivando...' : 'Archivar por 30 días'}
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
