import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify/icons-mdi/refresh';
import filterIcon from '@iconify/icons-mdi/filter-variant';
import eyeIcon from '@iconify/icons-mdi/eye';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import {
  MOTIVOS_ANULACION_PAGO,
  getMetodoPagoLabel,
  getMotivoAnulacionLabel,
} from '../constants/pagos';

const FILTROS_INICIALES = {
  q: '',
  motivo: '',
  desde: '',
  hasta: '',
};

function fechaISO(fecha) {
  if (!fecha) return undefined;
  const valor = new Date(`${fecha}T00:00:00`);
  return isNaN(valor.getTime()) ? undefined : valor.toISOString();
}

function finDiaISO(fecha) {
  if (!fecha) return undefined;
  const valor = new Date(`${fecha}T23:59:59.999`);
  return isNaN(valor.getTime()) ? undefined : valor.toISOString();
}

export function PagosAnuladosPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosAplicados, setFiltrosAplicados] = useState({});
  const [showFiltros, setShowFiltros] = useState(true);
  const limit = 25;
  const loadRequestId = useRef(0);

  const loadData = async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    try {
      const params = { page, limit };
      if (filtrosAplicados.q) params.q = filtrosAplicados.q;
      if (filtrosAplicados.motivo) params.motivo = filtrosAplicados.motivo;
      if (filtrosAplicados.desde) params.desde = fechaISO(filtrosAplicados.desde);
      if (filtrosAplicados.hasta) params.hasta = finDiaISO(filtrosAplicados.hasta);

      const data = await API.getPagosAnulados(params);
      if (requestId !== loadRequestId.current) return;
      setPagos(data.data || []);
      setTotal(data.total ?? 0);
    } catch (err) {
      if (requestId === loadRequestId.current) {
        showToast('Error al cargar pagos anulados: ' + err.message, 'error');
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // loadData cambia con cada render por los filtros aplicados; el efecto debe
    // depender solo de los valores que disparan una nueva consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtrosAplicados]);

  const aplicarFiltros = () => {
    setPage(1);
    setFiltrosAplicados({ ...filtros, q: filtros.q.trim() });
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setFiltrosAplicados({});
    setPage(1);
  };

  const irACuenta = (pago) => {
    const cuentaId = pago.factura?.cuentaPorCobrar?.id;
    if (cuentaId) navigate(`/cxc/${cuentaId}`);
  };

  return (
    <>
      <Header
        title="Pagos anulados"
        subtitle="Trazabilidad de pagos anulados, motivos y descripciones"
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={loadData} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Recargar
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-4">
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
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <input
                  type="text"
                  value={filtros.q}
                  onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') aplicarFiltros(); }}
                  placeholder="Descripción, cliente, factura o referencia..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <select
                  value={filtros.motivo}
                  onChange={(e) => setFiltros({ ...filtros, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {MOTIVOS_ANULACION_PAGO.map((motivo) => (
                    <option key={motivo.value} value={motivo.value}>{motivo.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filtros.desde}
                  onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filtros.hasta}
                  onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex flex-wrap gap-2 justify-end">
                <Button variant="secondary" onClick={limpiarFiltros}>Limpiar</Button>
                <Button variant="primary" onClick={aplicarFiltros}>
                  <Icon icon={filterIcon} width={16} height={16} className="mr-1" />
                  Aplicar filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <strong className="text-gray-900">{total}</strong> {total === 1 ? 'pago anulado' : 'pagos anulados'}
            </p>
            <span className="text-xs text-gray-400">Los pagos no se borran: se conservan para auditoría</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha anulación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Factura</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pago</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Anulado por</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Cargando pagos anulados...</td>
                  </tr>
                ) : pagos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No hay pagos anulados con estos filtros.</td>
                  </tr>
                ) : (
                  pagos.map((pago) => (
                    <tr key={pago.id} className="align-top">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {Utils.formatDateTime(pago.fechaAnulacion)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        #{pago.factura?.numeroFactura?.toString().padStart(5, '0') || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{pago.factura?.cliente?.razonSocial || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{pago.factura?.cliente?.rifCedula}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {Utils.formatMoney(pago.monto, pago.monedaPago === 'VES' ? 'Bs.' : '$')}
                        </div>
                        <div className="text-xs text-gray-500">{pago.monedaPago}</div>
                        <div className="text-xs text-gray-500">
                          {getMetodoPagoLabel(pago.metodoPago)}
                          {pago.referenciaTransaccion ? ` · ${pago.referenciaTransaccion}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                          {getMotivoAnulacionLabel(pago.motivoAnulacion)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 min-w-[260px] max-w-[420px] whitespace-pre-wrap">
                        {pago.descripcionAnulacion}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {pago.anuladoPor || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => irACuenta(pago)}
                          disabled={!pago.factura?.cuentaPorCobrar?.id}
                          className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-blue-600 hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                          title="Ver cuenta por cobrar"
                        >
                          <Icon icon={eyeIcon} width={18} height={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {total > limit && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((actual) => Math.max(1, actual - 1))}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">Página {page} de {Math.ceil(total / limit)}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage((actual) => actual + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
