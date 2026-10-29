/* Resumen de Cuentas por Cobrar del dashboard (consulta independiente). */
import { useCallback, useEffect, useState } from 'react';
import { API } from '../../services/api';

export function useCxcResumen() {
  const [resumen, setResumen] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vivo = true;

    API.getCxcResumen()
      .then((datos) => {
        if (vivo) setResumen(datos);
      })
      .catch((error) => {
        // Es un widget accesorio: su fallo no debe romper el dashboard.
        console.error('Error loading CxC resumen:', error);
      });

    return () => {
      vivo = false;
    };
  }, [version]);

  // Permite que el botón «Recargar» del dashboard refresque también el widget.
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { resumen, recargar };
}
