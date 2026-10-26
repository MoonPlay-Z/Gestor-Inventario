import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import closeIcon from '@iconify/icons-mdi/close';
import cashIcon from '@iconify/icons-mdi/cash';
import flashIcon from '@iconify/icons-mdi/flash';
import lockOpenIcon from '@iconify/icons-mdi/lock-open';
import scaleIcon from '@iconify/icons-mdi/scale';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { API, Utils } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui';
import { ReceiptModal } from '../components/ui/ReceiptModal';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { escanerNativoDisponible } from '../utils/lectorCodigos';
import { EscanerMLKit } from '../components/scanner/EscanerMLKit';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { initOutbox, encolarVenta, obtenerPendientes, obtenerTodos, syncOutbox, onOutboxChange } from '../services/outbox';
import {
  METODOS_PAGO,
  METODOS_PAGO_POS,
  requiereReferencia,
  esFinanciamiento,
} from '../constants/metodosPago';

const EMPTY_CLIENT = { razonSocial: '', rifCedula: '', direccion: '', telefono: '', correo: '' };

export function PosPage() {
  const { toggleSidebar } = useOutletContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cajaStatus, setCajaStatus] = useState(null);
  const [cajaLoading, setCajaLoading] = useState(true);

  const [config, setConfig] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteSearchResults, setClienteSearchResults] = useState([]);
  const [clienteSearchLoading, setClienteSearchLoading] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsTerm, setSearchResultsTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchMoreLoading, setSearchMoreLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchTermRef = useRef('');
  const [cart, setCart] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState('factura');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO_USD');
  const [referencia, setReferencia] = useState('');
  const [cuotas, setCuotas] = useState(1);
  const [loadingEmitir, setLoadingEmitir] = useState(false);
  // Guard síncrono contra doble emisión. `loadingEmitir` no sirve: el estado
  // solo llega al DOM en el siguiente render, así que dos clics rápidos
  // (o Enter repetido) disparan onSubmit antes de que el botón se deshabilite.
  // useRef se actualiza en el momento, antes de cualquier await.
  const emitiendoRef = useRef(false);
  // Clave de idempotencia: sobrevive a recarga y reintentos del proxy, donde
  // el guard de ref se pierde. El backend la usa para no crear dos facturas.
  const requestIdRef = useRef(null);
  const [monedaVisualizacion, setMonedaVisualizacion] = useState('USD'); // 'USD' o 'VES'

  const [showClienteModal, setShowClienteModal] = useState(false);
  const [newCliente, setNewCliente] = useState(EMPTY_CLIENT);
  const [savingCliente, setSavingCliente] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastFactura, setLastFactura] = useState(null);
  const [tipoUltimoDocumento, setTipoUltimoDocumento] = useState('factura');

  const [initialLoading, setInitialLoading] = useState(true);

  const [showScanner, setShowScanner] = useState(false);
  const [escanerNativo, setEscanerNativo] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);

  // Adaptación móvil: en <1024px el panel de cobro se abre en una hoja
  // inferior (al alcance del pulgar), no en la columna lateral de escritorio.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [showCobro, setShowCobro] = useState(false);

  const loadInitialData = async () => {
    try {
      const [confRes, prodRes, cajaRes] = await Promise.all([
        API.getConfig(),
        API.getProductos({ limite: 100 }),
        API.getCajaActual().catch(() => ({ status: 'CLOSED' }))
      ]);
      setConfig(confRes);
      setProductos(prodRes.data || []);
      // No cargar todos los clientes al inicio; se buscan bajo demanda
      setClientes([]);
      setCajaStatus(cajaRes?.estado === 'OPEN' ? 'OPEN' : 'CLOSED');
    } catch (err) {
      showToast('Error cargando datos del POS: ' + err.message, 'error');
      setCajaStatus('CLOSED');
    } finally {
      setCajaLoading(false);
      setInitialLoading(false);
    }
  };

  // Reintento tras abrir la caja en otra pestaña: solo consulta el estado,
  // sin recargar clientes/productos, y vuelve a habilitar el POS si ya está OPEN.
  const reintentarCaja = async () => {
    setCajaLoading(true);
    try {
      const cajaRes = await API.getCajaActual().catch(() => ({ estado: 'CLOSED' }));
      const abierto = cajaRes?.estado === 'OPEN' ? 'OPEN' : 'CLOSED';
      setCajaStatus(abierto);
      if (abierto === 'OPEN') {
        showToast('Turno activo. Ya puedes facturar', 'success');
      } else {
        showToast('El turno sigue cerrado. Ábrelo desde Cierre de Caja', 'warning');
      }
    } finally {
      setCajaLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim();
    searchTermRef.current = term;
    setSearchResults([]);
    setSearchResultsTerm('');
    setSearchPage(1);
    setSearchHasMore(false);
    setSearchError('');
    setSearchMoreLoading(false);

    if (!term) {
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await API.getProductos({ q: term, page: 1, limit: 20 });
        if (!cancelled) {
          const results = res.data || [];
          setSearchResults(results);
          setSearchResultsTerm(term);
          setSearchHasMore(results.length < Number(res.total || 0));
        }
      } catch (err) {
        if (!cancelled) setSearchError(err.message || 'No se pudieron buscar los productos');
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  // ── Búsqueda de clientes (debounced y lista controlada inicial) ────────────
  const clienteSearchTermRef = useRef('');
  useEffect(() => {
    const term = clienteSearch.trim();
    clienteSearchTermRef.current = term;

    let cancelled = false;
    setClienteSearchLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await API.buscarClientes(term, 20);
        if (!cancelled) {
          setClienteSearchResults(res.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error buscando clientes:', err);
          setClienteSearchResults([]);
        }
      } finally {
        if (!cancelled) setClienteSearchLoading(false);
      }
    }, term ? 200 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [clienteSearch]);

  const loadMoreSearchResults = async () => {
    const term = searchTerm.trim();
    if (!term || !searchHasMore || searchMoreLoading) return;

    const nextPage = searchPage + 1;
    setSearchMoreLoading(true);
    setSearchError('');
    try {
      const res = await API.getProductos({ q: term, page: nextPage, limit: 20 });
      if (searchTermRef.current !== term) return;
      const results = res.data || [];
      setSearchResults(current => {
        const knownIds = new Set(current.map(product => product.id));
        return [...current, ...results.filter(product => !knownIds.has(product.id))];
      });
      setSearchPage(nextPage);
      setSearchHasMore(nextPage * 20 < Number(res.total || 0));
    } catch (err) {
      if (searchTermRef.current === term) {
        setSearchError(err.message || 'No se pudieron cargar más productos');
      }
    } finally {
      if (searchTermRef.current === term) setSearchMoreLoading(false);
    }
  };

  // ── Outbox offline ──
  const refreshPendingCount = useCallback(async () => {
    try {
      const pendientes = await obtenerPendientes();
      setPendingCount(pendientes.length);
    } catch (_) { /* IndexedDB no disponible: se oculta el indicador */ }
  }, []);

  const sincronizarAhora = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await syncOutbox();
      if (res.synced > 0) showToast(`${res.synced} venta(s) enviada(s) correctamente`, 'success');
      if (res.failed > 0) showToast(`${res.failed} venta(s) con error (requieren revisión)`, 'warning');
      await refreshPendingCount();
    } catch (e) {
      showToast('Error sincronizando: ' + e.message, 'error');
    } finally {
      setSyncing(false);
    }
  }, [refreshPendingCount]);

  const cargarHistorial = useCallback(async () => {
    try {
      setSyncHistory(await obtenerTodos());
    } catch (_) {
      setSyncHistory([]);
    }
  }, []);

  useEffect(() => {
    initOutbox().then(() => refreshPendingCount()).catch(() => {});
    const unsub = onOutboxChange(() => refreshPendingCount());
    const onOnline = () => { setIsOffline(false); sincronizarAhora(); };
    const onOffline = () => setIsOffline(true);
    const onSynced = (e) => {
      const { factura, tipoDocumento } = e.detail || {};
      if (factura) {
        setLastFactura(factura);
        setTipoUltimoDocumento(tipoDocumento || 'factura');
        setShowReceipt(true);
      }
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('outbox:synced', onSynced);
    return () => {
      unsub();
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('outbox:synced', onSynced);
    };
  }, [refreshPendingCount, sincronizarAhora]);

  // Al vaciarse el carrito (venta emitida, guardada offline o borrada) se
  // cierra la hoja de cobro para dejar libre la vista de venta.
  useEffect(() => {
    if (cart.length === 0) setShowCobro(false);
  }, [cart.length]);

  const rawTasa = parseFloat(config?.moneda?.tasaDolar);
  const tasaDolar = (isFinite(rawTasa) && rawTasa > 0) ? rawTasa : 1;
  const currencySymbol = config?.moneda?.simbolo || '$';

  // Buscador de productos por texto usando el backend
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim() || searchResultsTerm !== searchTerm.trim()) return [];
    return searchResults;
  }, [searchTerm, searchResults, searchResultsTerm]);

  const addToCart = (product) => {
    const stockActual = Number(product.stockActual);
    if (!stockActual || stockActual <= 0) {
      showToast(`El producto "${product.nombre}" no tiene stock disponible`, 'warning');
      return;
    }

    setCart(prev => {
      const exists = prev.find(item => item.productoId === product.id);
      if (exists) {
        const nuevaCantidad = exists.cantidad + 1;
        if (nuevaCantidad > stockActual) {
          showToast(`Stock insuficiente. Disponible: ${stockActual}`, 'warning');
          return prev;
        }
        return prev.map(item => item.productoId === product.id ? { ...item, cantidad: nuevaCantidad } : item);
      }
      return [...prev, {
        productoId: product.id,
        nombre: product.nombre,
        precioUnitario: parseFloat(product.esVentaPorPeso ? product.precioPorKilo : product.precioVenta),
        cantidad: 1,
        stockMax: stockActual,
        unidadMedida: product.unidadMedida || 'UNIDAD',
        esVentaPorPeso: product.esVentaPorPeso || false,
        precioPorKilo: product.precioPorKilo ? parseFloat(product.precioPorKilo) : null,
        unidadPeso: 'kg', // Por defecto kilogramos
      }];
    });
    setSearchTerm('');
  };

  // ── Escáner de cámara (hook compartido con Visor de Precios) ──────────────
  // Al detectar un código se busca el producto y se agrega al carrito.
  // En la app Android manda el escáner de Google ML Kit; la cámara interna
  // (ZXing) queda como respaldo para la web y para cuando ML Kit no está.
  const agregarPorCodigo = async (code) => {
    const texto = String(code || '').trim();
    if (!texto) return;
    try {
      const product = await API.lookupProducto(texto);
      addToCart(product);
    } catch (err) {
      // Dejar el texto leído a la vista permite corregirlo o buscar por nombre.
      setSearchTerm(texto);
      showToast(`No se encontró el producto con el código "${texto}"`, 'error');
    }
  };

  const { videoRef, cameraActive, cameraError, scanning, start: startScanner, stop: stopScanner } =
    useBarcodeScanner({
      onDetect: async (code) => {
        stopScanner();
        setShowScanner(false);
        await agregarPorCodigo(code);
      },
    });

  // En la app nativa el escáner de ML Kit ocupa la pantalla (cámara nativa
  // detrás del WebView); en la web se usa la cámara interna con ZXing.
  const abrirEscaner = () => {
    if (escanerNativoDisponible()) {
      setEscanerNativo(true);
      return;
    }
    setShowScanner(true);
    startScanner();
  };

  const cerrarEscanerNativo = () => setEscanerNativo(false);

  const codigoDelEscaner = async (texto) => {
    setEscanerNativo(false);
    await agregarPorCodigo(texto);
  };

  const respaldoCamaraInterna = (err) => {
    setEscanerNativo(false);
    console.warn('[POS] ML Kit no disponible, se usa la cámara interna:', err);
    showToast('No se pudo abrir el escáner de ML Kit; se usará la cámara interna.', 'warning');
    setShowScanner(true);
    startScanner();
  };

  const updateQuantity = (productoId, newQty) => {
    const qty = parseFloat(newQty);
    // No eliminar si es 0 o NaN, solo actualizar la cantidad
    if (isNaN(qty)) {
      return;
    }
    // Si es 0 o negativo, no hacer nada (no eliminar)
    if (qty <= 0) {
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productoId === productoId) {
        // Convertir a kg para validar stock
        const cantidadEnKg = item.unidadPeso === 'g' ? qty / 1000 : qty;
        if (cantidadEnKg > item.stockMax) {
          showToast(`Stock máximo disponible: ${item.stockMax} kg`, 'warning');
          return { ...item, cantidad: item.stockMax, unidadPeso: 'kg' };
        }
        // Para productos por peso, redondear a 3 decimales; para unidades, a enteros
        const cantidadFinal = item.esVentaPorPeso ? Math.round(qty * 1000) / 1000 : Math.round(qty);
        return { ...item, cantidad: cantidadFinal };
      }
      return item;
    }));
  };

  const cambiarUnidadPeso = (productoId, nuevaUnidad) => {
    setCart(prev => prev.map(item => {
      if (item.productoId === productoId && item.esVentaPorPeso) {
        // Convertir la cantidad a la nueva unidad
        let nuevaCantidad = item.cantidad;
        if (item.unidadPeso === 'kg' && nuevaUnidad === 'g') {
          nuevaCantidad = item.cantidad * 1000; // kg a g
        } else if (item.unidadPeso === 'g' && nuevaUnidad === 'kg') {
          nuevaCantidad = item.cantidad / 1000; // g a kg
        }
        return { ...item, unidadPeso: nuevaUnidad, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const removeFromCart = (productoId) => {
    setCart(prev => prev.filter(item => item.productoId !== productoId));
  };

  // Calcular subtotal según la unidad de peso (kg/g)
  const calcularSubtotal = (item) => {
    if (item.esVentaPorPeso) {
      // Si es venta por peso, el precio es por kg
      // Si la unidad es gramos, convertir a kg para el cálculo
      const cantidadEnKg = item.unidadPeso === 'g' ? Number(item.cantidad) / 1000 : Number(item.cantidad);
      return item.precioUnitario * cantidadEnKg;
    }
    // Productos normales (por unidad)
    return item.precioUnitario * Number(item.cantidad);
  };

  const totalUsd = useMemo(() => {
    return cart.reduce((acc, item) => acc + calcularSubtotal(item), 0);
  }, [cart]);

  const totalVes = totalUsd * tasaDolar;

  const handleEmitirFactura = async (e) => {
    e.preventDefault();
    // Guard síncrono: corta el segundo envío aunque el botón aún no se vea
    // deshabilitado. Se libera siempre en el finally.
    if (emitiendoRef.current) return;
    if (!selectedClienteId) {
      showToast('Selecciona un cliente para la factura', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    emitiendoRef.current = true;
    setLoadingEmitir(true);
    const tipoDocumentoEmitido = tipoDocumento;
    // Se reutiliza la misma clave si el usuario reintenta tras un fallo de red:
    // el backend devolverá la factura ya creada en lugar de duplicarla.
    if (!requestIdRef.current) {
      requestIdRef.current = (crypto.randomUUID?.()
        ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    }

    const esFinan = esFinanciamiento(metodoPago);
    const reqRef = requiereReferencia(metodoPago);
    if (reqRef && !referencia?.trim()) {
      emitiendoRef.current = false;
      setLoadingEmitir(false);
      showToast('La referencia de transacción es obligatoria para este método de pago', 'error');
      return;
    }

    const metodoInfo = METODOS_PAGO_POS.find(m => m.value === metodoPago);
    const monedaPagoCalculada = metodoInfo?.moneda || (metodoPago === 'EFECTIVO_VES' ? 'VES' : 'USD');

    const payload = {
      requestId: requestIdRef.current,
      clienteId: selectedClienteId,
      moneda: 'USD',
      tasaCambio: tasaDolar,
      monedaPago: monedaPagoCalculada,
      items: cart.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        unidadPeso: item.unidadPeso || 'kg', // Enviar la unidad de peso al backend
      })),
      metodoPago: metodoPago || null,
      referenciaTransaccion: reqRef ? referencia.trim() : null,
      fechaVencimiento: new Date().toISOString(),
      cuotas: esFinan ? (parseInt(cuotas) || 1) : 1,
    };

    try {
      const res = await API.emitirFactura(payload);
      showToast(
        tipoDocumentoEmitido === 'nota-entrega'
          ? 'Nota de entrega generada con éxito'
          : `🎉 ¡Factura #${res.numeroFactura || ''} emitida con éxito!`,
        'success'
      );
      setCart([]);
      setSelectedClienteId('');
      setSelectedCliente(null);
      setClienteSearch('');
      setReferencia('');
      setCuotas(1);
      setTipoDocumento('factura');

      // Mostrar el recibo
      setLastFactura(res);
      setTipoUltimoDocumento(tipoDocumentoEmitido);
      setShowReceipt(true);
      // Recargar productos para refrescar el stock actualizado
      const prodRes = await API.getProductos({ limite: 100 });
      setProductos(prodRes.data || []);
      // Venta confirmada: la próxima venta es una venta nueva, con clave nueva.
      requestIdRef.current = null;
    } catch (err) {
      // Sin conexión: guardar en el outbox para enviar después. El requestId
      // evita duplicados y el backend valida stock/saldos, así que es seguro.
      if (err.status === 0 || err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT') {
        try {
          await encolarVenta(payload, tipoDocumentoEmitido);
          showToast('Sin conexión: venta guardada. Se enviará automáticamente cuando vuelva la red.', 'warning');
          setCart([]);
          setReferencia('');
          setCuotas(1);
          setTipoDocumento('factura');
        } catch (e) {
          showToast('No se pudo guardar la venta offline: ' + e.message, 'error');
        }
      } else {
        showToast('Error al emitir factura: ' + err.message, 'error');
        // Se conserva requestId para que un reintento no duplique la venta:
        // el backend devolverá la factura ya creada si llegó a crearse.
      }
    } finally {
      emitiendoRef.current = false;
      setLoadingEmitir(false);
    }
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    setSavingCliente(true);
    try {
      const res = await API.crearCliente(newCliente);
      showToast('Cliente creado exitosamente', 'success');
      // Refrescar lista de clientes
      const clienteList = await API.getAllClientes();
      setClientes(clienteList);
      // Auto-seleccionar el nuevo cliente
      setSelectedClienteId(res.id);
      setSelectedCliente(res);
      setClienteSearch('');
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
        title="Nueva Factura (POS)"
        subtitle="Venta rápida multitasa en dólares y bolívares"
        toggleSidebar={toggleSidebar}
      />

      {/* ── Bloqueo: sin turno activo ── */}
      {cajaLoading ? (
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Verificando estado de caja...</div>
        </div>
      ) : cajaStatus !== 'OPEN' ? (
        <div className="page-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div
            className="card"
            style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '40px 32px 32px' }}
          >
            {/* Emblema */}
            <div
              style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'var(--warning-dim)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon icon={lockOpenIcon} style={{ fontSize: '2.1rem', color: 'var(--warning)' }} />
            </div>

            <h2
              style={{
                marginBottom: '6px',
                color: 'var(--text-primary)',
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Turno no iniciado
            </h2>

            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.65',
                maxWidth: '400px',
                margin: '0 auto 24px',
              }}
            >
              Para facturar necesitas un turno de caja abierto. Así cada pago queda asociado
              a un turno y el cierre cuadra al final del día.
            </p>

            {/* Pasos */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                textAlign: 'left',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                1
              </span>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Ve a <strong style={{ color: 'var(--text-primary)' }}>Cierre de Caja</strong> y registra el
                monto inicial con el que arrancas.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <Button
                variant="primary"
                size="lg"
                icon="mdi:cash-register"
                iconRight="mdi:arrow-right"
                onClick={() => navigate('/caja')}
                className="w-full"
              >
                Ir a Cierre de Caja
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon="mdi:refresh"
                onClick={reintentarCaja}
                disabled={cajaLoading}
              >
                Ya abrí la caja, reintentar
              </Button>
            </div>
          </div>
        </div>
      ) : (
      <div className="page-body pos-body">
        {/* Indicador de outbox offline */}
        {(pendingCount > 0 || isOffline) && (
          <div
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '16px', flexWrap: 'wrap' }}
          >
            <Icon
              icon="mdi:cloud-sync"
              className="h-5 w-5"
              style={{ color: isOffline ? 'var(--warning)' : 'var(--accent)', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {isOffline ? 'Sin conexión' : `${pendingCount} venta(s) por sincronizar`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {isOffline
                  ? 'Las ventas se guardan en el dispositivo y se envían automáticamente.'
                  : 'Se enviarán automáticamente. También puedes forzar el envío.'}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              icon="mdi:history"
              onClick={async () => { await cargarHistorial(); setShowSyncModal(true); }}
            >
              Historial
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon="mdi:cloud-upload"
              onClick={sincronizarAhora}
              disabled={syncing || isOffline}
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* Panel Izquierdo: Selección de Cliente y Buscador de Productos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Buscador de Clientes */}
            <div className="card">
              <div className="form-group" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Buscar Cliente</label>
                  <Button variant="ghost" size="sm" icon="mdi:account-plus" onClick={() => setShowClienteModal(true)}>
                    Nuevo Cliente
                  </Button>
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escribe nombre, RIF o haz clic para ver la lista..."
                  value={clienteSearch}
                  onChange={e => {
                    setClienteSearch(e.target.value);
                    setShowClienteDropdown(true);
                  }}
                  onFocus={() => setShowClienteDropdown(true)}
                  onBlur={() => setTimeout(() => setShowClienteDropdown(false), 250)}
                  autoComplete="off"
                />
                {clienteSearchLoading && (
                  <div className="small text-muted mt-2">Cargando clientes...</div>
                )}
                {showClienteDropdown && !clienteSearchLoading && clienteSearchResults.length === 0 && (
                  <div className="small text-muted mt-2">No se encontraron clientes coincidentes.</div>
                )}
                {showClienteDropdown && clienteSearchResults.length > 0 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    zIndex: 20,
                    marginTop: '4px',
                    maxHeight: '260px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <div style={{ padding: '6px 12px', fontSize: '0.72rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                      {clienteSearch.trim() ? `Coincidencias (${clienteSearchResults.length})` : `Clientes disponibles (${clienteSearchResults.length})`}
                    </div>
                    {clienteSearchResults.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedClienteId(c.id);
                          setSelectedCliente(c);
                          setClienteSearch('');
                          setShowClienteDropdown(false);
                        }}
                        style={{ 
                          width: '100%', 
                          padding: '10px 12px', 
                          textAlign: 'left', 
                          borderBottom: '1px solid var(--border)',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                        className="nav-item hover:bg-[var(--surface3)]"
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.razonSocial}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Doc: {c.rifCedula} {c.telefono ? `· Tel: ${c.telefono}` : ''}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCliente && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px 12px', 
                    background: 'rgba(59, 130, 246, 0.08)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        ✓ {selectedCliente.razonSocial}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Documento: <strong>{selectedCliente.rifCedula}</strong>
                        {selectedCliente.telefono && ` · Tel: ${selectedCliente.telefono}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedClienteId(''); setSelectedCliente(null); }}
                      className="btn btn-ghost btn-xs text-danger"
                      title="Quitar cliente seleccionado"
                      style={{ padding: '4px 6px' }}
                    >
                      <Icon icon="mdi:close" className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buscador de Productos */}
            <div className="card">
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Buscar Producto (Código o Nombre)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escribe el nombre o escanea código de barras..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                />
                {searchLoading && searchTerm.trim() && (
                  <div className="small text-muted mt-2">Buscando productos...</div>
                )}
                {searchError && (
                  <div className="small mt-2" role="alert" style={{ color: 'var(--danger)' }}>{searchError}</div>
                )}
                {searchTerm.trim() && !searchLoading && !searchError && filteredProducts.length === 0 && (
                  <div className="small text-muted mt-2">No se encontraron productos.</div>
                )}
              </div>

              <Button
                variant="secondary"
                icon="mdi:barcode-scan"
                onClick={abrirEscaner}
                className="w-full"
                style={{ marginTop: '10px' }}
              >
                Escanear con cámara
              </Button>

              {filteredProducts.length > 0 && (
                <div style={{ marginTop: '12px', maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                      className="nav-item hover:bg-[var(--surface3)]"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.imagenUrl ? (
                          <img src={p.imagenUrl} alt={p.nombre} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Icon icon="mdi:package-variant" className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Stock: {p.stockActual}</span>
                            {p.esVentaPorPeso && (
                              <span style={{ 
                                background: 'rgba(16, 185, 129, 0.15)', 
                                color: 'var(--success)', 
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600
                              }}>
                                <Icon icon={scaleIcon} style={{ fontSize: '0.85em', verticalAlign: 'middle', marginRight: '2px' }} />
                                Por peso
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            SKU: {p.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', minWidth: '140px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
                            {Utils.formatMoney(p.esVentaPorPeso ? p.precioPorKilo : p.precioVenta, '$')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {Utils.formatMoney(Number((Number(p.esVentaPorPeso ? p.precioPorKilo : p.precioVenta || 0) * tasaDolar).toFixed(2)), 'Bs.')}
                        </div>
                        {p.esVentaPorPeso && p.precioPorKilo && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            ${Number(p.precioPorKilo || 0).toFixed(2)}/kg
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {filteredProducts.length > 0 && searchHasMore && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '8px' }}
                  onClick={loadMoreSearchResults}
                  disabled={searchMoreLoading}
                >
                  {searchMoreLoading ? 'Cargando...' : 'Cargar más resultados'}
                </button>
              )}
            </div>

            {/* Tabla del Carrito */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Detalle de la Venta ({cart.length} ítems)</h3>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                    Vaciar Carrito
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
                        <td colSpan={5} className="empty-state">No hay productos agregados al carrito</td>
                      </tr>
                    ) : (
                      cart.map(item => (
                        <tr key={item.productoId}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.nombre}</div>
                            {item.esVentaPorPeso && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Icon icon={scaleIcon} style={{ fontSize: '0.9em' }} />
                                Venta por peso
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{Utils.formatMoney(item.precioUnitario, '$')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              {Utils.formatMoney(item.precioUnitario * tasaDolar, 'Bs.')}
                            </div>
                            {item.esVentaPorPeso && (
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                por kg
                              </div>
                            )}
                          </td>
                          <td>
                            {item.esVentaPorPeso ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <input
                                    type="number"
                                    step={item.unidadPeso === 'g' ? '1' : '0.001'}
                                    className="form-control"
                                    style={{ width: '80px', padding: '4px 8px' }}
                                    value={item.cantidad}
                                    min={item.unidadPeso === 'g' ? '1' : '0.001'}
                                    max={item.unidadPeso === 'g' ? item.stockMax * 1000 : item.stockMax}
                                    onChange={e => updateQuantity(item.productoId, e.target.value)}
                                  />
                                  <select
                                    value={item.unidadPeso || 'kg'}
                                    onChange={e => cambiarUnidadPeso(item.productoId, e.target.value)}
                                    style={{ 
                                      padding: '4px 8px', 
                                      borderRadius: '4px', 
                                      border: '1px solid var(--border)',
                                      fontSize: '0.75rem',
                                      background: 'var(--bg-secondary)'
                                    }}
                                  >
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                  </select>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                  = {(item.unidadPeso === 'g' ? Number(item.cantidad) / 1000 : Number(item.cantidad)).toFixed(3)} kg
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="number"
                                  step="1"
                                  className="form-control"
                                  style={{ width: '70px', padding: '4px 8px' }}
                                  value={item.cantidad}
                                  min={1}
                                  max={item.stockMax}
                                  onChange={e => updateQuantity(item.productoId, e.target.value)}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {item.unidadMedida === 'UNIDAD' ? 'ud' : item.unidadMedida.toLowerCase()}
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                            <div>{Utils.formatMoney(calcularSubtotal(item), '$')}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              {Utils.formatMoney(calcularSubtotal(item) * tasaDolar, 'Bs.')}
                            </div>
                          </td>
                          <td>
                            <button
                              onClick={() => removeFromCart(item.productoId)}
                              className="btn btn-ghost btn-sm inline-flex items-center justify-center"
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

          {/* Panel Derecho: Resumen Financiero y Pago.
              En escritorio es la columna lateral (sticky); en móvil el CSS lo
              convierte en una hoja inferior que abre el botón "Cobrar". */}
          {!isDesktop && showCobro && (
            <div className="pos-cobro-backdrop" onClick={() => setShowCobro(false)} aria-hidden="true" />
          )}
          <div className={`card pos-cobro-panel${showCobro ? ' open' : ''}`}>
            <span className="pos-cobro-grip" aria-hidden="true" />
            <button
              type="button"
              className="pos-cobro-close"
              onClick={() => setShowCobro(false)}
              aria-label="Cerrar resumen de cobro"
            >
              <Icon icon={closeIcon} className="h-4 w-4" />
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Resumen de Cobro</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => setMonedaVisualizacion('USD')}
                  className={`btn btn-sm ${monedaVisualizacion === 'USD' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  $
                </button>
                <button 
                  onClick={() => setMonedaVisualizacion('VES')}
                  className={`btn btn-sm ${monedaVisualizacion === 'VES' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Bs.
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border)' }}>
              {monedaVisualizacion === 'USD' ? (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total a Pagar (USD)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {Utils.formatMoney(totalUsd, '$')}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasa: {tasaDolar.toFixed(2)}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
                      {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total a Pagar (VES)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                    {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasa: {tasaDolar.toFixed(2)}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {Utils.formatMoney(totalUsd, '$')}
                    </span>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleEmitirFactura} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tipo-documento-venta">Documento para el cliente</label>
                <select
                  id="tipo-documento-venta"
                  className="form-control"
                  value={tipoDocumento}
                  onChange={e => setTipoDocumento(e.target.value)}
                >
                  <option value="factura">Factura</option>
                  <option value="nota-entrega">Nota de entrega</option>
                </select>
                {tipoDocumento === 'nota-entrega' && (
                  <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-secondary)' }}>
                    La venta y el pago se guardarán; el comprobante impreso no será una factura fiscal.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Método de Pago</label>
                <select
                  className="form-control"
                  value={metodoPago}
                  onChange={e => {
                    const val = e.target.value;
                    setMetodoPago(val);
                    if (!esFinanciamiento(val)) setCuotas(1);
                  }}
                >
                  {METODOS_PAGO_POS.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {esFinanciamiento(metodoPago) && (
                <div className="form-group">
                  <label className="form-label">Número de Cuotas</label>
                  <select
                    className="form-control"
                    value={cuotas}
                    onChange={e => setCuotas(e.target.value)}
                  >
                    <option value={1}>1 (Pago Pendiente Único)</option>
                    <option value={2}>2 Cuotas</option>
                    <option value={3}>3 Cuotas</option>
                    <option value={4}>4 Cuotas</option>
                  </select>
                </div>
              )}

              {requiereReferencia(metodoPago) && (
                <div className="form-group">
                  <label className="form-label">Número de Referencia</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 987654 / Nro. Operación / Lote"
                    value={referencia}
                    onChange={e => setReferencia(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loadingEmitir || cart.length === 0}
                style={{ marginTop: '10px' }}
              >
                {loadingEmitir ? 'Procesando Venta...' : <><Icon icon={flashIcon} className="h-4 w-4" /> Completar Venta</>}
              </button>
            </form>
          </div>
        </div>

        {/* Barra de cobro móvil: total y acción principal al alcance del pulgar */}
        {!isDesktop && cart.length > 0 && (
          <div className="pos-mobile-bar">
            <div className="pos-mobile-bar-total">
              <strong>{Utils.formatMoney(totalUsd, '$')}</strong>
              <span>
                {cart.length} ítem(s) · {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.
              </span>
            </div>
            <Button
              variant="primary"
              icon="mdi:cart-check"
              onClick={() => setShowCobro(true)}
              className="ml-auto"
            >
              Cobrar
            </Button>
          </div>
        )}
      </div>
      )} {/* end caja ternary */}

      {/* Modal Nuevo Cliente */}
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
                <div className="form-group">
                  <label className="form-label">Dirección Fiscal / Entrega</label>
                  <input className="form-control" value={newCliente.direccion}
                    onChange={e => setNewCliente(f => ({ ...f, direccion: e.target.value }))} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" value={newCliente.telefono}
                      onChange={e => setNewCliente(f => ({ ...f, telefono: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input type="email" className="form-control" value={newCliente.correo}
                      onChange={e => setNewCliente(f => ({ ...f, correo: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="ghost" onClick={() => setShowClienteModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={savingCliente}>Crear Cliente</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recibo (Factura) */}
      {showReceipt && (
        <ReceiptModal
          factura={lastFactura}
          config={config}
          onClose={() => setShowReceipt(false)}
          type={tipoUltimoDocumento}
        />
      )}

      {/* Escáner de código de barras (cámara) */}
      <EscanerMLKit
        activo={escanerNativo}
        titulo="Escanear producto"
        onCodigo={codigoDelEscaner}
        onCerrar={cerrarEscanerNativo}
        onError={respaldoCamaraInterna}
      />

      {showScanner && (
        <div className="modal-overlay open" onClick={() => { stopScanner(); setShowScanner(false); }}>
          <div className="modal" style={{ maxWidth: 480, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Escanear código</h3>
              <Button variant="ghost" size="icon" onClick={() => { stopScanner(); setShowScanner(false); }} icon="mdi:close" />
            </div>
            <div className="modal-body">
              {cameraError ? (
                <div
                  role="alert"
                  style={{
                    padding: '12px 14px',
                    background: 'var(--danger-dim)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--danger)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {cameraError}
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#0f172a', border: '2px solid var(--accent)' }}>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
                    />
                    {/* Retícula de enfoque */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <div style={{ width: 200, height: 100, border: '2px solid var(--success)', borderRadius: 8, position: 'relative', boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'var(--danger)', boxShadow: '0 0 6px var(--danger)' }} />
                      </div>
                    </div>
                    {scanning && (
                      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 11, padding: '3px 12px', borderRadius: 99 }}>
                        Apunte al código de barras...
                      </div>
                    )}
                  </div>
                  {cameraActive && (
                    <Button variant="secondary" className="w-full" style={{ marginTop: '12px' }} onClick={() => { stopScanner(); setShowScanner(false); }}>
                      Cerrar escáner
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historial de sincronización (outbox) */}
      {showSyncModal && (
        <div className="modal-overlay open" onClick={() => setShowSyncModal(false)}>
          <div className="modal modal-lg" style={{ maxWidth: '640px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Sincronización de ventas</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSyncModal(false)} icon="mdi:close" />
            </div>
            <div className="modal-body">
              {syncHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🧾</div>
                  <p>No hay ventas registradas en el dispositivo.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {syncHistory.map(v => (
                    <div
                      key={v.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {v.tipoDocumento === 'nota-entrega' ? 'Nota de entrega' : 'Factura'} · {v.payload?.items?.length ?? 0} ítem(s)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(v.createdAt).toLocaleString('es-VE')}
                          {v.facturaId ? ` · Factura #${v.facturaId}` : ''}
                        </div>
                        {v.error && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '2px' }}>{v.error}</div>
                        )}
                      </div>
                      <span
                        className={`badge ${
                          v.estado === 'SYNCED' ? 'badge-success'
                          : v.estado === 'FAILED' ? 'badge-danger'
                          : v.estado === 'SYNCING' ? 'badge-info'
                          : 'badge-warning'
                        }`}
                        style={{ flexShrink: 0 }}
                      >
                        {v.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setShowSyncModal(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
