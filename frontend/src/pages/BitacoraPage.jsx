import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import historyIcon from '@iconify/icons-mdi/history';
import refreshIcon from '@iconify/icons-mdi/refresh';
import filterIcon from '@iconify/icons-mdi/filter-variant';
import chevronDownIcon from '@iconify/icons-mdi/chevron-down';
import chevronUpIcon from '@iconify/icons-mdi/chevron-up';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, CustomSelect } from '../components/ui';

const CATEGORIAS = [
  { value: '', label: 'Todas' },
  { value: 'VENTAS', label: 'Ventas' },
  { value: 'INVENTARIO', label: 'Inventario' },
  { value: 'PAGOS', label: 'Pagos' },
  { value: 'CXC', label: 'Cuentas por cobrar' },
  { value: 'CAJA', label: 'Caja' },
  { value: 'ACCESO', label: 'Accesos' },
  { value: 'ADMIN', label: 'Administración' },
  { value: 'CLIENTES', label: 'Clientes' },
  { value: 'REPORTES', label: 'Reportes' },
  { value: 'CONFIGURACION', label: 'Configuración' },
];

const MODULOS = [
  { value: '', label: 'Todos' },
  { value: 'auth', label: 'Acceso' },
  { value: 'caja', label: 'Caja' },
  { value: 'config', label: 'Configuración' },
  { value: 'cxc', label: 'Cuentas por cobrar' },
  { value: 'facturas', label: 'Facturas' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'productos', label: 'Productos' },
  { value: 'tasa', label: 'Tasa' },
  { value: 'usuarios', label: 'Usuarios' },
];

const COLORES = {
  VENTAS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INVENTARIO: 'bg-blue-50 text-blue-700 border-blue-200',
  PAGOS: 'bg-violet-50 text-violet-700 border-violet-200',
  CXC: 'bg-amber-50 text-amber-700 border-amber-200',
  CAJA: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  ACCESO: 'bg-rose-50 text-rose-700 border-rose-200',
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CLIENTES: 'bg-orange-50 text-orange-700 border-orange-200',
  REPORTES: 'bg-teal-50 text-teal-700 border-teal-200',
  CONFIGURACION: 'bg-slate-100 text-slate-700 border-slate-200',
};

const FILTROS_INICIALES = { q: '', categoria: '', modulo: '', usuario: '', desde: '', hasta: '' };

function isoInicio(valor) {
  if (!valor) return undefined;
  const fecha = new Date(`${valor}T00:00:00`);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString();
}

function isoFin(valor) {
  if (!valor) return undefined;
  const fecha = new Date(`${valor}T23:59:59.999`);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString();
}

function resumenCambio(datos) {
  if (!datos || typeof datos !== 'object') return null;
  return Object.entries(datos)
    .filter(([, valor]) => valor !== null && typeof valor !== 'object')
    .slice(0, 6)
    .map(([campo, valor]) => `${campo}: ${valor}`)
    .join(' · ');
}

export function BitacoraPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const [eventos, setEventos] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [aplicados, setAplicados] = useState({});
  const [expandido, setExpandido] = useState(null);
  const [integridad, setIntegridad] = useState(null);
  const [errorIntegridad, setErrorIntegridad] = useState(false);
  const peticion = useRef(0);

  const cargar = async (siguienteCursor = null, acumular = false) => {
    const id = ++peticion.current;
    if (acumular) setCargandoMas(true);
    else setLoading(true);

    try {
      const params = { limite: 50 };
      if (aplicados.q) params.q = aplicados.q;
      if (aplicados.categoria) params.categoria = aplicados.categoria;
      if (aplicados.modulo) params.modulo = aplicados.modulo;
      if (aplicados.usuario) params.usuario = aplicados.usuario;
      const desde = isoInicio(aplicados.desde);
      const hasta = isoFin(aplicados.hasta);
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (siguienteCursor) params.cursor = siguienteCursor;

      const data = await API.getBitacora(params);
      if (id !== peticion.current) return;

      setEventos((prev) => (acumular ? [...prev, ...(data.datos || [])] : data.datos || []));
      setCursor(data.siguienteCursor || null);
    } catch (err) {
      if (id === peticion.current) showToast('Error al cargar la bitácora: ' + err.message, 'error');
    } finally {
      if (id === peticion.current) {
        setLoading(false);
        setCargandoMas(false);
      }
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aplicados]);

  useEffect(() => {
    let activa = true;
    API.getBitacoraIntegridad()
      .then((resultado) => {
        if (activa) setIntegridad(resultado);
      })
      .catch(() => {
        if (activa) setErrorIntegridad(true);
      });
    return () => { activa = false; };
  }, []);

  const aplicar = () => {
    setAplicados({ ...filtros, q: filtros.q.trim() });
  };

  const limpiar = () => {
    setFiltros(FILTROS_INICIALES);
    setAplicados({});
  };

  return (
    <>
      <Header
        title="Bitácora"
        subtitle="Registro de actividad: ventas, inventario, pagos, caja, accesos y administración"
        toggleSidebar={toggleSidebar}
        actions={
          <button onClick={() => cargar()} className="btn btn-secondary btn-sm inline-flex items-center gap-2">
            <Icon icon={refreshIcon} className="h-4 w-4" />
            Recargar
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Icon icon={filterIcon} width={20} height={20} />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                value={filtros.q}
                onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') aplicar(); }}
                placeholder="Usuario, acción, factura o descripción..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
              <CustomSelect
                value={filtros.modulo}
                onChange={(val) => setFiltros({ ...filtros, modulo: val })}
                options={MODULOS}
                placeholder="Todos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <CustomSelect
                value={filtros.categoria}
                onChange={(val) => setFiltros({ ...filtros, categoria: val })}
                options={CATEGORIAS}
                placeholder="Todas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={filtros.usuario}
                onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
          </div>

          <div className="px-4 pb-4 flex gap-2">
            <Button size="sm" onClick={aplicar}>Aplicar</Button>
            <Button variant="ghost" size="sm" onClick={limpiar}>Limpiar</Button>
          </div>
        </div>

        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            errorIntegridad
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : integridad?.valido
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : integridad
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {errorIntegridad
            ? 'No se pudo verificar la integridad de la bitácora.'
            : integridad?.valido
              ? `Integridad verificada en los últimos ${integridad.registrosVerificados} registros.`
              : integridad
                ? `Integridad comprometida en el registro ${integridad.registroId}: ${integridad.motivo}.`
                : 'Verificando integridad de la bitácora…'}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando bitácora…</div>
          ) : eventos.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Icon icon={historyIcon} width={40} height={40} className="mx-auto mb-2 opacity-50" />
              No hay registros para los filtros seleccionados.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {eventos.map((evento) => {
                const abierto = expandido === evento.id;
                const resumen = resumenCambio(evento.datosNuevos);
                return (
                  <li key={evento.id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${COLORES[evento.categoria] || COLORES.CONFIGURACION}`}>
                        {evento.categoria}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{evento.accion}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {Utils.formatDateTime(evento.creadoEn)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900">{evento.descripcion}</p>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>👤 {evento.usuarioNombre || 'Sistema'}{evento.usuarioRol ? ` (${evento.usuarioRol})` : ''}</span>
                      {evento.ipAddress && <span>IP {evento.ipAddress}</span>}
                      {evento.entidad && <span>{evento.entidad}{evento.entidadId ? ` · ${evento.entidadId.slice(0, 8)}…` : ''}</span>}
                      {evento.httpMethod && (
                        <span>{evento.httpMethod} {evento.httpPath} · {evento.httpStatus} · {evento.duracionMs} ms</span>
                      )}
                    </div>

                    {(evento.datosAnteriores || evento.datosNuevos) && (
                      <button
                        type="button"
                        onClick={() => setExpandido(abierto ? null : evento.id)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Icon icon={abierto ? chevronUpIcon : chevronDownIcon} width={16} height={16} />
                        {abierto ? 'Ocultar detalle' : 'Ver detalle'}
                      </button>
                    )}

                    {abierto && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Antes</p>
                          <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-64">
                            {JSON.stringify(evento.datosAnteriores, null, 2) || '—'}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Después</p>
                          <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-64">
                            {JSON.stringify(evento.datosNuevos, null, 2) || '—'}
                          </pre>
                        </div>
                      </div>
                    )}

                    {!abierto && resumen && (
                      <p className="mt-1 text-xs text-gray-400 truncate">{resumen}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {cursor && !loading && (
            <div className="p-4 border-t border-gray-100 text-center">
              <Button variant="secondary" size="sm" onClick={() => cargar(cursor, true)} disabled={cargandoMas}>
                {cargandoMas ? 'Cargando…' : 'Cargar más'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
