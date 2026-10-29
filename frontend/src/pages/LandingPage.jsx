import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';
import rocketLaunchIcon from '@iconify/icons-mdi/rocket-launch';
import flashIcon from '@iconify/icons-mdi/flash';
import cartIcon from '@iconify/icons-mdi/cart';
import shieldCheckIcon from '@iconify/icons-mdi/shield-check';
import emailIcon from '@iconify/icons-mdi/email-outline';
import whatsappIcon from '@iconify/icons-mdi/whatsapp';
import githubIcon from '@iconify/icons-mdi/github';
import linkedinIcon from '@iconify/icons-mdi/linkedin';
import fileDocumentIcon from '@iconify/icons-mdi/file-document-outline';
import currencyUsdIcon from '@iconify/icons-mdi/currency-usd';
import checkDecagramIcon from '@iconify/icons-mdi/check-decagram';
import alertCircleIcon from '@iconify/icons-mdi/alert-circle-outline';
import menuIcon from '@iconify/icons-mdi/menu';
import closeIcon from '@iconify/icons-mdi/close';
import plusIcon from '@iconify/icons-mdi/plus';
import { API } from '../services/api';
import { parseVideoUrl } from '../utils/media';
import '../css/landing.css';

const trialWhatsAppUrl = 'https://wa.me/584127723148?text=Hola%2C%20quiero%20solicitar%20la%20activaci%C3%B3n%20del%20mes%20de%20prueba%20gratis%20para%20mi%20negocio.';

const preguntasFrecuentes = [
  {
    pregunta: '¿Qué incluye la prueba gratuita?',
    respuesta: 'La prueba gratuita es por un mes. Escríbenos por WhatsApp para solicitar y coordinar la activación.',
  },
  {
    pregunta: '¿Puedo vender en dólares y bolívares?',
    respuesta: 'Sí. El sistema maneja precios y ventas en USD y VES. La tasa de cambio se define en la configuración del negocio.',
  },
  {
    pregunta: '¿Puedo dar acceso a mi equipo?',
    respuesta: 'Sí. Puedes crear usuarios y asignar roles para tareas de caja, inventario o consulta de precios.',
  },
  {
    pregunta: '¿Cómo consulto los planes y precios?',
    respuesta: 'Escríbenos por WhatsApp para conocer las opciones y condiciones vigentes para tu negocio.',
  },
];

const mediaContenedorStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  backgroundColor: '#e2e8f0',
  overflow: 'hidden',
};

const mediaElementoStyle = {
  width: '100%',
  height: '100%',
  display: 'block',
  border: 0,
  objectFit: 'cover',
};

/**
 * Pinta el medio de una noticia. El video tiene prioridad sobre la imagen;
 * si la URL no es embebible se muestra un enlace "Ver video" en la tarjeta.
 */
function NoticiaMedia({ noticia }) {
  const [imagenRota, setImagenRota] = useState(false);
  const video = parseVideoUrl(noticia.videoUrl);

  if (video?.tipo === 'iframe') {
    return (
      <div style={mediaContenedorStyle}>
        <iframe
          src={video.src}
          title={`Video: ${noticia.titulo}`}
          style={mediaElementoStyle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (video?.tipo === 'video') {
    return (
      <div style={mediaContenedorStyle}>
        <video src={video.src} controls preload="metadata" style={mediaElementoStyle}>
          Tu navegador no puede reproducir este video.
        </video>
      </div>
    );
  }

  if (noticia.imagenUrl && !imagenRota) {
    return (
      <div style={mediaContenedorStyle}>
        <img
          src={noticia.imagenUrl}
          alt={noticia.titulo}
          loading="lazy"
          style={mediaElementoStyle}
          onError={() => setImagenRota(true)}
        />
      </div>
    );
  }

  return null;
}

export function LandingPage() {
  const [noticias, setNoticias] = useState([]);
  // Menú plegable del header en móvil (≤767px). En escritorio el botón y el
  // estado son inertes: el CSS sólo lo muestra en móvil.
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  useEffect(() => {
    // Cargar noticias publicadas si existen
    API.getPublicNoticias()
      .then(data => {
        if (Array.isArray(data)) setNoticias(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="landing-root" style={{ backgroundColor: '#0b0f17', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── 1. NAVBAR (cabecera oscura) ─────────────────────────────────────
          Estilos en `css/landing.css`: PC, ≤1023px (menú plegable) y ≤767px
          (lista vertical y botones a ancho completo). */}
      <header className="landing-header">
        <div className="landing-header-logo">
          <img src="/favicon.png" alt="" width="36" height="36" />
          <span className="landing-header-logo-text">
            GestorPOS<span>.dev</span>
          </span>
        </div>

        <button
          type="button"
          className="landing-menu-btn"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          aria-controls="landing-nav-movil"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <Icon icon={menuAbierto ? closeIcon : menuIcon} className="h-6 w-6" />
        </button>

        <nav id="landing-nav-movil" className="landing-nav" data-open={menuAbierto ? 'true' : 'false'}>
          <a href="#beneficios" onClick={cerrarMenu}>Beneficios</a>
          <a href="#modulos" onClick={cerrarMenu}>Módulos</a>
          <Link to="/blog" onClick={cerrarMenu}>Blog</Link>
          <Link to="/descargar" onClick={cerrarMenu}>Descargar</Link>
          <a href="#preguntas" onClick={cerrarMenu}>Preguntas</a>
          <a href="#contacto" onClick={cerrarMenu}>Contacto</a>
        </nav>

        <div className="landing-header-actions" data-open={menuAbierto ? 'true' : 'false'}>
          <Link to="/login" className="landing-header-login">Iniciar Sesión</Link>
          <Link to="/registro" className="landing-header-register">Registrar</Link>
        </div>
      </header>


      {/* ─── 2. HERO SECTION (foto de comercio a sangre + velo navy) ───────── */}
      <section id="inicio" className="landing-hero">
        {/* Foto de fondo: carrito de compras (ver `css/landing.css`).
            Es decorativa; el texto va encima con un velo para el contraste. */}
        <img
          className="landing-hero-bg"
          src="/banner-landing-page.webp"
          alt=""
          aria-hidden="true"
          width="2752"
          height="1536"
          fetchpriority="high"
          decoding="async"
        />
        <div className="landing-hero-veil" aria-hidden="true" />

        <div className="landing-hero-inner">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title" style={{ fontSize: '2.7rem', fontWeight: 900, lineHeight: 1.12, color: '#ffffff', marginBottom: '12px' }}>
            Sistema POS e inventario para comercios venezolanos
          </h1>
          <h2 className="landing-hero-sub" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8', marginBottom: '20px' }}>
            Vende con orden. Controla cada producto, cobro y cierre.
          </h2>

          {/* Beneficios principales */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
            {['Ventas en USD y VES', 'Alertas de stock', 'Control de caja'].map((tag, idx) => (
              <span key={idx} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Translucent Glass Description Card */}
          <div className="landing-glass" style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>Prueba gratuita por un mes</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>| Activación coordinada por WhatsApp</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: '1.65', margin: 0 }}>
              Registra ventas, consulta existencias y revisa tus cierres desde un mismo sistema. Gestiona precios y ventas en USD y VES con la tasa de cambio configurada para tu negocio.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="landing-cta-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <a href={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '14px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icon icon={rocketLaunchIcon} className="h-5 w-5" />
              Solicitar mes de prueba por WhatsApp
            </a>

            <Link to="/login" style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1rem',
              padding: '13px 26px',
              borderRadius: '10px',
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Acceso Clientes
            </Link>
          </div>

          {/* Social Quick Links Row */}
          <div className="landing-social" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>CONTACTO & SOPORTE:</span>
            <a href="https://github.com/MoonPlay-Z/Gestor-Inventario" target="_blank" rel="noreferrer" aria-label="Proyecto GestorPOS en GitHub" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={githubIcon} className="h-4 w-4" />
            </a>
            <a href="https://www.linkedin.com/in/jadeveloper/" target="_blank" rel="noreferrer" aria-label="Perfil de Juan Arcila en LinkedIn" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={linkedinIcon} className="h-4 w-4" />
            </a>
            <a href="mailto:arcila.juan10@gmail.com" aria-label="Enviar correo a soporte" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={emailIcon} className="h-4 w-4" />
            </a>
            <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={whatsappIcon} className="h-4 w-4" />
            </a>
          </div>
        </div>
        </div>
      </section>


      {/* ─── 3. SECTION 1: ARCHITECTURE & STATUS (White Container Split) ──── */}
      <section id="beneficios" className="landing-section landing-section-white" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px clamp(16px, 4vw, 32px)' }}>
        <div className="landing-split" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr minmax(320px, 400px)', gap: '48px', alignItems: 'start' }}>
          
          {/* Left Column: Specs & Features */}
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Del inventario al cierre: tu operación en un solo flujo
            </h2>
            <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              Mantén el catálogo organizado, registra ventas para tus clientes y controla los cobros sin perder de vista lo que ocurre en caja.
            </p>
            <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.7', marginBottom: '28px' }}>
              El sistema acompaña las tareas habituales del comercio: desde revisar existencias hasta consultar ventas, ganancias y valor del inventario.
            </p>

            <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', fontWeight: 800, textDecoration: 'none' }}>
              Solicitar el mes de prueba por WhatsApp <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Right Column: Dark Navy Status Card */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #1e293b',
            boxShadow: '0 20px 30px rgba(15, 23, 42, 0.15)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
              Lo esencial para el día a día
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>Un espacio de trabajo para tu empresa</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon={checkDecagramIcon} className="h-5 w-5 text-[#38bdf8]" />
                Inventario con alertas de stock
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon={checkDecagramIcon} className="h-5 w-5 text-[#38bdf8]" />
                Ventas y precios en USD y VES
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon={checkDecagramIcon} className="h-5 w-5 text-[#38bdf8]" />
                Usuarios con roles diferenciados
              </li>
            </ul>

            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '24px',
              fontSize: '0.78rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <Icon icon={alertCircleIcon} className="h-5 w-5 text-[#fbbf24] flex-shrink-0 mt-0.5" />
              <span>La tasa de cambio se configura desde los ajustes del negocio. Solicita por WhatsApp la activación de tu mes de prueba.</span>
            </div>

            <div className="landing-card-actions" style={{ display: 'flex', gap: '10px' }}>
              <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                flex: 1,
                textAlign: 'center'
              }}>
                Solicitar activación por WhatsApp
              </Link>
              <a href={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                Hablar por WhatsApp
              </a>
            </div>
          </div>

        </div>
      </section>


      {/* ─── 4. SECTION 2: PROYECTOS DESTACADOS / MÓDULOS (Light Grey) ─────── */}
      <section id="modulos" className="landing-section" style={{ backgroundColor: '#f8fafc', color: '#0f172a', padding: '80px clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="landing-head" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Módulos & Herramientas Destacadas
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Herramientas conectadas para vender, cuidar el inventario y tomar mejores decisiones.
            </p>
          </div>

          <div className="landing-grid landing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '24px' }}>
            
            {/* Card 1 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon icon={cartIcon} className="h-6 w-6" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Punto de Venta POS</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Registra ventas y facturas, selecciona el cliente y consulta los precios en USD y VES con la tasa configurada para tu negocio.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['Ventas', 'Clientes', 'Multimoneda'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Solicitar activación
              </Link>
            </div>

            {/* Card 2 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon icon={packageIcon} className="h-6 w-6" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Gestión de Inventarios</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Organiza productos por SKU y categoría, revisa niveles de stock y recibe alertas cuando un producto llega al mínimo.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['SKU', 'Stock mínimo', 'Por peso'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Solicitar activación
              </Link>
            </div>

            {/* Card 3 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon icon={currencyUsdIcon} className="h-6 w-6" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Cierres de Caja & Arqueos</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Registra la apertura y el cierre de turnos y consulta los movimientos de caja por método de pago.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['Turnos', 'Cierres', 'Pagos'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Solicitar activación
              </Link>
            </div>

            {/* Card 4 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Icon icon={fileDocumentIcon} className="h-6 w-6" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Cotizaciones & PDF</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Prepara cotizaciones para tus clientes, compártelas y conviértelas en factura cuando se confirme la venta.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['Cotizaciones', 'Clientes', 'Facturas'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Solicitar activación
              </Link>
            </div>

          </div>
        </div>
      </section>


      <section className="landing-section landing-section-white" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '72px clamp(16px, 4vw, 32px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '28px' }}>Más herramientas para administrar tu comercio</h2>
          <div className="landing-grid landing-grid-tools" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '28px' }}>
            <div style={{ borderTop: '3px solid #0f766e', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px' }}>Reportes del negocio</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>Consulta ventas, ganancias, impuestos, productos destacados y valor del inventario por período.</p>
            </div>
            <div style={{ borderTop: '3px solid #d97706', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px' }}>Clientes y cuentas por cobrar</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>Mantén los datos de tus clientes y revisa facturas pendientes y pagos registrados.</p>
            </div>
            <div style={{ borderTop: '3px solid #2563eb', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px' }}>Usuarios y visor de precios</h3>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>Asigna roles al equipo y habilita una pantalla de consulta de precios para tus clientes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. PREGUNTAS FRECUENTES (acordeón) ─────────────────────────────
          Diseño de referencia: "GestorPOS Rediseño · 04 FAQ y Footer".
          Los estilos viven en `css/landing.css` (bloque 07). */}
      <section id="preguntas" className="landing-faq">
        <div className="landing-faq-inner">
          <header className="landing-faq-head">
            <h2 className="landing-faq-title">Preguntas frecuentes</h2>
            <p className="landing-faq-sub">Lo que necesitas saber antes de comenzar.</p>
          </header>

          <div className="landing-faq-list">
            {preguntasFrecuentes.map(({ pregunta, respuesta }) => (
              <details key={pregunta} className="landing-faq-item">
                <summary className="landing-faq-question">
                  <span>{pregunta}</span>
                  <Icon icon={plusIcon} className="landing-faq-icon" aria-hidden="true" />
                </summary>
                <p className="landing-faq-answer">{respuesta}</p>
              </details>
            ))}
          </div>

          <div className="landing-faq-cta">
            <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" className="landing-faq-cta-primary">
              Solicitar mes gratis por WhatsApp
            </Link>
            <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" className="landing-faq-cta-link">
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION 3: NOTICIAS & ANUNCIOS ────────────────────────────── */}
      {noticias.length > 0 && (
        <section id="noticias" className="landing-section landing-section-white" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px clamp(16px, 4vw, 32px)', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="landing-head" style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                Noticias & Anuncios de la Plataforma
              </h2>
              <p style={{ color: '#64748b' }}>Actualizaciones recientes y novedades de la versión SaaS.</p>
            </div>

            <div className="landing-grid landing-grid-news" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
              {noticias.map(noticia => {
                const video = parseVideoUrl(noticia.videoUrl);
                return (
                  <div key={noticia.id} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <NoticiaMedia noticia={noticia} />
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                          {noticia.categoria}
                        </span>
                        {noticia.destacado && (
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                            Destacado
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{noticia.titulo}</h3>
                      {noticia.subtitulo && (
                        <p style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{noticia.subtitulo}</p>
                      )}
                      <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-line' }}>{noticia.contenido}</p>
                      {video?.tipo === 'link' && (
                        <a href={video.src} target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                          Ver video →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}


      {/* ─── 6. FOOTER (Deep Navy Footer) ─────────────────────────────────── */}
      {/* Diseño de referencia: "GestorPOS Rediseño · 04 FAQ y Footer".
          Los estilos viven en `css/landing.css` (base, tablet y teléfono). */}
      <footer id="contacto" className="landing-footer">
        <div className="landing-footer-inner">

          <div className="landing-footer-grid">

            {/* Marca: logo, descripción y redes */}
            <div className="landing-footer-brand">
              <Link to="/" className="landing-footer-logo" aria-label="GestorPOS, ir al inicio">
                <img src="/favicon.png" alt="" width="36" height="36" />
                <span className="landing-footer-logo-text">
                  GestorPOS<span>.dev</span>
                </span>
              </Link>
              <p className="landing-footer-desc">
                Sistema administrativo y caja para ayudar a comercios a llevar su operación diaria con más claridad.
              </p>
              <div className="landing-footer-social">
                <a href="https://github.com/MoonPlay-Z/Gestor-Inventario" target="_blank" rel="noreferrer" aria-label="Proyecto GestorPOS en GitHub">
                  <Icon icon={githubIcon} aria-hidden="true" />
                </a>
                <a href="https://www.linkedin.com/in/jadeveloper/" target="_blank" rel="noreferrer" aria-label="Perfil de Juan Arcila en LinkedIn">
                  <Icon icon={linkedinIcon} aria-hidden="true" />
                </a>
                <a href="mailto:arcila.juan10@gmail.com" aria-label="Enviar correo a soporte">
                  <Icon icon={emailIcon} aria-hidden="true" />
                </a>
                <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp">
                  <Icon icon={whatsappIcon} aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Producto */}
            <nav className="landing-footer-col" aria-label="Producto">
              <h2 className="landing-footer-title">Producto</h2>
              <ul className="landing-footer-links">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#beneficios">Beneficios</a></li>
                <li><a href="#modulos">Módulos</a></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/descargar">Descargar</Link></li>
              </ul>
            </nav>

            {/* Soporte */}
            <nav className="landing-footer-col" aria-label="Soporte">
              <h2 className="landing-footer-title">Soporte</h2>
              <ul className="landing-footer-links">
                <li><a href="https://wa.me/584127723148" target="_blank" rel="noreferrer">Soporte por WhatsApp</a></li>
                <li><a href="#preguntas">Preguntas frecuentes</a></li>
                <li><a href={trialWhatsAppUrl} target="_blank" rel="noreferrer">Solicitar mes de prueba</a></li>
                <li><Link to="/pagos-saas">Pagos de suscripción</Link></li>
                <li><Link to="/login">Iniciar sesión</Link></li>
              </ul>
            </nav>

            {/* Legal */}
            <nav className="landing-footer-col" aria-label="Legal">
              <h2 className="landing-footer-title">Legal</h2>
              <ul className="landing-footer-links">
                <li><Link to="/politica-cookies">Política de Cookies</Link></li>
                <li><Link to="/politica-privacidad">Política de Privacidad</Link></li>
                <li><Link to="/terminos">Términos y Condiciones</Link></li>
              </ul>
            </nav>

          </div>

          {/* Copyright y créditos */}
          <div className="landing-footer-bottom">
            <p>© {new Date().getFullYear()} ING. Juan Arcila. Todos los derechos reservados.</p>
            <p>Sitio desarrollado y mantenido con asistencia de inteligencia artificial.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
