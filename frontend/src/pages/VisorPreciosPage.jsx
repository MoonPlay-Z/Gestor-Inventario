import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { API, Utils } from '../services/api';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { escanerNativoDisponible } from '../utils/lectorCodigos';
import { EscanerMLKit } from '../components/scanner/EscanerMLKit';
import '../css/visor.css';

const playSound = (type = 'success') => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    }
  } catch (_) {}
};

export function VisorPreciosPage() {
  const navigate = useNavigate();
  const [query, setQuery]           = useState('');
  const [producto, setProducto]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [countdown, setCountdown]   = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [escanerNativo, setEscanerNativo] = useState(false);
  const inputRef      = useRef(null);
  const bufferRef     = useRef('');
  const lastKeyRef    = useRef(0);
  const timerRef      = useRef(null);

  // ── Escáner de cámara (hook compartido con POS) ──────────────────────────────
  // Debe declararse antes de los efectos que leen `cameraActive`: las dependencias
  // de un `useEffect` se evalúan durante el render y, si este hook fuera después,
  // `cameraActive` caería en zona muerta temporal (ReferenceError y pantalla en
  // blanco). `onDetect` usa `buscarProducto`, definido más abajo; la referencia es
  // diferida (solo se invoca al leer un código), por lo que no hay TDZ.
  const { videoRef, cameraActive, cameraError, scanning, start: iniciarCamara, stop: detenerCamara } =
    useBarcodeScanner({ onDetect: (code) => buscarProducto(code) });

  // ── Detección de móvil
  useEffect(() => {
    const check = () => {
      const ua = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const small = window.innerWidth <= 900;
      setIsMobile(ua || (touch && small));
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Reloj
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Foco en input (PC) — solo en reposo y sin teclado en móvil: si hay un
  // producto en pantalla el teclado taparía el precio que el cliente lee.
  useEffect(() => {
    if (isMobile || cameraActive || producto || error || loading) return undefined;
    const t = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 2500);
    return () => clearInterval(t);
  }, [isMobile, cameraActive, producto, error, loading]);

  // ── Escáner HID/USB (PC)
  useEffect(() => {
    const handle = (e) => {
      if (cameraActive) return;
      const now = Date.now();
      if (now - lastKeyRef.current > 200) bufferRef.current = '';
      lastKeyRef.current = now;
      if (e.key === 'Enter') {
        const code = bufferRef.current.trim();
        bufferRef.current = '';
        if (code.length > 0) { setQuery(code); buscarProducto(code); }
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [cameraActive]);

  // ── Auto-reset 8s
  useEffect(() => {
    if (!producto && !error) return;
    setCountdown(8);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); resetVisor(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [producto, error]);

  // ── Buscar producto
  const buscarProducto = useCallback(async (code) => {
    const term = (code || query).trim();
    if (!term) return;
    setLoading(true); setError(null); setProducto(null);
    try {
      const data = await API.lookupProducto(term);
      setProducto(data);
      playSound('success');
      detenerCamara();
      // Cierra el teclado del móvil para que el precio quede visible.
      inputRef.current?.blur();
    } catch (err) {
      setError(err.message || 'Producto no encontrado');
      playSound('error');
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ── Abrir escáner: ML Kit (app Android) con la cámara interna como respaldo
  const abrirEscaner = useCallback(() => {
    if (!escanerNativoDisponible()) { iniciarCamara(); return; }
    setEscanerNativo(true);
  }, [iniciarCamara]);

  const codigoDelEscaner = useCallback(async (texto) => {
    setEscanerNativo(false);
    setQuery(texto);
    await buscarProducto(texto);
  }, [buscarProducto]);

  const respaldoCamaraInterna = useCallback((err) => {
    setEscanerNativo(false);
    console.warn('[Visor] ML Kit no disponible, se usa la cámara interna:', err);
    iniciarCamara();
  }, [iniciarCamara]);

  const resetVisor = useCallback(() => {
    setProducto(null); setError(null); setQuery(''); setCountdown(0);
    bufferRef.current = '';
    if (isMobile) abrirEscaner();
    else if (inputRef.current) inputRef.current.focus();
  }, [isMobile, abrirEscaner]);

  // Fullscreen simulado por CSS — funciona en todos los navegadores incluyendo iOS Safari
  const pageRef = useRef(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Intentar API nativa primero (Android Chrome, Firefox)
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
      if (req) {
        req.call(el)
          .then(() => setIsFullscreen(true))
          .catch(() => setIsFullscreen(true)); // aunque falle el API, aplicar CSS
      } else {
        // iOS Safari y otros sin soporte: usar CSS fullscreen
        setIsFullscreen(true);
      }
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
      // Intentar orientación landscape en kiosco
      try { screen.orientation.lock('landscape').catch(() => {}); } catch (_) {}
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
      if (exit) {
        try { exit.call(document).catch(() => {}); } catch (_) {}
      }
      setIsFullscreen(false);
      document.body.style.overflow = '';
      try { screen.orientation.unlock(); } catch (_) {}
    }
  };

  // Escuchar salida de fullscreen nativa (tecla ESC)
  useEffect(() => {
    const onFsChange = () => {
      const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isNativeFs && isFullscreen) {
        setIsFullscreen(false);
        document.body.style.overflow = '';
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [isFullscreen]);

  // Al salir del visor se libera el scroll y la orientación que fijó el kiosco.
  useEffect(() => () => {
    document.body.style.overflow = '';
    try { screen.orientation.unlock(); } catch (_) {}
  }, []);

  const volverAlPanel = () => {
    detenerCamara();
    setEscanerNativo(false);
    document.body.style.overflow = '';
    try { screen.orientation.unlock(); } catch (_) {}
    navigate('/dashboard');
  };

  return (
    <div
      ref={pageRef}
      className={`visor-root${isFullscreen ? ' visor-root--full' : ''}`}
    >
      {/* HEADER */}
      <header className="visor-head">
        <div className="visor-brand">
          <button
            type="button"
            className="visor-icon-btn visor-back"
            onClick={volverAlPanel}
            aria-label="Volver al panel de control"
            title="Volver al panel de control"
          >
            <Icon icon="mdi:arrow-left" />
          </button>
          <div className="visor-logo">
            <Icon icon="mdi:barcode-scan" />
          </div>
          <div className="visor-brand-txt">
            <div className="visor-title-row">
              <h1 className="visor-title">VISOR DE PRECIOS</h1>
              {isMobile && <span className="visor-tag">MÓVIL</span>}
            </div>
            <p className="visor-sub">GestorPOS · Consulta Instantánea</p>
          </div>
        </div>

        <div className="visor-head-right">
          <div className="visor-clock">
            <div className="visor-clock-time">{currentTime.toLocaleTimeString('es-VE')}</div>
            <div className="visor-clock-date">
              {currentTime.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="visor-icon-btn"
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            <Icon icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} />
          </button>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA */}
      <form
        className="visor-search"
        onSubmit={e => { e.preventDefault(); buscarProducto(query); }}
      >
        <div className="visor-search-box">
          <Icon icon="mdi:magnify" className="visor-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isMobile ? 'Escanee con cámara o ingrese SKU...' : 'Escanee código o escriba SKU...'}
            className="visor-input"
          />
          <button type="submit" disabled={loading} className="visor-search-btn">
            {loading
              ? <Icon icon="mdi:loading" className="visor-spin" />
              : 'Buscar'}
          </button>
        </div>
      </form>

      {/* CONTENIDO PRINCIPAL */}
      <main className="visor-main">

        {/* STANDBY / CÁMARA */}
        {!producto && !error && !loading && (
          <div className="visor-card visor-standby">
            {cameraActive ? (
              <div>
                <div className="visor-cam">
                  <video ref={videoRef} playsInline muted autoPlay className="visor-video" />
                  <div className="visor-reticle-wrap">
                    <div className="visor-reticle">
                      <span className="visor-reticle-line" />
                    </div>
                  </div>
                  {scanning && <div className="visor-scan-hint">Apunte al código de barras o QR…</div>}
                </div>
                <button type="button" onClick={detenerCamara} className="visor-btn visor-btn--muted">
                  <Icon icon="mdi:close" /> Cerrar cámara
                </button>
              </div>
            ) : (
              <div>
                <div className="visor-standby-icon-wrap">
                  <div className="visor-standby-glow" />
                  <div className="visor-standby-icon">
                    <Icon icon="mdi:barcode-scan" />
                  </div>
                </div>
                <h2 className="visor-h2">
                  {isMobile ? 'Escáner Móvil' : 'Pase el código por el lector'}
                </h2>
                <p className="visor-muted visor-standby-help">
                  {isMobile
                    ? 'Presione el botón para abrir la cámara y escanear el código de barras del producto.'
                    : 'Acerque el código de barras o QR al lector físico USB.'}
                </p>
                <button type="button" onClick={abrirEscaner} className="visor-btn visor-btn--primary">
                  <Icon icon="mdi:camera" /> Abrir escáner de cámara
                </button>
                <p className="visor-fine">
                  {escanerNativoDisponible() ? '📷 Google ML Kit · lectura automática' : '⌨️ Lector USB escuchando'}
                </p>
              </div>
            )}

            {cameraError && (
              <div className="visor-camera-error" role="alert">{cameraError}</div>
            )}
          </div>
        )}

        {/* CARGANDO */}
        {loading && (
          <div className="visor-card visor-loading">
            <Icon icon="mdi:loading" className="visor-spin visor-loading-icon" />
            <p>Consultando producto…</p>
          </div>
        )}

        {/* PRODUCTO ENCONTRADO */}
        {producto && !loading && (
          <div className="visor-card visor-product-card">
            <div className="visor-countdown">
              <div style={{ width: `${(countdown / 8) * 100}%` }} />
            </div>

            <div className="visor-product">
              {/* Imagen */}
              <div className="visor-figure-wrap">
                <div className="visor-figure">
                  {producto.imagenUrl
                    ? <img src={producto.imagenUrl} alt={producto.nombre} className="visor-img" />
                    : <Icon icon="mdi:package-variant" className="visor-img-ph" />}
                  <span className="visor-cat">{producto.categoria}</span>
                </div>
              </div>

              {/* Detalles */}
              <div className="visor-details">
                <div className="visor-sku">
                  <Icon icon="mdi:barcode" /> SKU: {producto.sku}
                </div>
                <h2 className="visor-name">{producto.nombre}</h2>
                {producto.descripcion && <p className="visor-desc">{producto.descripcion}</p>}

                {/* Precios */}
                <div className="visor-price-box">
                  <div className="visor-price-label">Precio en Dólares ($)</div>
                  <div className="visor-usd">{Utils.formatMoney(producto.precioUsd, '$')}</div>
                  <div className="visor-price-sep">
                    <div className="visor-ves-row">
                      <span>Precio en Bolívares (Bs.)</span>
                      <span>Tasa BCV: {producto.tasaBcv?.toFixed(2)}</span>
                    </div>
                    <div className="visor-ves">{Utils.formatMoney(producto.precioVes, 'Bs.')}</div>
                  </div>
                </div>

                {/* Stock + botón */}
                <div className="visor-actions">
                  {producto.stockActual > 0
                    ? <span className="visor-stock visor-stock--in">● DISPONIBLE ({producto.stockActual})</span>
                    : <span className="visor-stock visor-stock--out">AGOTADO</span>}
                  <button type="button" onClick={resetVisor} className="visor-btn visor-btn--primary visor-btn--sm">
                    <Icon icon="mdi:barcode-scan" /> Escanear otro ({countdown}s)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTO NO ENCONTRADO */}
        {error && !loading && (
          <div className="visor-card visor-notfound">
            <div className="visor-error-icon">
              <Icon icon="mdi:alert-circle-outline" />
            </div>
            <h3 className="visor-h2">Producto No Encontrado</h3>
            <p className="visor-muted">
              No se encontró ningún producto con el código <strong className="visor-code">{query}</strong>
            </p>
            <button type="button" onClick={resetVisor} className="visor-btn visor-btn--danger">
              <Icon icon="mdi:reload" /> Reintentar ({countdown}s)
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="visor-foot">
        <button type="button" className="visor-foot-back" onClick={volverAlPanel}>
          <Icon icon="mdi:view-dashboard-outline" /> Panel de control
        </button>
        <span className="visor-foot-mode">
          Modo: <strong>{isMobile ? 'Cámara móvil' : 'Lector USB'}</strong>
        </span>
      </footer>

      <EscanerMLKit
        activo={escanerNativo}
        titulo="Consultar precio"
        onCodigo={codigoDelEscaner}
        onCerrar={() => setEscanerNativo(false)}
        onError={respaldoCamaraInterna}
      />
    </div>
  );
}

export default VisorPreciosPage;
