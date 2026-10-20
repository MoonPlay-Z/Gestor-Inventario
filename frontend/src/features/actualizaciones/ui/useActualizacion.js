/* =========================================================================
   Hook: estado y acciones del aviso de actualización
   -------------------------------------------------------------------------
   Toda la lógica vive aquí (consulta, sondeo, ciclo de vida y transiciones);
   el componente solo pinta. La máquina de estados del dominio garantiza que
   ningún estado deje al usuario sin salida.
   ========================================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import { App } from '@capacitor/app';

import {
  ESPERA_ANTES_DE_REVISAR,
  abrirAjustesInstalacion,
  aplazarActualizacion,
  cancelarActualizacion,
  comprobarActualizacion,
  descargarActualizacion,
  esNativo,
  estadoActualizacion,
  hayPuenteActualizaciones,
  instalarActualizacion,
} from '../../../services/actualizaciones';
import {
  ESTADOS,
  EVENTOS,
  accionCerrar,
  puedeCerrar,
  transicion,
} from '../domain/maquinaEstados.js';

const RUTAS_OCUPADAS = ['/pos', '/caja'];
const INTERVALO_SONDEO = 700;
// Si el instalador de Android no llega a abrirse (o el usuario lo cancela sin
// que el sistema pause la app) no se puede quedar el aviso bloqueado.
const ESPERA_MAXIMA_INSTALADOR = 90 * 1000;

export function useActualizacion({ ruta = '/' } = {}) {
  const [aviso, setAviso] = useState(null);
  const [fase, setFase] = useState(ESTADOS.AVISO);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState('');
  const [nota, setNota] = useState('');

  const vivo = useRef(true);
  const sondeo = useRef(null);
  const temporizador = useRef(null);
  const faseRef = useRef(ESTADOS.AVISO);
  const avisoRef = useRef(null);
  const rutaRef = useRef(ruta);

  useEffect(() => {
    rutaRef.current = ruta;
  }, [ruta]);

  useEffect(() => {
    faseRef.current = fase;
  }, [fase]);

  const detenerSondeo = useCallback(() => {
    if (sondeo.current) {
      clearInterval(sondeo.current);
      sondeo.current = null;
    }
  }, []);

  const limpiarTemporizador = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  const ocultar = useCallback(() => {
    detenerSondeo();
    limpiarTemporizador();
    avisoRef.current = null;
    faseRef.current = ESTADOS.AVISO;
    setAviso(null);
    setFase(ESTADOS.AVISO);
    setProgreso(0);
    setError('');
    setNota('');
  }, [detenerSondeo, limpiarTemporizador]);

  /** Aplica un evento de la máquina de estados (o cierra el aviso con `null`). */
  const aplicar = useCallback(
    (evento, { mensaje = '' } = {}) => {
      const siguiente = transicion(faseRef.current, evento);
      if (siguiente === null) {
        ocultar();
        return;
      }
      faseRef.current = siguiente;
      setFase(siguiente);
      if (mensaje) setError(mensaje);
    },
    [ocultar],
  );

  const revisar = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    if (RUTAS_OCUPADAS.some((r) => rutaRef.current.startsWith(r))) return;
    if (avisoRef.current) return;
    try {
      const resultado = await comprobarActualizacion();
      if (!vivo.current || !resultado || avisoRef.current) return;
      avisoRef.current = resultado;
      setAviso(resultado);
    } catch {
      // Una consulta fallida nunca debe afectar a la operación de la caja.
    }
  }, []);

  const abrirInstalador = useCallback(async () => {
    const resultado = await instalarActualizacion();
    if (!vivo.current) return;

    if (resultado.permiso) {
      aplicar(EVENTOS.PERMISO);
      return;
    }
    if (!resultado.ok) {
      aplicar(EVENTOS.ERROR, { mensaje: resultado.motivo || 'No se pudo abrir el instalador.' });
      return;
    }

    aplicar(EVENTOS.INSTALAR);
    limpiarTemporizador();
    temporizador.current = setTimeout(() => {
      if (!vivo.current || faseRef.current !== ESTADOS.INSTALANDO) return;
      aplicar(EVENTOS.VOLVER);
      setNota('La instalación no se completó. Puedes intentarlo de nuevo.');
    }, ESPERA_MAXIMA_INSTALADOR);
  }, [aplicar, limpiarTemporizador]);

  const iniciarSondeo = useCallback(() => {
    detenerSondeo();
    sondeo.current = setInterval(async () => {
      const estado = await estadoActualizacion();
      if (!vivo.current || !estado) return;

      setProgreso(Number(estado.progreso) || 0);

      if (estado.estado === 'verificando') {
        aplicar(EVENTOS.VERIFICAR);
      } else if (estado.estado === 'error') {
        detenerSondeo();
        aplicar(EVENTOS.ERROR, { mensaje: estado.mensaje || 'La descarga falló. Inténtalo de nuevo.' });
      } else if (estado.estado === 'listo' || estado.estado === 'permiso') {
        detenerSondeo();
        aplicar(EVENTOS.VERIFICAR);
        abrirInstalador();
      }
    }, INTERVALO_SONDEO);
  }, [abrirInstalador, aplicar, detenerSondeo]);

  const actualizar = useCallback(async () => {
    const actual = avisoRef.current;
    if (!actual) return;

    if (!hayPuenteActualizaciones()) {
      // Sin puente nativo (navegador) no se puede instalar desde aquí.
      window.location.assign('/descargar');
      return;
    }

    setError('');
    setNota('');
    setProgreso(0);
    aplicar(EVENTOS.ACTUALIZAR);

    const inicio = await descargarActualizacion(actual.manifiesto);
    if (!vivo.current) return;
    if (!inicio.ok) {
      aplicar(EVENTOS.ERROR, { mensaje: inicio.motivo || 'No se pudo iniciar la descarga.' });
      return;
    }
    iniciarSondeo();
  }, [aplicar, iniciarSondeo]);

  const aplazar = useCallback(async () => {
    const actual = avisoRef.current;
    if (actual) aplazarActualizacion(actual.manifiesto.versionCode);
    await cancelarActualizacion();
    ocultar();
  }, [ocultar]);

  /** Botón ×: cambia de significado según la fase (cancelar, volver o aplazar). */
  const cerrar = useCallback(async () => {
    const accion = accionCerrar(faseRef.current);
    if (accion === 'volver') {
      limpiarTemporizador();
      aplicar(EVENTOS.VOLVER);
      return;
    }
    if (accion === 'cancelar') {
      await cancelarActualizacion();
      detenerSondeo();
      aplicar(EVENTOS.CANCELAR);
      return;
    }
    await aplazar();
  }, [aplazar, aplicar, detenerSondeo, limpiarTemporizador]);

  const reintentar = useCallback(() => {
    setError('');
    setNota('');
    setProgreso(0);
    aplicar(EVENTOS.REINTENTAR);
  }, [aplicar]);

  const continuar = useCallback(() => {
    abrirInstalador();
  }, [abrirInstalador]);

  const abrirAjustes = useCallback(() => {
    abrirAjustesInstalacion();
  }, []);

  // Arranque: revisión diferida + revisión al volver del instalador o de
  // segundo plano. El caso importante: si al volver seguimos en `instalando`,
  // el usuario canceló el instalador; se vuelve al aviso en vez de quedarse
  // con un modal sin botones.
  useEffect(() => {
    vivo.current = true;
    if (!esNativo()) return undefined;

    const temporizadorRevision = setTimeout(revisar, ESPERA_ANTES_DE_REVISAR);

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') revisar();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    let quitarApp = null;
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive || !vivo.current) return;
      if (faseRef.current === ESTADOS.INSTALANDO) {
        limpiarTemporizador();
        aplicar(EVENTOS.VOLVER);
        setNota('La instalación no se completó. Puedes intentarlo de nuevo.');
        return;
      }
      revisar();
    }).then((handle) => {
      if (vivo.current) quitarApp = handle;
      else handle.remove();
    });

    return () => {
      vivo.current = false;
      clearTimeout(temporizadorRevision);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      quitarApp?.remove();
      detenerSondeo();
      limpiarTemporizador();
    };
  }, [aplicar, detenerSondeo, limpiarTemporizador, revisar]);

  const obligatoria = !!aviso?.obligatoria;

  return {
    aviso,
    fase,
    progreso,
    error,
    nota,
    obligatoria,
    ocupado: fase === ESTADOS.DESCARGANDO || fase === ESTADOS.VERIFICANDO || fase === ESTADOS.INSTALANDO,
    puedeCerrar: !!aviso && puedeCerrar(fase, { obligatoria }),
    acciones: { actualizar, aplazar, cerrar, reintentar, continuar, abrirAjustes },
  };
}

export default useActualizacion;
