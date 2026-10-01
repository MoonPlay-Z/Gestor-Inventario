import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';

const articles = [
  {
    slug: 'control-inventario-tienda',
    title: 'Cómo controlar el inventario de tu tienda en Venezuela (Guía 2026)',
    excerpt: 'Aprende las mejores prácticas para mantener el control de inventario de tu comercio. Evita pérdidas, optimiza stock y mejora la rentabilidad.',
    category: 'Inventario',
    readTime: '8 min',
    date: '2026-10-01'
  },
  {
    slug: 'facturacion-pequenos-comercios',
    title: 'Facturación para pequeños comercios: guía completa 2026',
    excerpt: 'Todo lo que necesitas saber sobre facturación en Venezuela. Requisitos, tipos de facturas y cómo simplificar el proceso.',
    category: 'Facturación',
    readTime: '10 min',
    date: '2026-10-01'
  },
  {
    slug: 'errores-inventario',
    title: '5 errores que cometen los comercios con su inventario',
    excerpt: 'Identifica los errores más comunes en la gestión de inventario y aprende a evitarlos para mejorar la rentabilidad de tu negocio.',
    category: 'Inventario',
    readTime: '6 min',
    date: '2026-10-01'
  },
  {
    slug: 'como-elegir-sistema-pos',
    title: 'Cómo elegir un sistema POS para tu negocio en Venezuela',
    excerpt: 'Guía práctica para seleccionar el punto de venta ideal. Características, precios y consideraciones clave para tu comercio.',
    category: 'Sistemas POS',
    readTime: '9 min',
    date: '2026-10-01'
  },
  {
    slug: 'inventario-manual-vs-sistema',
    title: 'Inventario manual vs sistema: cuándo dar el salto',
    excerpt: 'Comparación detallada entre gestión manual y sistemas automatizados. Descubre cuándo es el momento de digitalizar tu inventario.',
    category: 'Inventario',
    readTime: '7 min',
    date: '2026-10-01'
  },
  {
    slug: 'aumentar-ventas-datos',
    title: 'Cómo aumentar ventas en tu tienda con datos',
    excerpt: 'Aprende a usar los datos de tu negocio para tomar mejores decisiones y aumentar las ventas de tu comercio.',
    category: 'Ventas',
    readTime: '8 min',
    date: '2026-10-01'
  },
  {
    slug: 'facturacion-electronica-venezuela',
    title: 'Guía de facturación electrónica en Venezuela 2026',
    excerpt: 'Todo sobre la facturación electrónica en Venezuela: requisitos legales, implementación y beneficios para tu comercio.',
    category: 'Facturación',
    readTime: '11 min',
    date: '2026-10-01'
  },
  {
    slug: 'administrar-multiples-productos',
    title: 'Cómo administrar múltiples productos sin perder el control',
    excerpt: 'Estrategias y herramientas para gestionar un catálogo amplio de productos de forma eficiente y organizada.',
    category: 'Inventario',
    readTime: '7 min',
    date: '2026-10-01'
  }
];

const trialWhatsAppUrl = 'https://wa.me/584127723148?text=Hola%2C%20quiero%20solicitar%20la%20activaci%C3%B3n%20del%20mes%20de%20prueba%20gratis%20para%20mi%20negocio.';

export function BlogPage() {
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
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
        </Link>
        <Link to="/" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 32px 60px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Blog de GestorPOS
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Guías, consejos y recursos para mejorar la gestión de tu comercio en Venezuela
        </p>
      </section>

      {/* Articles Grid */}
      <section style={{ padding: '0 32px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px'
                }}>
                  {article.category}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {article.readTime}
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.4, color: '#ffffff' }}>
                {article.title}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
                {article.excerpt}
              </p>
              <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
                Leer artículo →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '60px 32px', backgroundColor: '#1e293b', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px' }}>
            ¿Listo para mejorar la gestión de tu comercio?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Solicita un mes de prueba gratuita y descubre cómo GestorPOS puede ayudarte a controlar tu inventario y aumentar tus ventas.
          </p>
          <a
            href={trialWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '14px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)'
            }}
          >
            Solicitar mes de prueba gratis
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} GestorPOS — Sistema POS para comercios en Venezuela
        </p>
      </footer>
    </div>
  );
}
