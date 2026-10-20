/* Resumen de Cuentas por Cobrar del dashboard (consulta independiente). */
import { useEffect, useState } from 'react';
import { API } from '../../services/api';

export function useCxcResumen() {
  const [resumen, setResumen] = useState(null);

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
  }, []);

  return resumen;
}
