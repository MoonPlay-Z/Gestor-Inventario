/**
 * Configuración oficial de Métodos de Pago y Notificaciones SaaS
 */

const METODOS_PAGO_SAAS = {
  venezuela: {
    metodo: 'PAGO_MOVIL',
    bancos: ['Banesco', 'Banco de Venezuela', 'Bancamiga'],
    cedula: '30054384',
    telefono: '04127723148',
    instrucciones: 'Realizar Pago Móvil a cualquiera de los bancos indicados y reportar el número de referencia.'
  },
  internacional: {
    metodos: ['PayPal', 'Binance Pay', 'Zinly', 'Wally'],
    instrucciones: 'Transferir a la cuenta seleccionada y reportar el código o ID de transacción.'
  },
  correoNotificacion: process.env.ADMIN_NOTIFICACION_EMAIL || 'arcila.juan10@gmail.com'
};

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 8000;

/**
 * Envía un correo por la API HTTP de Resend cuando `RESEND_API_KEY` está
 * configurada. Sin clave, la notificación queda en el log del servidor (modo
 * desarrollo). No lanza: un fallo de correo nunca debe impedir registrar un pago.
 */
async function enviarCorreo({ to, subject, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { enviado: false, canal: 'log', motivo: 'RESEND_API_KEY no configurada' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.ADMIN_EMAIL_FROM || 'GestorPOS <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detalle = await response.text().catch(() => '');
      throw new Error(`Resend respondió ${response.status}${detalle ? `: ${detalle.slice(0, 300)}` : ''}`);
    }

    return { enviado: true, canal: 'resend' };
  } catch (err) {
    console.warn('[notificaciones] No se pudo enviar el correo:', err.message);
    return { enviado: false, canal: 'resend', motivo: err.message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Notifica al administrador que una empresa reportó un pago.
 */
async function enviarNotificacionPago({ usuarioId, username, nombreEmpresa, metodoPago, referencia, plan }) {
  const fecha = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });
  const mensaje = `
NUEVO PAGO REPORTADO - GESTOR INVENTARIO POS
-------------------------------------------------
Empresa / Usuario: ${nombreEmpresa} (@${username})
ID Usuario: ${usuarioId}
Plan: ${plan || 'Mensualidad'}
Método de Pago: ${metodoPago}
Referencia: ${referencia}
Fecha: ${fecha}
-------------------------------------------------
Revisa y resuelve la solicitud en Panel de Administración > Pagos.
  `.trim();

  console.log(`\n📧 [NOTIFICACIÓN -> ${METODOS_PAGO_SAAS.correoNotificacion}]\n${mensaje}\n`);

  return enviarCorreo({
    to: METODOS_PAGO_SAAS.correoNotificacion,
    subject: `Pago reportado: ${nombreEmpresa || username} (${referencia})`,
    text: mensaje,
  });
}

module.exports = {
  METODOS_PAGO_SAAS,
  enviarNotificacionPago,
  enviarCorreo,
};
