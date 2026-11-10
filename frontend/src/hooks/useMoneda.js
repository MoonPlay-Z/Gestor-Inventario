import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SIMBOLOS_MONEDA, formatMoneda, aNumero } from '../utils/numero';

const CLAVE_MONEDA = 'monedaVisual';

/**
 * Multimoneda del frontend: la moneda BASE de la empresa (USD por defecto, EUR
 * con base EUR) y la moneda de EXHIBICIÓN (USD/EUR/VES, default = base).
 *
 * El switch es puramente visual: convierte con la tasa base→exhibición usando la
 * tasa de la empresa (fuente del backend) y NO persiste nada en el servidor.
 *   - Con el switch en BASE se muestran los montos en `monedaBase`.
 *   - Con el switch en EXHIBICIÓN se muestran los montos en `monedaExhibicion`.
 *
 * Regla de visualización: con VES no se usan signos `$`/`€`; el signo de VES es
 * `Bs.`.
 */
export function useMoneda() {
  const { empresa } = useAuth();
  const empresaId = empresa?.id || null;

  const monedaBase = empresa?.monedaBase === 'EUR' ? 'EUR' : 'USD';
  const monedaExhibicion = empresa?.monedaExhibicion || monedaBase;

  const [modo, setModo] = useState(() => localStorage.getItem(`${CLAVE_MONEDA}:${empresaId}`) || 'exhibicion');

  // Al entrar a otra empresa se reinicia el switch visual.
  useEffect(() => {
    const guardado = localStorage.getItem(`${CLAVE_MONEDA}:${empresaId}`);
    setModo(guardado || 'exhibicion');
  }, [empresaId]);

  const usarExhibicion = modo === 'exhibicion';
  const monedaActual = usarExhibicion ? monedaExhibicion : monedaBase;

  const setUsarExhibicion = (usar) => {
    const nuevo = usar ? 'exhibicion' : 'base';
    setModo(nuevo);
    if (empresaId) localStorage.setItem(`${CLAVE_MONEDA}:${empresaId}`, nuevo);
  };

  // Tasa base → exhibición en uso (Bs por unidad de la base; VES per base).
  const tasaBaseAHacia = (monedaDestino = monedaExhibicion) => {
    if (monedaDestino === monedaBase) return 1;
    const tasa = Number(empresa?.tasaDolar);
    return isFinite(tasa) && tasa > 0 ? tasa : 1;
  };

  /** Convierte un monto en la moneda BASE a la moneda destino (base/exhibición/VES). */
  const convertir = (montoBase, monedaDestino = monedaActual) => {
    const destino = monedaDestino || monedaActual;
    const valor = aNumero(montoBase);
    if (destino === monedaBase) return valor;
    if (destino === 'VES') return valor * tasaBaseAHacia('VES');
    // Destino intermedio (p. ej. exhibición USD con base EUR): sin par directo
    // soportado por el backend, se devuelve el monto en base.
    return valor;
  };

  /** Convierte un monto desde una moneda (p. ej. VES) hacia la base. */
  const convertirDesde = (monto, monedaOrigen = 'VES') => {
    const valor = aNumero(monto);
    if (monedaOrigen === 'VES') {
      const tasa = tasaBaseAHacia('VES');
      return tasa > 0 ? valor / tasa : valor;
    }
    return valor;
  };

  const formatear = (monto, moneda = monedaActual) => formatMoneda(convertir(monto, moneda), moneda);

  return {
    monedaBase,
    monedaExhibicion,
    monedaActual,
    usarExhibicion,
    setUsarExhibicion,
    tasaBaseAHacia,
    convertir,
    convertirDesde,
    formatear,
    simbolo: (moneda = monedaActual) => SIMBOLOS_MONEDA[moneda] || SIMBOLOS_MONEDA[moneda === 'VES' ? 'VES' : moneda] || '$',
  };
}
