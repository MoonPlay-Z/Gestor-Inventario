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

export function LandingPage() {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    // Cargar noticias publicadas si existen
    fetch('/api/public/noticias')
      .then(res => res.json())
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
          <a href="#inicio" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Inicio</a>
          <a href="#modulos" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Módulos</a>
          <a href="#noticias" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Noticias</a>
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
            Prueba Gratis (7 Días)
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
          <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.15, color: '#ffffff', marginBottom: '12px' }}>
            Gestor de Inventario & POS
          </h1>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8', marginBottom: '20px' }}>
            Sistema SaaS Multi-Tenant & Punto de Venta Multimoneda (USD / VES BCV)
          </h2>

          {/* Tech Stack Pills Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
            {['React.js', 'Vite', 'Node.js', 'Prisma ORM', 'PostgreSQL', 'Tasa BCV Oficial', 'Multi-Tenant'].map((tag, idx) => (
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
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>Prueba Gratuita de 7 Días Disponible</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>| Remoto · Nube · Acceso Inmediato</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: '1.65', margin: 0 }}>
              Plataforma web de alto rendimiento para el control total de negocios. Emite facturas multimoneda sincronizadas en tiempo real con la tasa oficial del BCV, gestiona inventario con stock mínimo, aperturas/cierres de caja y usuarios con permisos dinámicos.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <Link to="/registro" style={{
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
              Comenzar Prueba Gratis (7 Días)
            </Link>

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
            <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={githubIcon} className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={linkedinIcon} className="h-4 w-4" />
            </a>
            <a href="mailto:arcila.juan10@gmail.com" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={emailIcon} className="h-4 w-4" />
            </a>
            <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Icon icon={whatsappIcon} className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>


      {/* ─── 3. SECTION 1: ARCHITECTURE & STATUS (White Container Split) ──── */}
      <section style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr minmax(320px, 400px)', gap: '48px', alignItems: 'start' }}>
          
          {/* Left Column: Specs & Features */}
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Ingeniería de Software & Sistema POS Multi-Tenant
            </h3>
            <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              Como plataforma de gestión comercial de alto rendimiento, el sistema está construido sobre un stack tecnológico moderno: <strong>React.js y Vite</strong> en el frontend, con backend modular en <strong>Node.js y Express</strong> acoplado a la base de datos distribuida <strong>PostgreSQL en Neon Cloud</strong> mediante Prisma ORM.
            </p>
            <p style={{ color: '#334155', fontSize: '1rem', lineHeight: '1.7', marginBottom: '28px' }}>
              Implementa aislamiento estricto por empresa (Multi-Tenant), tasa BCV sincronizada automáticamente cada mañana, cierres de caja ciegos y arqueos en dólares y bolívares.
            </p>

            {/* Tech Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {['React 18', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Prisma ORM', 'JWT', 'RBAC', 'Pago Móvil'].map((t, i) => (
                <span key={i} style={{
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '5px 14px',
                  borderRadius: '999px'
                }}>
                  {t}
                </span>
              ))}
            </div>
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
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
              Estatus Profesional del Sistema
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>Disponibilidad Inmediata en Nube</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon={checkDecagramIcon} className="h-5 w-5 text-[#38bdf8]" />
                Tasa Oficial BCV Actualizada
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon={checkDecagramIcon} className="h-5 w-5 text-[#38bdf8]" />
                Facturación Multimoneda (USD / VES)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon={checkDecagramIcon} className="h-5 w-5 text-[#38bdf8]" />
                Multiusuario con Roles Granulares
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
              <span>Suscripción mensualizable con soporte para Pago Móvil (Banesco, Venezuela, Bancamiga) y transferencias internacionales.</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/registro" style={{
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
                Probar Gratis
              </Link>
              <Link to="/pagos-saas" style={{
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
                Reportar Pago
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* ─── 4. SECTION 2: PROYECTOS DESTACADOS / MÓDULOS (Light Grey) ─────── */}
      <section id="modulos" style={{ backgroundColor: '#f8fafc', color: '#0f172a', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Módulos & Herramientas Destacadas
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Una selección de aplicaciones en producción e interfaces optimizadas para ventas rápidas.
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
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Punto de Venta POS</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Punto de venta ultra optimizado para operaciones de mostrador con buscador instantáneo, códigos de barra y cobros mixtos.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['React 18', 'Vite', 'Node.js', 'Express'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to="/registro" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Probar Módulo
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
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Gestión de Inventarios</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Control de existencias, cálculo de costo promedio de compra, alertas de stock mínimo y precios multimoneda.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['PostgreSQL', 'Prisma', 'SKU', 'Categorías'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to="/registro" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Probar Módulo
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
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Cierres de Caja & Arqueos</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Apertura y cierre de turnos por cajero, segregación de ingresos en efectivo, tarjeta y pago móvil con descuadres automáticos.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['Caja Chica', 'Arqueos', 'Efectivo', 'Pago Móvil'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to="/registro" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Probar Módulo
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
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Cotizaciones & PDF</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  Emisión de presupuestos para clientes con vencimiento, exportables a PDF e imprimibles con un solo clic.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {['Cotizaciones', 'PDF', 'Clientes', 'Impresión'].map((t, i) => (
                    <span key={i} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to="/registro" style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '10px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center'
              }}>
                Probar Módulo
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* ─── 5. SECTION 3: NOTICIAS & ANUNCIOS ────────────────────────────── */}
      {noticias.length > 0 && (
        <section id="noticias" style={{ backgroundColor: '#ffffff', color: '#0f172a', padding: '80px 32px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
                Noticias & Anuncios de la Plataforma
              </h3>
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
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '12px 0 8px' }}>{noticia.titulo}</h4>
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
              Construyendo experiencias digitales excepcionales con React, Node.js y PostgreSQL. Plataforma web SaaS optimizada para comercios.
            </p>
          </div>

          <div>
            <h5 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>Síguenos & Contacto</h5>
            <div style={{ display: 'flex', gap: '14px' }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={githubIcon} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={linkedinIcon} /></a>
              <a href="mailto:arcila.juan10@gmail.com" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={emailIcon} /></a>
              <a href="https://wa.me/584127723148" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', fontSize: '1.2rem' }}><Icon icon={whatsappIcon} /></a>
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
