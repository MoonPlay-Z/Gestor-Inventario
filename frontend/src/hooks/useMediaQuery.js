import { useState, useEffect } from 'react';

/**
 * La navegación compacta aplica a teléfonos y tablets; desde 1024 px se
 * conserva el sidebar fijo de escritorio.
 */
export const QUERY_NAVEGACION_MOVIL = '(max-width: 1023px)';

/**
 * Devuelve `true` si la media query se cumple, y se mantiene reactivo a los
 * cambios de tamaño/orientación. Útil para elegir entre el diseño de escritorio
 * y el de móvil sin duplicar la lógica de negocio.
 *
 * @param {string} query - p. ej. '(min-width: 1024px)'
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
