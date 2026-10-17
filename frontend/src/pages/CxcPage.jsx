import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import filterIcon from '@iconify/icons-mdi/filter-variant';
import eyeIcon from '@iconify/icons-mdi/eye';
import clockAlertIcon from '@iconify/icons-mdi/clock-alert';
import downloadIcon from '@iconify/icons-mdi/download';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';

const ESTADO_LABELS = {
  PENDING: 'Pendiente',
  PARTIALLY_PAID: 'Parcial',
  PAID: 'Pagada',
  OVERDUE: 'Vencida'
};

const ESTADO_COLORS = {
  PENDING: '#f59e0b',
  PARTIALLY_PAID: '#3b82f6',
  PAID: '#10b981',
  OVERDUE: '#ef4444'
};

export function CxcPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [cuentas, setCuentas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState({
    q: '',
    estado: '',
    vencidas: false,
    clienteId: ''
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [showFiltros, setShowFiltros] = useState(false);
  const [orden, setOrden] = useState('vencimiento');
  const loadRequestId = useRef(0);

  const loadResumen = async () => {
    try {
      const data = await API.getCxcResumen();
      setResumen(data);
    } catch (err) {
      console.error('Error loading resumen cxc:', err);
    }
  };

  const loadData = async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    try {
      const params = { page, limit, orden, ...filtrosAplicados };
      const data = await API.getCxc(params);
      if (requestId !== loadRequestId.current) return;
      setCuentas(data.data || []);
      setTotal(data.total ?? (data.data || []).length);
    } catch (err) {
      if (requestId === loadRequestId.current) {
        showToast('Error al cargar cuentas por cobrar: ' + err.message, 'error');
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    setPage(1);
    setFiltrosAplicados({ ...filtros });
  };

  const limpiarFiltros = () => {
    setFiltros({ q: '', estado: '', vencidas: false, clienteId: '' });
    setFiltrosAplicados({});
    setPage(1);
  };

  useEffect(() => {
    loadResumen();
    loadData();
  }, [page, filtrosAplicados, orden]);

  const exportarCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cxc/export?${new URLSearchParams({ ...filtrosAplicados, orden })}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al exportar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cxc_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Error al exportar CSV: ' + err.message, 'error');
    }
  };

  const formatEstado = (estado) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: ESTADO_COLORS[estado] + '20',
      color: ESTADO_COLORS[estado]
    }}>
      {ESTADO_LABELS[estado] || estado}
    </span>
  );

  const getDiasVencidoClass = (dias) => {
    if (dias > 60) return 'text-red-500 font-bold';
    if (dias > 30) return 'text-orange-500 font-bold';
    if (dias > 0) return 'text-yellow-500 font-bold';
    return 'text-green-500';
  };

  return (
    <>
      <Header
        title="Cuentas por Cobrar"
        subtitle="Gestión de saldos pendientes y cobranza"
        toggleSidebar={toggleSidebar}
      />

      <div className="p-4 md:p-6 space-y-4">
        {/* Resumen Cards */}
        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Pendiente</p>
              <p className="text-2xl font-bold text-gray-900">{Utils.formatMoney(resumen.totalPendiente)}</p>
              <p className="text-xs text-gray-400 mt-1">{resumen.cantidadPendientes} facturas</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Vencido</p>
              <p className="text-2xl font-bold text-red-600">{Utils.formatMoney(resumen.totalVencido)}</p>
              <p className="text-xs text-gray-400 mt-1">{resumen.cantidadVencidas} facturas</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">0-30 días</p>
              <p className="text-2xl font-bold text-green-600">{Utils.formatMoney(resumen.aging['0_30'])}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">61+ días</p>
              <p className="text-2xl font-bold text-red-600">{Utils.formatMoney(resumen.aging['61_90'])}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Icon icon={filterIcon} width={20} height={20} /> Filtros
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowFiltros(!showFiltros)}>
              {showFiltros ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>

          {showFiltros && (
            <div className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <input
                  type="text"
                  value={filtros.q}
                  onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
                  placeholder="Cliente, RIF, N° Factura..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="PARTIALLY_PAID">Parcial</option>
                  <option value="PAID">Pagada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solo vencidas</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filtros.vencidas}
                    onChange={(e) => setFiltros({ ...filtros, vencidas: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <div className="flex gap-2 w-full">
                  <Button variant="primary" onClick={aplicarFiltros} className="flex-1">
                    <Icon icon={filterIcon} width={16} height={16} className="mr-1" />
                    Aplicar
                  </Button>
                  <Button variant="secondary" onClick={limpiarFiltros} className="flex-1">
                    Limpiar
                  </Button>
                  <Button variant="ghost" onClick={exportarCSV} className="flex-1">
                    <Icon icon={downloadIcon} width={16} height={16} className="mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-end gap-2">
            <label className="text-sm text-gray-600">Ordenar por</label>
            <select
              value={orden}
              onChange={(e) => { setOrden(e.target.value); setPage(1); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="vencimiento">Vencimiento (más reciente)</option>
              <option value="estado">Estado (por pagar primero)</option>
              <option value="cliente">Cliente (A-Z)</option>
              <option value="monto">Monto (mayor a menor)</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Factura</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto Pendiente</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Días Vencido</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Cargando...
                    </td>
                  </tr>
                ) : cuentas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No se encontraron cuentas por cobrar
                    </td>
                  </tr>
                ) : (
                  cuentas.map((cuenta) => (
                    <tr key={cuenta.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{cuenta.factura?.numeroFactura || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{cuenta.cliente?.razonSocial}</div>
                        <div className="text-xs text-gray-500">{cuenta.cliente?.rifCedula}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        {Utils.formatMoney(cuenta.montoPendiente)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500">
                        {cuenta.fechaVencimiento ? Utils.formatDate(cuenta.fechaVencimiento) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-center text-sm font-medium ${getDiasVencidoClass(cuenta.diasVencido)}`}>
                        {cuenta.diasVencido > 0 ? `${cuenta.diasVencido} días` : 'Al día'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {formatEstado(cuenta.estado)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/cxc/${cuenta.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Icon icon={eyeIcon} width={18} height={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {total > limit && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page * limit >= total || loading}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}