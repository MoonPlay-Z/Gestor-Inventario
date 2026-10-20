import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import androidIcon from '@iconify/icons-mdi/android';
import cellphoneLinkIcon from '@iconify/icons-mdi/cellphone-link';
import downloadIcon from '@iconify/icons-mdi/download';
import checkCircleIcon from '@iconify/icons-mdi/check-circle-outline';
import { useAuth } from '../context/AuthContext';
import { SITIO_ACTUALIZACIONES, formatearTamano, urlManifiesto, validarManifiesto } from '../services/actualizaciones';

// En la web el APK se sirve desde el mismo origen. Dentro de la app nativa
// (Capacitor) el origen es local (`https://localhost`), así que el APK y el
// manifiesto se piden al sitio configurado en VITE_UPDATE_URL.
const APK_URL = `${SITIO_ACTUALIZACIONES}/descargas/gestorpos-android.apk`;
// Sin valor "por defecto": si el manifiesto no carga, la página no debe
// anunciar una versión que ya no es la publicada.
const VERSION_DESCONOCIDA = '';

const Pasos = ({ pasos }) => (
  <ol style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: '10px' }}>
    {pasos.map((paso, i) => (
      <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.55 }}>
        <span style={{
          flexShrink: 0,
          width: '22px',
          height: '22px',
          borderRadius: '999px',
          backgroundColor: 'rgba(37, 99, 235, 0.25)',
          border: '1px solid rgba(96, 165, 250, 0.45)',
          color: '#93c5fd',
          fontSize: '0.72rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1px'
        }}>
          {i + 1}
        </span>
        <span>{paso}</span>
      </li>
    ))}
  </ol>
);

const Tarjeta = ({ icono, titulo, subtitulo, children, destacada }) => (
  <section style={{
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '28px',
    border: destacada ? '1px solid rgba(37, 99, 235, 0.55)' : '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: destacada ? '0 18px 40px rgba(37, 99, 235, 0.18)' : 'none',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
      <span style={{
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        backgroundColor: 'rgba(37, 99, 235, 0.22)',
        color: '#60a5fa',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon icon={icono} className="h-6 w-6" />
      </span>
      <div>
        <h2 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{titulo}</h2>
        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0' }}>{subtitulo}</p>
      </div>
    </div>
    {children}
  </section>
);

export function DescargarPage() {
  const { user } = useAuth();
  const volverA = user ? '/dashboard' : '/';
  const volverTexto = user ? '← Volver al sistema' : '← Volver al inicio';

  // Versión y tamaño salen del manifiesto que genera `npm run apk:publicar`;
  // así la página nunca muestra un tamaño o una versión viejos.
  const [apk, setApk] = useState({ version: VERSION_DESCONOCIDA, tamano: '' });

  useEffect(() => {
    let vivo = true;
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), 6000);

    fetch(urlManifiesto(), {
      cache: 'no-cache',
      signal: control.signal,
    })
      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))
      .then((datos) => {
        const manifiesto = validarManifiesto(datos);
        if (!vivo || !manifiesto) return;
        setApk({ version: manifiesto.versionName, tamano: formatearTamano(manifiesto.size) });
      })
      .catch(() => {
        /* sin manifiesto la página muestra «Última versión» */
      })
      .finally(() => clearTimeout(temporizador));

    return () => {
      vivo = false;
      control.abort();
      clearTimeout(temporizador);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#0b0f17', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0b0f17',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/favicon.png"
            alt=""
            width="36"
            height="36"
            style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'block', flexShrink: 0 }}
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            GestorPOS<span style={{ color: '#38bdf8' }}>.dev</span>
          </span>
        </Link>
        <Link to={volverA} style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
          {volverTexto}
        </Link>
      </header>

      {/* Contenido */}
      <main style={{ padding: '56px 32px 72px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(37, 99, 235, 0.16)',
            border: '1px solid rgba(96, 165, 250, 0.35)',
            color: '#93c5fd',
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: '999px',
            marginBottom: '16px'
          }}>
            <Icon icon={downloadIcon} className="h-4 w-4" />
            Instálalo en segundos
          </span>
          <h1 style={{ fontSize: '2.3rem', fontWeight: 900, lineHeight: 1.15, margin: '0 0 12px' }}>
            Descarga GestorPOS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.02rem', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto' }}>
            La misma cuenta y los mismos datos, en el teléfono o en la computadora.
            Sin tiendas de aplicaciones y sin instalar nada extra.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Android APK */}
          <Tarjeta
            destacada
            icono={androidIcon}
            titulo="Android — APK"
            subtitulo={`${apk.version ? `Versión ${apk.version}` : 'Última versión'}${apk.tamano ? ` · ${apk.tamano}` : ''} · Android 8 o superior`}
          >
            <Pasos pasos={[
              'Pulsa «Descargar APK» y espera a que termine la descarga.',
              'Abre el archivo desde la notificación o desde la carpeta «Descargas».',
              'Si Android lo pide, permite instalar apps de esta fuente (Chrome o Archivos).',
              'Abre GestorPOS e inicia sesión con tu cuenta de siempre.',
            ]} />
            <a
              href={APK_URL}
              download="gestorpos-android.apk"
              style={{
                marginTop: '22px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 800,
                textDecoration: 'none',
                padding: '14px 20px',
                borderRadius: '12px',
                minHeight: '48px',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Icon icon={downloadIcon} className="h-5 w-5" />
              Descargar APK
            </a>
            <p style={{ color: '#64748b', fontSize: '0.76rem', margin: '10px 0 0' }}>
              Firmada para pruebas internas (no es una versión de Play Store).
            </p>
          </Tarjeta>

          {/* PWA */}
          <Tarjeta
            icono={cellphoneLinkIcon}
            titulo="iPhone, iPad y computadora"
            subtitulo="Instálala desde el navegador (PWA), sin descargar nada"
          >
            <Pasos pasos={[
              'Abre la página del sistema en el navegador.',
              'Android (Chrome): menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».',
              'iPhone/iPad (Safari): botón Compartir → «Añadir a pantalla de inicio».',
              'Computadora (Chrome/Edge): icono de instalar en la barra de direcciones.',
            ]} />
            <div style={{
              marginTop: '22px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              borderRadius: '12px',
              padding: '14px 16px'
            }}>
              <Icon icon={checkCircleIcon} className="h-5 w-5" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ color: '#cbd5e1', fontSize: '0.84rem', lineHeight: 1.55, margin: 0 }}>
                Se abre a pantalla completa, con el mismo icono y sin barra del navegador.
              </p>
            </div>
          </Tarjeta>
        </div>

        {/* Nota de conexión */}
        <div style={{
          marginTop: '24px',
          backgroundColor: 'rgba(234, 179, 8, 0.07)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: '14px',
          padding: '18px 20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }} aria-hidden="true">ℹ️</span>
          <p style={{ color: '#e2e8f0', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: '#fde68a' }}>Solo necesitas internet:</strong> la app se conecta
            al servidor en la nube por HTTPS, así que funciona fuera de casa y sin depender de
            ningún equipo encendido. Esa misma conexión segura es la que habilita la cámara para
            escanear códigos de barras.
          </p>
        </div>

        <p style={{ marginTop: '32px', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
          ¿Problemas para instalar? Escríbenos por{' '}
          <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
            WhatsApp
          </a>{' '}
          y te ayudamos.
        </p>
      </main>
    </div>
  );
}
