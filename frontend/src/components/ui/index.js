/**
 * Barrel export — componentes UI reutilizables
 * Importa desde: '@/components/ui' o '../components/ui'
 */
export { Button } from './Button';
export { RoleGuard, useRole, ROLES, ROLE_GROUPS } from './RoleGuard';
export { NavItem, NavSection } from './NavItem';
export { FieldError, FieldSuccess } from './FieldError';
export { FormError, FormSuccess } from './FormError';

// CSS Modules — usar como: import styles from '@/components/ui/Button.module.css'
export { default as buttonStyles } from './Button.module.css';
export { default as modalStyles } from './Modal.module.css';
export { default as formStyles } from './Form.module.css';
export { default as tableStyles } from './Table.module.css';
export { default as badgeStyles } from './Badge.module.css';
export { default as toastStyles } from './Toast.module.css';
export { default as cardStyles } from './Card.module.css';
