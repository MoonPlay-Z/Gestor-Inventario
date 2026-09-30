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
import { API } from '../services/api';

const trialWhatsAppUrl = 'https://wa.me/584127723148?text=Hola%2C%20quiero%20solicitar%20la%20activaci%C3%B3n%20del%20mes%20de%20prueba%20gratis%20para%20mi%20negocio.';

export function LandingPage() {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    // Cargar noticias publicadas si existen
    API.getPublicNoticias()
      .then(data => {
        if (Array.isArray(data)) setNoticias(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#0b0f17', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ─── 1. NAVBAR (Dark Header) ───────────────────────────────────────── */}
      <header style={{
        backgroundColor: '#0b0f17',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon icon={packageIcon} className="h-6 w-6 text-white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            GestorPOS<span style={{ color: '#38bdf8' }}>.dev</span>
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#beneficios" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Beneficios</a>
          <a href="#modulos" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Módulos</a>
          <a href="#preguntas" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Preguntas</a>
          <a href="#contacto" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Contacto</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{
            color: '#ffffff',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            Iniciar Sesión
          </Link>
          <Link to="/registro" style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '0.88rem',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            Registrar
          </Link>
        </div>
      </header>


      {/* ─── 2. HERO SECTION (Dark Code Backdrop & Hero Banner) ────────────── */}
      <section id="inicio" style={{
        position: 'relative',
        padding: '80px 32px 100px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 60%)'
      }}>
        <div style={{ maxWidth: '850px' }}>
          <h1 style={{ fontSize: '2.7rem', fontWeight: 900, lineHeight: 1.12, color: '#ffffff', marginBottom: '12px' }}>
            Sistema POS e inventario para comercios venezolanos
          </h1>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8', marginBottom: '20px' }}>
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
          <div style={{
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
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
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
      </section>


      {/* ─── 3. SECTION 1: ARCHITECTURE & STATUS (White Container Split) ──── */}
      <section id="beneficios" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr minmax(320px, 400px)', gap: '48px', alignItems: 'start' }}>
          
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

            <div style={{ display: 'flex', gap: '10px' }}>
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
      <section id="modulos" style={{ backgroundColor: '#f8fafc', color: '#0f172a', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Módulos & Herramientas Destacadas
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Herramientas conectadas para vender, cuidar el inventario y tomar mejores decisiones.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            
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


      <section style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '72px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '28px' }}>Más herramientas para administrar tu comercio</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
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

      <section id="preguntas" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '72px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>Preguntas frecuentes</h2>
          <p style={{ color: '#475569', margin: '0 0 28px' }}>Lo que necesitas saber antes de comenzar.</p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <details style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 18px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800 }}>¿Qué incluye la prueba gratuita?</summary>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>La prueba gratuita es por un mes. Escríbenos por WhatsApp para solicitar y coordinar la activación.</p>
            </details>
            <details style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 18px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800 }}>¿Puedo vender en dólares y bolívares?</summary>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Sí. El sistema maneja precios y ventas en USD y VES. La tasa de cambio se define en la configuración del negocio.</p>
            </details>
            <details style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 18px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800 }}>¿Puedo dar acceso a mi equipo?</summary>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Sí. Puedes crear usuarios y asignar roles para tareas de caja, inventario o consulta de precios.</p>
            </details>
            <details style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 18px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800 }}>¿Cómo consulto los planes y precios?</summary>
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Escríbenos por WhatsApp para conocer las opciones y condiciones vigentes para tu negocio.</p>
            </details>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginTop: '28px' }}>
            <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: '#1d4ed8', color: '#ffffff', fontWeight: 800, padding: '12px 18px', borderRadius: '8px', textDecoration: 'none' }}>Solicitar mes gratis por WhatsApp</Link>
            <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" style={{ color: '#0f766e', fontWeight: 800, textDecoration: 'none' }}>Consultar por WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ─── 5. SECTION 3: NOTICIAS & ANUNCIOS ────────────────────────────── */}
      {noticias.length > 0 && (
        <section id="noticias" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px 32px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                Noticias & Anuncios de la Plataforma
              </h2>
              <p style={{ color: '#64748b' }}>Actualizaciones recientes y novedades de la versión SaaS.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {noticias.map(noticia => (
                <div key={noticia.id} style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                    {noticia.categoria}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 8px' }}>{noticia.titulo}</h3>
                  <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.5' }}>{noticia.contenido}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ─── 6. FOOTER (Deep Navy Footer) ─────────────────────────────────── */}
      <footer id="contacto" style={{ backgroundColor: '#0b0f17', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '60px 32px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px', marginBottom: '40px' }}>
          <div style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                JA<span style={{ color: '#38bdf8' }}>.dev</span> — Gestor POS
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#64748b' }}>
              Ventas, inventario y caja para ayudar a comercios a llevar su operación diaria con más claridad.
            </p>
          </div>

          <div>
            <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>Síguenos & Contacto</h2>
            <nav aria-label="Enlaces del sitio" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <a href="#inicio" style={{ color: '#cbd5e1' }}>Inicio</a>
              <a href="#beneficios" style={{ color: '#cbd5e1' }}>Beneficios</a>
              <a href="#modulos" style={{ color: '#cbd5e1' }}>Módulos</a>
              <a href="#preguntas" style={{ color: '#cbd5e1' }}>Preguntas frecuentes</a>
              <Link to={trialWhatsAppUrl} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1' }}>Solicitar mes de prueba</Link>
              <Link to="/login" style={{ color: '#cbd5e1' }}>Iniciar sesión</Link>
              <Link to="/pagos-saas" style={{ color: '#cbd5e1' }}>Pagos de suscripción</Link>
            </nav>
            <div style={{ display: 'flex', gap: '14px' }}>
              <a href="https://github.com/MoonPlay-Z/Gestor-Inventario" target="_blank" rel="noreferrer" aria-label="Proyecto GestorPOS en GitHub" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={githubIcon} /></a>
              <a href="https://www.linkedin.com/in/jadeveloper/" target="_blank" rel="noreferrer" aria-label="Perfil de Juan Arcila en LinkedIn" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={linkedinIcon} /></a>
              <a href="mailto:arcila.juan10@gmail.com" aria-label="Enviar correo a soporte" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={emailIcon} /></a>
              <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={whatsappIcon} /></a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          © {new Date().getFullYear()} ING. Juan Arcila. Todos los derechos reservados.
        </div>
      </footer>

    </div>
  );
}
