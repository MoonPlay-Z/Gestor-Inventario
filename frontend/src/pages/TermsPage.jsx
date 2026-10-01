import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';

export function TermsPage() {
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
          Términos y Condiciones
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
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', marginTop: '0' }}>1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar GestorPOS, aceptas estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>2. Descripción del servicio</h2>
          <p>
            GestorPOS es un sistema de punto de venta (POS) y gestión de inventario basado en la nube (SaaS) diseñado para comercios en Venezuela. El servicio incluye:
          </p>
          <ul>
            <li>Registro de ventas y facturación</li>
            <li>Gestión de inventario con alertas de stock</li>
            <li>Control de caja y cierres de turno</li>
            <li>Gestión de clientes y cuentas por cobrar</li>
            <li>Reportes y análisis del negocio</li>
            <li>Soporte técnico por email y WhatsApp</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>3. Cuenta de usuario</h2>
          <p>
            Para utilizar el servicio, debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de:
          </p>
          <ul>
            <li>Mantener la confidencialidad de tus credenciales de acceso</li>
            <li>Todas las actividades que ocurran bajo tu cuenta</li>
            <li>Notificarnos inmediatamente cualquier uso no autorizado</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>4. Uso aceptable</h2>
          <p>Te comprometes a no:</p>
          <ul>
            <li>Utilizar el servicio para actividades ilegales o fraudulentas</li>
            <li>Revender, sublicenciar o compartir tu acceso con terceros</li>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Interferir o interrumpir el funcionamiento del servicio</li>
            <li>Utilizar el servicio para almacenar contenido ilegal o ofensivo</li>
            <li>Realizar ingeniería inversa del software</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>5. Propiedad intelectual</h2>
          <p>
            Todo el contenido, diseño, código y funcionalidades de GestorPOS son propiedad exclusiva de Juan Arcila y están protegidos por leyes de propiedad intelectual. No se otorga ningún derecho de uso, reproducción o distribución sin autorización expresa.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>6. Pagos y facturación</h2>
          <p>
            El servicio se ofrece mediante planes de suscripción. Al contratar un plan:
          </p>
          <ul>
            <li>Aceptas pagar la tarifa correspondiente al plan seleccionado</li>
            <li>Los pagos se procesan por adelantado y no son reembolsables</li>
            <li>Los precios pueden ser modificados con 30 días de anticipación</li>
            <li>La falta de pago puede resultar en la suspensión del servicio</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>7. Disponibilidad del servicio</h2>
          <p>
            Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos disponibilidad ininterrumpida. El servicio puede estar temporalmente no disponible por:
          </p>
          <ul>
            <li>Mantenimiento programado</li>
            <li>Actualizaciones del sistema</li>
            <li>Problemas técnicos fuera de nuestro control</li>
            <li>Casos de fuerza mayor</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>8. Limitación de responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley, GestorPOS no será responsable por:
          </p>
          <ul>
            <li>Daños indirectos, incidentales o consecuenciales</li>
            <li>Pérdida de datos o ingresos</li>
            <li>Interrupciones del servicio por causas ajenas a nuestro control</li>
            <li>Decisiones comerciales basadas en la información del sistema</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>9. Modificaciones del servicio</h2>
          <p>
            Nos reservamos el derecho de modificar, suspender o descontinuar cualquier aspecto del servicio en cualquier momento. Te notificaremos sobre cambios significativos con anticipación razonable.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>10. Terminación</h2>
          <p>
            Puedes cancelar tu cuenta en cualquier momento. Podemos suspender o cancelar tu cuenta si:
          </p>
          <ul>
            <li>Incumples estos Términos y Condiciones</li>
            <li>Utilizas el servicio de manera fraudulenta o ilegal</li>
            <li>No pagas las cuotas correspondientes</li>
          </ul>
          <p>
            Al cancelar, tendrás acceso hasta el final del período pagado. Después de eso, tus datos serán eliminados según nuestra Política de Privacidad.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>11. Ley aplicable</h2>
          <p>
            Estos Términos y Condiciones se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier disputa será resuelta ante los tribunales competentes de Venezuela.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>12. Contacto</h2>
          <p>
            Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos:
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
