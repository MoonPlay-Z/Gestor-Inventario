/**
 * EJEMPLOS DE USO — CSS Modules en este proyecto
 *
 * Configuración en vite.config.js:
 *   css: {
 *     modules: {
 *       localsConvention: 'camelCaseOnly',
 *       generateScopedName: '[name]__[local]___[hash:base64:5]',
 *     },
 *   }
 *
 * Esto genera nombres como: Button__btnPrimary___a1b2c
 * Se importan como objeto `styles` y se accede en camelCase: styles.btnPrimary
 */

// ============================================
// 1. IMPORTAR ESTILOS DESDE BARREL EXPORT
// ============================================
import { buttonStyles, modalStyles, formStyles, tableStyles, badgeStyles, toastStyles, cardStyles } from '@/components/ui';

// ============================================
// 2. IMPORTAR DESDE ARCHIVO DIRECTO (recomendado)
// ============================================
import buttonStyles from '@/components/ui/Button.module.css';
import modalStyles from '@/components/ui/Modal.module.css';
import formStyles from '@/components/ui/Form.module.css';
import tableStyles from '@/components/ui/Table.module.css';
import badgeStyles from '@/components/ui/Badge.module.css';
import toastStyles from '@/components/ui/Toast.module.css';
import cardStyles from '@/components/ui/Card.module.css';

// ============================================
// 3. EJEMPLOS DE USO EN COMPONENTES
// ============================================

// --- Button ---
function MiBoton() {
  return (
    <button className={buttonStyles.btn} >
      <span className={buttonStyles.btnPrimary}>Primario</span>
      <span className={buttonStyles.btnSecondary}>Secundario</span>
      <span className={`${buttonStyles.btn} ${buttonStyles.btnDanger}`}>Peligro</span>
      <span className={`${buttonStyles.btn} ${buttonStyles.btnSm}`}>Pequeño</span>
    </button>
  );
}

// --- Modal ---
function MiModal({ open, onClose, children }) {
  return (
    <div className={`${modalStyles.overlay} ${open ? modalStyles.overlayOpen : ''}`}>
      <div className={modalStyles.modal}>
        <div className={modalStyles.header}>
          <h3 className={modalStyles.title}>Título</h3>
          <button className={modalStyles.close} onClick={onClose}>✕</button>
        </div>
        <div>{children}</div>
        <div className={modalStyles.footer}>
          <button className={`${buttonStyles.btn} ${buttonStyles.btnSecondary}`} onClick={onClose}>Cancelar</button>
          <button className={`${buttonStyles.btn} ${buttonStyles.btnPrimary}`}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// --- Form ---
function MiFormulario() {
  return (
    <form>
      <div className={formStyles.formGroup}>
        <label className={formStyles.label}>Email <span className={formStyles.required}>*</span></label>
        <input
          type="email"
          className={`${formStyles.control} ${formStyles.controlError}`}
          placeholder="usuario@ejemplo.com"
        />
        <p className={`${formStyles.error} ${formStyles.errorVisible}`}>Email inválido</p>
      </div>

      <div className={`${formStyles.grid} ${formStyles.grid2}`}>
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>Nombre</label>
          <input type="text" className={formStyles.control} />
        </div>
        <div className={formStyles.formGroup}>
          <label className={formStyles.label}>Apellido</label>
          <input type="text" className={formStyles.control} />
        </div>
      </div>
    </form>
  );
}

// --- Table ---
function MiTabla({ datos }) {
  return (
    <div className={tableStyles.wrapper}>
      <table className={tableStyles.table}>
        <thead className={tableStyles.thead}>
          <tr>
            <th className={tableStyles.th}>Producto</th>
            <th className={tableStyles.th}>Precio</th>
            <th className={tableStyles.th}>Stock</th>
          </tr>
        </thead>
        <tbody className={tableStyles.tbody}>
          {datos.map(item => (
            <tr key={item.id}>
              <td className={tableStyles.td}>{item.nombre}</td>
              <td className={tableStyles.td}>{item.precio}</td>
              <td className={tableStyles.td}>{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Badge ---
function EstadoBadge({ estado }) {
  const variantMap = {
    PENDING: badgeStyles.warning,
    PAID: badgeStyles.success,
    PARTIALLY_PAID: badgeStyles.info,
    VOIDED: badgeStyles.danger,
  };
  return <span className={variantMap[estado] || badgeStyles.neutral}>{estado}</span>;
}

// --- Toast ---
function MiToast({ mensaje, tipo, onClose }) {
  return (
    <div className={`${toastStyles.toast} ${toastStyles[tipo]}`}>
      <span className={toastStyles.msg}>{mensaje}</span>
      <button className={toastStyles.close} onClick={onClose}>✕</button>
    </div>
  );
}

// --- Card ---
function MiCard({ titulo, children }) {
  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.header}>
        <h3 className={cardStyles.title}>{titulo}</h3>
      </div>
      {children}
    </div>
  );
}

// ============================================
// 4. COMBINAR CLASES GLOBALES + MODULE
// ============================================

// Para componentes que usan Tailwind global + CSS Module específico:
function BotonHibrido() {
  // Tailwind para layout, CSS Module para estilos de botón
  return (
    <button className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} w-full md:w-auto`}>
      Guardar
    </button>
  );
}

// ============================================
// 5. CONDICIONALES DE CLASES
// ============================================

function BotonConEstados({ variante, tamaño, deshabilitado, children }) {
  const clases = [
    buttonStyles.btn,
    buttonStyles[`btn${variante.charAt(0).toUpperCase() + variante.slice(1)}`], // btnPrimary, btnSecondary...
    buttonStyles[`btn${tamaño.charAt(0).toUpperCase() + tamaño.slice(1)}`],     // btnSm, btnLg...
    deshabilitado && 'opacity-50 cursor-not-allowed', // Tailwind para estados
  ].filter(Boolean).join(' ');

  return <button className={clases} disabled={deshabilitado}>{children}</button>;
}

// Uso: <BotonConEstados variante="primary" tamaño="sm">Guardar</BotonConEstados>