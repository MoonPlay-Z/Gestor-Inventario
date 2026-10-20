import { useState, useEffect } from 'react';

/**
 * Condición de "teléfono": pantallas estrechas o teléfonos en horizontal
 * (alto muy corto). Así el giroscopio no expulsa al usuario al diseño de
 * escritorio, que no cabe en 392 px de alto.
 */
export const QUERY_TELEFONO =
  '(max-width: 767px), (max-width: 1023px) and (max-height: 520px) and (orientation: landscape)';

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
