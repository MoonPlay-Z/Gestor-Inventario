import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';

export function PrivacyPolicyPage() {
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
          Política de Privacidad
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
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', marginTop: '0' }}>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de tus datos personales es:
          </p>
          <ul>
            <li><strong>Nombre:</strong> Juan Arcila</li>
            <li><strong>Marca:</strong> GestorPOS</li>
            <li><strong>Email:</strong> arcila.juan10@gmail.com</li>
            <li><strong>WhatsApp:</strong> +58 412-7723148</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>2. Datos que recopilamos</h2>
          <p>Para proporcionarte nuestro servicio, recopilamos los siguientes datos:</p>
          
          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>2.1 Datos de registro</h3>
          <ul>
            <li>Nombre completo</li>
            <li>Dirección de email</li>
            <li>Contraseña (almacenada de forma cifrada)</li>
          </ul>

          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>2.2 Datos del negocio</h3>
          <ul>
            <li>Nombre del negocio</li>
            <li>RIF (Registro de Información Fiscal)</li>
            <li>Dirección del negocio</li>
            <li>Teléfono de contacto</li>
          </ul>

          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>2.3 Datos de uso</h3>
          <ul>
            <li>Productos y servicios que utilizas</li>
            <li>Historial de transacciones</li>
            <li>Preferencias de configuración</li>
          </ul>

          <h3 style={{ color: '#38bdf8', fontSize: '1.1rem' }}>2.4 Datos técnicos</h3>
          <ul>
            <li>Dirección IP</li>
            <li>Tipo de navegador y dispositivo</li>
            <li>Páginas visitadas y tiempo de permanencia</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>3. Finalidad del tratamiento</h2>
          <p>Utilizamos tus datos personales para las siguientes finalidades:</p>
          <ul>
            <li><strong>Gestión del servicio:</strong> Crear y administrar tu cuenta, proporcionar acceso al sistema POS</li>
            <li><strong>Facturación:</strong> Procesar pagos y emitir facturas</li>
            <li><strong>Comunicaciones:</strong> Enviar notificaciones sobre el servicio, actualizaciones y soporte técnico</li>
            <li><strong>Mejora del servicio:</strong> Analizar el uso del sistema para mejorar funcionalidades</li>
            <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones fiscales y legales</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>4. Base legal</h2>
          <p>
            El tratamiento de tus datos se basa en:
          </p>
          <ul>
            <li><strong>Consentimiento:</strong> Al registrarte, aceptas expresamente esta política de privacidad</li>
            <li><strong>Ejecución de contrato:</strong> Para proporcionar el servicio que has solicitado</li>
            <li><strong>Obligación legal:</strong> Para cumplir con regulaciones fiscales y contables</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>5. Destinatarios</h2>
          <p>
            No vendemos, alquilamos ni cedemos tus datos personales a terceros. Solo compartimos datos con:
          </p>
          <ul>
            <li><strong>Proveedores de hosting:</strong> Netlify (para alojar el sitio web)</li>
            <li><strong>Proveedores de análisis:</strong> Google Analytics (datos anónimos)</li>
            <li><strong>Autoridades competentes:</strong> Cuando sea requerido por ley</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>6. Plazo de conservación</h2>
          <p>
            Conservaremos tus datos personales durante:
          </p>
          <ul>
            <li><strong>Duración de la relación:</strong> Mientras mantengas activa tu cuenta</li>
            <li><strong>Después de la cancelación:</strong> 5 años adicionales para cumplir con obligaciones legales</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>7. Tus derechos</h2>
          <p>
            Como titular de los datos, tienes derecho a:
          </p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar información sobre los datos que tenemos sobre ti</li>
            <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
            <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos</li>
            <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos en ciertas circunstancias</li>
            <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
            <li><strong>Revocación del consentimiento:</strong> Retirar tu consentimiento en cualquier momento</li>
          </ul>
          <p>
            Para ejercer estos derechos, contáctanos a través de arcila.juan10@gmail.com o +58 412-7723148.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>8. Medidas de seguridad</h2>
          <p>
            Implementamos medidas de seguridad para proteger tus datos:
          </p>
          <ul>
            <li><strong>Cifrado:</strong> Las contraseñas se almacenan con cifrado bcrypt</li>
            <li><strong>Acceso restringido:</strong> Solo personal autorizado puede acceder a los datos</li>
            <li><strong>Copias de seguridad:</strong> Realizamos copias de seguridad periódicas</li>
            <li><strong>HTTPS:</strong> Todas las comunicaciones están cifradas</li>
          </ul>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>9. Menores de edad</h2>
          <p>
            Nuestro servicio no está dirigido a menores de 18 años. No recopilamos conscientemente datos de menores. Si eres padre/madre o tutor y crees que tu hijo ha proporcionado datos personales, contáctanos para eliminarlos.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>10. Desarrollo y mantenimiento con IA</h2>
          <p>
            Este sitio web ha sido desarrollado y es mantenido con asistencia de inteligencia artificial. Las decisiones finales sobre el tratamiento de datos son tomadas por el responsable del tratamiento indicado en esta política.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>11. Actualizaciones de esta política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos cualquier cambio significativo por email o mediante un aviso en nuestro sitio web. La fecha de última actualización se indica al inicio de este documento.
          </p>

          <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>12. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta Política de Privacidad o sobre el tratamiento de tus datos, puedes contactarnos:
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
