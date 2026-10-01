import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';

export function CookiePolicyPage() {
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

      {/* Content */}
      <article style={{ padding: '60px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '8px' }}>
          Política de Cookies
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '40px' }}>
          Última actualización: 1 de octubre de 2026
        </p>

        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          lineHeight: 1.8,
          fontSize: '1rem',
          color: '#cbd5e1'
        }}>
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', marginTop: '0' }}>1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (computadora, tablet o teléfono móvil) cuando visitas un sitio web. Son ampliamente utilizadas para hacer que los sitios web funcionen de manera más eficiente y para proporcionar información a los propietarios del sitio.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>2. Tipos de cookies que utilizamos</h2>
          <p>En GestorPOS utilizamos los siguientes tipos de cookies:</p>
          
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>2.1 Cookies técnicas (necesarias)</h3>
          <p>
            Estas cookies son esenciales para el funcionamiento del sitio web. No pueden ser desactivadas ya que son necesarias para:
          </p>
          <ul>
            <li>Mantener tu sesión iniciada</li>
            <li>Recordar tus preferencias de tema (claro/oscuro)</li>
            <li>Garantizar la seguridad del sitio</li>
            <li>Almacenar tu consentimiento de cookies</li>
          </ul>
          <p><strong>Estas cookies no requieren tu consentimiento previo.</strong></p>

          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>2.2 Cookies analíticas</h3>
          <p>
            Estas cookies nos permiten contar las visitas y fuentes de tráfico para poder medir y mejorar el rendimiento de nuestro sitio. Toda la información recogida es anónima.
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> Nos ayuda a entender cómo los visitantes interactúan con el sitio</li>
          </ul>
          <p><strong>Estas cookies solo se instalan con tu consentimiento previo.</strong></p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>3. Cookies de terceros</h2>
          <p>
            Nuestro sitio puede incluir contenido de terceros que puede instalar sus propias cookies:
          </p>
          <ul>
            <li><strong>Netlify:</strong> Proveedor de hosting del sitio</li>
            <li><strong>Google Fonts:</strong> Fuentes tipográficas</li>
            <li><strong>WhatsApp:</strong> Enlaces de contacto</li>
          </ul>
          <p>
            No tenemos control sobre las cookies instaladas por terceros. Te recomendamos revisar las políticas de privacidad de estos servicios.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>4. ¿Cómo gestionar las cookies?</h2>
          <p>
            Puedes gestionar las cookies de varias maneras:
          </p>
          
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>4.1 A través de nuestro banner de cookies</h3>
          <p>
            En tu primera visita, te mostramos un banner donde puedes aceptar todas las cookies, rechazar las no necesarias o personalizar tu selección.
          </p>

          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>4.2 A través de tu navegador</h3>
          <p>
            Puedes configurar tu navegador para que bloquee o elimine las cookies. Ten en cuenta que si desactivas las cookies técnicas, algunas funciones del sitio pueden no funcionar correctamente.
          </p>
          <ul>
            <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
            <li><strong>Firefox:</strong> Preferencias → Privacidad y seguridad → Cookies</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
            <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>5. Duración de las cookies</h2>
          <p>
            Las cookies pueden ser de sesión (se eliminan al cerrar el navegador) o persistentes (permanecen en tu dispositivo durante un período determinado):
          </p>
          <ul>
            <li><strong>Cookies de sesión:</strong> Se eliminan al cerrar el navegador</li>
            <li><strong>Cookies de consentimiento:</strong> 12 meses</li>
            <li><strong>Cookies de preferencias:</strong> 12 meses</li>
            <li><strong>Cookies analíticas:</strong> Hasta 2 años</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>6. Actualizaciones de esta política</h2>
          <p>
            Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en las cookies que utilizamos u otras razones operativas, legales o regulatorias. Te recomendamos revisar esta página regularmente.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>7. Contacto</h2>
          <p>
            Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos:
          </p>
          <ul>
            <li><strong>Email:</strong> arcila.juan10@gmail.com</li>
            <li><strong>WhatsApp:</strong> +58 412-7723148</li>
          </ul>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
          © 2026 GestorPOS — Sistema POS para comercios en Venezuela
        </p>
        <p style={{ color: '#475569', fontSize: '0.8rem' }}>
          Sitio desarrollado y mantenido con asistencia de inteligencia artificial.
        </p>
      </footer>
    </div>
  );
}
