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
  correoNotificacion: 'arcila.juan10@gmail.com'
};

/**
 * Notificar pago por correo electrónico (Simulado / Logger + Hook de envío)
 */
async function enviarNotificacionPago({ usuarioId, username, nombreEmpresa, metodoPago, referencia, plan }) {
  const fecha = new Date().toLocaleString('es-VE');
  const mensaje = `
  📌 NUEVO PAGO REPORTADO - GESTOR INVENTARIO POS
  -------------------------------------------------
  Empresa / Usuario: ${nombreEmpresa} (@${username})
  ID Usuario: ${usuarioId}
  Plan: ${plan || 'Mensualidad'}
  Método de Pago: ${metodoPago}
  Referencia: ${referencia}
  Fecha: ${fecha}
  -------------------------------------------------
  Enviar notificación formal a: ${METODOS_PAGO_SAAS.correoNotificacion}
  `;

  console.log(`\n📧 [EMAIL SENT -> ${METODOS_PAGO_SAAS.correoNotificacion}]\n${mensaje}\n`);
  return true;
}

module.exports = {
  METODOS_PAGO_SAAS,
  enviarNotificacionPago
};
