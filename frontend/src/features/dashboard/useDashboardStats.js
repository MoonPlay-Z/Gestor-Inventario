/* =========================================================================
   Estado del dashboard como unión discriminada
   -------------------------------------------------------------------------
   Antes la página guardaba `stats` en `null` y pintaba `stats.facturas…`:
   si la API fallaba (sin red, timeout, suscripción) se producía un
   `TypeError` y la pantalla quedaba en blanco. Con este contrato el render
   siempre sabe en qué caso está y no puede desreferenciar datos ausentes.
   ========================================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import { API } from '../../services/api';

const INICIAL = { tipo: 'cargando', datos: null, error: '' };

export function useDashboardStats(periodo, { alFallar } = {}) {
  const [estado, setEstado] = useState(INICIAL);
  const [moneda, setMoneda] = useState('$');
  const solicitudActualRef = useRef(0);

  // El callback puede cambiar de identidad en cada render del consumidor;
  // se guarda en una ref para no reiniciar la carga en bucle.
  const alFallarRef = useRef(alFallar);
  useEffect(() => {
    alFallarRef.current = alFallar;
  }, [alFallar]);

  const cargar = useCallback(async () => {
    const solicitudActual = ++solicitudActualRef.current;
    setEstado((previo) => ({ ...previo, tipo: 'cargando', error: '' }));

    // La configuración de moneda es accesoria: si falla, las métricas se
    // cargan igualmente (antes un fallo de /config dejaba el dashboard vacío).
    const [config, metricas] = await Promise.allSettled([
      API.getConfig(),
      API.getDashboardStats(periodo),
    ]);

    if (solicitudActual !== solicitudActualRef.current) return;

    if (config.status === 'fulfilled' && config.value?.moneda?.simbolo) {
      setMoneda(config.value.moneda.simbolo);
    }

    if (metricas.status === 'fulfilled') {
      setEstado({ tipo: 'listo', datos: metricas.value, error: '' });
      return;
    }

    const mensaje = metricas.reason?.message || 'No se pudieron cargar las métricas.';
    setEstado((previo) => ({ tipo: 'error', datos: previo.datos, error: mensaje }));
    alFallarRef.current?.(mensaje);
  }, [periodo]);

  useEffect(() => {
    cargar();
    return () => {
      solicitudActualRef.current += 1;
    };
  }, [cargar]);

  return { estado, moneda, recargar: cargar };
}
