import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { API, Utils } from '../services/api';
import { BrowserMultiFormatReader } from '@zxing/library';

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
  const [query, setQuery]           = useState('');
  const [producto, setProducto]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [countdown, setCountdown]   = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning]     = useState(false);

  const inputRef      = useRef(null);
  const videoRef      = useRef(null);
  const readerRef     = useRef(null);
  const bufferRef     = useRef('');
  const lastKeyRef    = useRef(0);
  const timerRef      = useRef(null);
  const scanningRef   = useRef(false);

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

  // ── Foco en input (PC)
  useEffect(() => {
    if (cameraActive) return;
    const t = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 2500);
    return () => clearInterval(t);
  }, [cameraActive]);

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
    } catch (err) {
      setError(err.message || 'Producto no encontrado');
      playSound('error');
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ── Iniciar cámara con ZXing (funciona en Chrome, Firefox, Safari)
  const iniciarCamara = useCallback(async () => {
    setCameraError(null);
    setScanning(false);
    scanningRef.current = false;

    // Verificar contexto seguro
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')
          ? '⚠️ La cámara requiere HTTPS. Accede usando https:// en lugar de http://'
          : 'Tu navegador no soporta acceso a la cámara. Usa Chrome o Firefox actualizado.'
      );
      return;
    }

    try {
      // Detener lector anterior si existe
      if (readerRef.current) {
        try { readerRef.current.reset(); } catch (_) {}
        readerRef.current = null;
      }

      setCameraActive(true);

      // Pequeña espera para que el video DOM esté montado
      await new Promise(r => setTimeout(r, 200));

      if (!videoRef.current) {
        setCameraError('Error interno: el elemento de video no está listo.');
        setCameraActive(false);
        return;
      }

      // Crear instancia de ZXing
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // listVideoInputDevices es método de INSTANCIA, no estático
      let deviceId;
      try {
        const devices = await reader.listVideoInputDevices();
        // Preferir cámara trasera (back/rear/environment)
        const back = devices.find(d =>
          /back|rear|environment|trasera|posterior/i.test(d.label)
        ) || devices[devices.length - 1] || devices[0];
        deviceId = back?.deviceId || null;
      } catch (_) {
        // Si no puede listar, usar constraints de cámara trasera directamente
        deviceId = null;
      }

      setScanning(true);
      scanningRef.current = true;

      if (deviceId) {
        await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (!scanningRef.current) return;
          if (result) {
            const code = result.getText();
            if (code) {
              scanningRef.current = false;
              setScanning(false);
              setQuery(code);
              buscarProducto(code);
            }
          }
        });
      } else {
        // Fallback: usar constraints de facingMode environment (cámara trasera)
        await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result, err) => {
            if (!scanningRef.current) return;
            if (result) {
              const code = result.getText();
              if (code) {
                scanningRef.current = false;
                setScanning(false);
                setQuery(code);
                buscarProducto(code);
              }
            }
          }
        );
      }

    } catch (err) {
      console.error('Error abriendo cámara:', err);
      scanningRef.current = false;
      setScanning(false);
      setCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('❌ Permiso de cámara denegado. Ve a Ajustes → Permisos → Cámara y permite el acceso.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('❌ No se encontró ninguna cámara en este dispositivo.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('❌ La cámara está siendo usada por otra app. Ciérrala e intenta de nuevo.');
      } else if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
        setCameraError('⚠️ La cámara requiere HTTPS. Accede con https:// en el navegador.');
      } else {
        setCameraError('❌ No se pudo abrir la cámara: ' + (err.message || err.name));
      }
    }
  }, [buscarProducto]);

  const detenerCamara = useCallback(() => {
    scanningRef.current = false;
    setScanning(false);
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch (_) {}
      readerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const resetVisor = useCallback(() => {
    setProducto(null); setError(null); setQuery(''); setCountdown(0);
    bufferRef.current = '';
    if (isMobile) iniciarCamara();
    else if (inputRef.current) inputRef.current.focus();
  }, [isMobile, iniciarCamara]);

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

  // ── Cleanup al desmontar
  useEffect(() => () => detenerCamara(), []);

  return (
    <div
      ref={pageRef}
      style={{
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        background: '#f8fafc',
        // CSS fullscreen: cubre toda la pantalla cuando está activo
        ...(isFullscreen ? {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          overflowY: 'auto',
          padding: '8px',
        } : {
          minHeight: '100vh',
          position: 'relative',
          padding: isMobile ? '12px' : '24px',
        })
      }}
    >

      {/* HEADER */}
      <header style={{ background: 'linear-gradient(135deg, #0b4f9c 0%, #022a5e 100%)', borderRadius: 16, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', marginBottom: 12, boxShadow: '0 4px 20px #0b4f9c40' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: 10 }}>
            <Icon icon="mdi:barcode-scan" style={{ fontSize: 28 }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>VISOR DE PRECIOS</h1>
              {isMobile && <span style={{ background: '#34d399', color: '#0f172a', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>📱 MÓVIL</span>}
            </div>
            <p style={{ fontSize: 11, color: '#93c5fd', margin: 0 }}>GestorPOS · Consulta Instantánea</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700 }}>{currentTime.toLocaleTimeString('es-VE')}</div>
            <div style={{ fontSize: 10, color: '#93c5fd' }}>{currentTime.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          </div>
          <button onClick={toggleFullscreen} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 10, padding: 10, color: '#fff', cursor: 'pointer' }}>
            <Icon icon={isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'} style={{ fontSize: 20 }} />
          </button>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA */}
      <form onSubmit={e => { e.preventDefault(); buscarProducto(query); }} style={{ maxWidth: 640, margin: '0 auto 12px', width: '100%' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Icon icon="mdi:magnify" style={{ position: 'absolute', left: 14, fontSize: 20, color: '#2563eb', pointerEvents: 'none' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isMobile ? 'Escanee con cámara o ingrese SKU...' : 'Escanee código o escriba SKU...'}
            style={{ width: '100%', paddingLeft: 44, paddingRight: 90, paddingTop: 12, paddingBottom: 12, border: '2px solid #e2e8f0', borderRadius: 12, fontSize: 15, outline: 'none', boxShadow: '0 2px 8px #0001', background: '#fff', boxSizing: 'border-box' }}
          />
          <button type="submit" disabled={loading} style={{ position: 'absolute', right: 6, padding: '6px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            {loading ? <Icon icon="mdi:loading" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }} /> : 'Buscar'}
          </button>
        </div>
      </form>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* STANDBY / CÁMARA */}
        {!producto && !error && !loading && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, maxWidth: 480, width: '100%', boxShadow: '0 8px 40px #0b4f9c15', textAlign: 'center' }}>

            {/* Cámara activa */}
            {cameraActive ? (
              <div>
                <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0f172a', border: '2px solid #2563eb', marginBottom: 16 }}>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
                  />
                  {/* Retícula */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ width: 200, height: 100, border: '2px solid #34d399', borderRadius: 8, position: 'relative', boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'scan 1.5s ease-in-out infinite alternate' }} />
                    </div>
                  </div>
                  {scanning && (
                    <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 11, padding: '3px 12px', borderRadius: 99 }}>
                      Apunte al código de barras o QR...
                    </div>
                  )}
                </div>
                <button onClick={detenerCamara} style={{ padding: '10px 28px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  <Icon icon="mdi:close" style={{ marginRight: 4, verticalAlign: 'middle' }} /> Cerrar Cámara
                </button>
              </div>
            ) : (
              /* Pantalla de reposo */
              <div>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                  <div style={{ position: 'absolute', inset: 0, background: '#2563eb30', borderRadius: '50%', filter: 'blur(20px)' }} />
                  <div style={{ position: 'relative', padding: 24, background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '50%' }}>
                    <Icon icon="mdi:barcode-scan" style={{ fontSize: 56, color: '#2563eb' }} />
                  </div>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 6px', color: '#0f172a' }}>
                  {isMobile ? 'Escáner Móvil' : 'Pase el código por el lector'}
                </h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
                  {isMobile
                    ? 'Presione el botón para abrir la cámara y escanear el código de barras del producto.'
                    : 'Acerque el código de barras o QR al lector físico USB.'}
                </p>
                <button
                  onClick={iniciarCamara}
                  style={{ width: '100%', maxWidth: 300, padding: '14px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', boxShadow: '0 4px 14px #2563eb50' }}
                >
                  <Icon icon="mdi:camera" style={{ fontSize: 22 }} />
                  Abrir Escáner de Cámara
                </button>
                <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 10 }}>
                  {isMobile ? '📱 Dispositivo móvil detectado' : '⌨️ Lector USB escuchando'}
                </p>
              </div>
            )}

            {/* Error de cámara */}
            {cameraError && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, color: '#be123c', fontSize: 12, fontWeight: 600, textAlign: 'left' }}>
                {cameraError}
              </div>
            )}
          </div>
        )}

        {/* CARGANDO */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, boxShadow: '0 8px 40px #0001' }}>
            <Icon icon="mdi:loading" style={{ fontSize: 52, color: '#2563eb', animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Consultando producto...</p>
          </div>
        )}

        {/* PRODUCTO ENCONTRADO */}
        {producto && !loading && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: isMobile ? 20 : 32, maxWidth: 720, width: '100%', boxShadow: '0 8px 40px #0b4f9c15', position: 'relative', overflow: 'hidden' }}>
            {/* Barra de countdown */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#f1f5f9' }}>
              <div style={{ height: '100%', background: '#2563eb', width: `${(countdown / 8) * 100}%`, transition: 'width 1s linear' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.4fr', gap: 24, alignItems: 'center', paddingTop: 8 }}>
              {/* Imagen */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 200, height: 200, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {producto.imagenUrl
                    ? <img src={producto.imagenUrl} alt={producto.nombre} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    : <Icon icon="mdi:package-variant" style={{ fontSize: 72, color: '#cbd5e1' }} />}
                  <span style={{ position: 'absolute', top: 8, left: 8, background: '#0b4f9c', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{producto.categoria}</span>
                </div>
              </div>
              {/* Detalles */}
              <div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #dbeafe', padding: '2px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Icon icon="mdi:barcode" style={{ fontSize: 14 }} /> SKU: {producto.sku}
                </div>
                <h2 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.2 }}>{producto.nombre}</h2>
                {producto.descripcion && <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 12px' }}>{producto.descripcion}</p>}

                {/* Precios */}
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: 1 }}>Precio en Dólares ($)</div>
                  <div style={{ fontSize: isMobile ? 32 : 40, fontWeight: 900, color: '#10b981', fontFamily: 'monospace', lineHeight: 1.1 }}>
                    {Utils.formatMoney(producto.precioUsd, '$')}
                  </div>
                  <div style={{ borderTop: '1px solid #bfdbfe', marginTop: 10, paddingTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#1e40af', marginBottom: 2 }}>
                      <span>Precio en Bolívares (Bs.)</span>
                      <span>Tasa BCV: {producto.tasaBcv?.toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: '#0b4f9c', fontFamily: 'monospace' }}>
                      {Utils.formatMoney(producto.precioVes, 'Bs.')}
                    </div>
                  </div>
                </div>

                {/* Stock + botón */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  {producto.stockActual > 0
                    ? <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '4px 12px' }}>● DISPONIBLE ({producto.stockActual})</span>
                    : <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '4px 12px' }}>AGOTADO</span>}
                  <button onClick={resetVisor} style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Escanear Otro ({countdown}s)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTO NO ENCONTRADO */}
        {error && !loading && (
          <div style={{ background: '#fff', border: '1px solid #fecdd3', borderRadius: 24, padding: 32, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px #ef444415' }}>
            <div style={{ width: 64, height: 64, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon icon="mdi:alert-circle-outline" style={{ fontSize: 36, color: '#ef4444' }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Producto No Encontrado</h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 20px' }}>
              No se encontró ningún producto con el código <strong style={{ color: '#2563eb', fontFamily: 'monospace', background: '#eff6ff', padding: '1px 6px', borderRadius: 4 }}>{query}</strong>
            </p>
            <button onClick={resetVisor} style={{ padding: '10px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Reintentar ({countdown}s)
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#94a3b8', paddingTop: 12, borderTop: '1px solid #e2e8f0', marginTop: 8 }}>
        <span style={{ fontWeight: 600, color: '#475569' }}>GestorPOS · Visor de Precios</span>
        <span>Modo: <strong style={{ color: '#0b4f9c' }}>{isMobile ? 'Cámara Móvil' : 'Lector USB'}</strong></span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scan { from { top: 10%; } to { top: 90%; } }
      `}</style>
    </div>
  );
}
