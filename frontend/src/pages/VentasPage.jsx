import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import { useAuth } from '../context/AuthContext';

export function VentasPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;
  const [periodo, setPeriodo] = useState('todos'); // todos | hoy | semana | mes | mesEspecifico | anio
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');
  const loadRequestId = useRef(0);

  const [config, setConfig] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);

  const calcularRango = () => {
    const ahora = new Date();
    const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const finDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    switch (periodo) {
      case 'hoy':
        return { desde: inicioDia(ahora), hasta: finDia(ahora) };
      case 'semana': {
        const dia = ahora.getDay(); // 0 = domingo
        const diffLunes = dia === 0 ? -6 : 1 - dia;
        const lunes = new Date(ahora);
        lunes.setDate(ahora.getDate() + diffLunes);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        return { desde: inicioDia(lunes), hasta: finDia(domingo) };
      }
      case 'mes':
        return { desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1), hasta: finDia(new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)) };
      case 'mesEspecifico':
        return { desde: new Date(anio, mes - 1, 1), hasta: finDia(new Date(anio, mes, 0)) };
      case 'anio':
        return { desde: new Date(anio, 0, 1), hasta: finDia(new Date(anio, 11, 31)) };
      default:
        return {};
    }
  };

  const loadData = async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    try {
      const { desde, hasta } = calcularRango();
      const params = {};
      if (desde) params.desde = desde.toISOString();
      if (hasta) params.hasta = hasta.toISOString();
      if (estadoFiltro) params.estado = estadoFiltro;
      if (busquedaAplicada) params.q = busquedaAplicada;
      params.page = page;
      params.limit = limit;
      const [data, conf] = await Promise.all([
        API.getFacturas(params),
        API.getConfig()
      ]);
      if (requestId !== loadRequestId.current) return;
      setFacturas(data.data || []);
      setTotal(data.total ?? 0);
      setConfig(conf);
    } catch (err) {
      if (requestId === loadRequestId.current) {
        showToast('Error al cargar ventas: ' + err.message, 'error');
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setPage(1);
    setBusquedaAplicada(busqueda.trim());
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, mes, anio, estadoFiltro, page, busquedaAplicada]);

  const handleAnular = async (id) => {
    const confirmacion = window.prompt(
      'Esta acción anulará la venta y repondrá el stock.\n\nEscribe "anular" para continuar:'
    );
    if (confirmacion === null) return;
    if (confirmacion.trim() !== 'anular') {
      showToast('Debes escribir "anular" exactamente. No se anuló la venta.', 'error');
      return;
    }

    const motivo = window.prompt('Describe el motivo de la anulación:');
    if (motivo === null) return;
    if (!motivo.trim()) {
      showToast('Debes escribir una descripción del motivo. No se anuló la venta.', 'error');
      return;
    }

    let codigoAnulacion;
    if (user?.rol === 'CAJA') {
      codigoAnulacion = window.prompt('Ingresa el código de autorización del supervisor:');
      if (codigoAnulacion === null) return;
      if (!codigoAnulacion.trim()) {
        showToast('El código de autorización es obligatorio para anular.', 'error');
        return;
      }
    }

    try {
      await API.anularFactura(id, { confirmacion: confirmacion.trim(), motivo: motivo.trim(), codigoAnulacion });
      showToast('Factura anulada con éxito', 'success');
      loadData();
    } catch (err) {
      showToast('Error al anular factura: ' + err.message, 'error');
    }
  };

  const handleVerFactura = async (id) => {
    try {
      const fullFactura = await API.getFactura(id);
      setSelectedFactura(fullFactura);
      setShowReceipt(true);
    } catch (err) {
      showToast('Error al cargar detalles de la factura: ' + err.message, 'error');
    }
  };

  return (
    <>
      <Header
        title="Historial de Ventas"
        subtitle="Registro completo de facturación e ingresos"
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={loadData} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Recargar
          </button>
        }
      />

      <div className="page-body">
        <div className="card" style={{ marginBottom: '16px', padding: '14px 16px', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Período
              <select className="form-input" value={periodo} onChange={e => { setPeriodo(e.target.value); setPage(1); }}>
                <option value="todos">Todos</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="mesEspecifico">Mes específico</option>
                <option value="anio">Año</option>
              </select>
            </label>
            {periodo === 'mesEspecifico' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Mes
                <select className="form-input" value={mes} onChange={e => { setMes(parseInt(e.target.value)); setPage(1); }}>
                  {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </label>
            )}
            {(periodo === 'mesEspecifico' || periodo === 'anio') && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Año
                <input type="number" className="form-input" value={anio} onChange={e => { setAnio(parseInt(e.target.value) || new Date().getFullYear()); setPage(1); }} style={{ width: '110px' }} />
              </label>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Estado
              <select className="form-input" value={estadoFiltro} onChange={e => { setEstadoFiltro(e.target.value); setPage(1); }}>
                <option value="">Todos</option>
                <option value="PAID">Pagada</option>
                <option value="PENDING">Pendiente</option>
                <option value="PARTIALLY_PAID">Abonada</option>
                <option value="VOIDED">Anulada</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Buscar cliente, usuario o producto
              <input
                type="text"
                className="form-input"
                placeholder="Cliente, RIF, usuario o producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') aplicarFiltros(); }}
              />
            </label>
            <button onClick={aplicarFiltros} className="btn btn-primary btn-sm inline-flex items-center gap-1">
              <Icon icon="mdi:filter" className="h-4 w-4" /> Filtrar
            </button>
          </div>
          {total > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> {total === 1 ? 'venta encontrada' : 'ventas encontradas'} · mostrando {facturas.length}
            </div>
          )}
        </div>
        <div className="card">
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>N° Factura</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Cliente</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Usuario</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Productos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Fecha</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Total USD</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Total Bs.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Estado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="empty-state" style={{ padding: '32px' }}>Cargando historial...</td>
                  </tr>
                ) : facturas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-state" style={{ padding: '32px' }}>No hay facturas registradas</td>
                  </tr>
                ) : (
                  facturas.map(f => (
                    <tr key={f.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>#{f.numeroFactura?.toString().padStart(5, '0')}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 500 }}>{f.cliente?.razonSocial || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.cliente?.rifCedula}</div>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 500 }}>{f.usuario?.nombre || '—'}</div>
                        {f.usuario?.username && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{f.usuario.username}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', minWidth: '180px' }}>
                        {(f.items || []).length > 0
                          ? [...new Set(f.items.map(item => item.descripcionHistorica || item.producto?.nombre).filter(Boolean))].join(', ')
                          : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{Utils.formatDateTime(f.fechaEmision)}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, textAlign: 'right' }}>
                        {(() => { const tasa = f.tasaDolar || f.tasaCambio || config?.moneda?.tasaDolar || 1; const totalUSD = f.moneda === 'VES' && tasa > 0 ? (f.total || 0) / tasa : (f.total || 0); return Utils.formatMoney(totalUSD); })()}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', color: 'var(--success)', fontWeight: 600, textAlign: 'right' }}>
                        {(() => { const tasa = f.tasaDolar || f.tasaCambio || config?.moneda?.tasaDolar || 1; const totalUSD = f.moneda === 'VES' && tasa > 0 ? (f.total || 0) / tasa : (f.total || 0); const totalBS = f.moneda === 'VES' ? (f.total || 0) : totalUSD * tasa; return `${totalBS.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`; })()}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        {f.estado === 'PAID' ? (
                          <span className="badge badge-success">Pagada</span>
                        ) : f.estado === 'PENDING' ? (
                          <span className="badge badge-warning">Pendiente</span>
                        ) : f.estado === 'PARTIALLY_PAID' ? (
                          <span className="badge badge-info">Abonada</span>
                        ) : (
                          <span className="badge badge-danger">Anulada</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleVerFactura(f.id)}
                            className="btn btn-ghost btn-sm"
                            title="Ver / Imprimir Factura"
                          >
                            <Icon icon="mdi:printer" className="h-4 w-4" />
                          </button>
                          
                          {f.estado !== 'VOIDED' && (
                            <button
                              onClick={() => handleAnular(f.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Anular"
                            >
                              <Icon icon="mdi:close-circle-outline" className="h-4 w-4" />
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
          {total > limit && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Página {page} de {Math.ceil(total / limit)}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      </div>

      {showReceipt && (
        <ReceiptModal
          factura={selectedFactura}
          config={config}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
}
