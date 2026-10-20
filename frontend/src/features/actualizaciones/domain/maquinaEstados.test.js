import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ESTADOS,
  EVENTOS,
  accionCerrar,
  esOcupado,
  puedeCerrar,
  transicion,
} from './maquinaEstados.js';

const TODOS = Object.values(ESTADOS);

test('todo estado ocupado se puede abandonar (regresión: modal bloqueado)', () => {
  for (const estado of TODOS) {
    if (esOcupado(estado)) {
      assert.equal(
        puedeCerrar(estado),
        true,
        `el estado "${estado}" no ofrece salida y bloquearía la app`,
      );
    }
  }
});

test('error siempre se puede cerrar, aunque sea obligatoria', () => {
  assert.equal(puedeCerrar(ESTADOS.ERROR, { obligatoria: true }), true);
});

test('una actualización obligatoria no se puede aplazar desde el aviso', () => {
  assert.equal(puedeCerrar(ESTADOS.AVISO, { obligatoria: true }), false);
  assert.equal(puedeCerrar(ESTADOS.AVISO, { obligatoria: false }), true);
});

test('cancelar el instalador devuelve al aviso', () => {
  assert.equal(transicion(ESTADOS.INSTALANDO, EVENTOS.VOLVER), ESTADOS.AVISO);
});

test('cancelar la descarga devuelve al aviso', () => {
  assert.equal(transicion(ESTADOS.DESCARGANDO, EVENTOS.CANCELAR), ESTADOS.AVISO);
  assert.equal(transicion(ESTADOS.VERIFICANDO, EVENTOS.CANCELAR), ESTADOS.AVISO);
});

test('un evento no declarado no cambia el estado', () => {
  assert.equal(transicion(ESTADOS.AVISO, EVENTOS.PROGRESO), ESTADOS.AVISO);
  assert.equal(transicion(ESTADOS.INSTALANDO, EVENTOS.CANCELAR), ESTADOS.INSTALANDO);
});

test('cerrar desde el aviso oculta el modal', () => {
  assert.equal(transicion(ESTADOS.AVISO, EVENTOS.CANCELAR), null);
  assert.equal(transicion(ESTADOS.ERROR, EVENTOS.CANCELAR), null);
});

test('el botón × hace lo correcto en cada fase', () => {
  assert.equal(accionCerrar(ESTADOS.AVISO), 'aplazar');
  assert.equal(accionCerrar(ESTADOS.ERROR), 'aplazar');
  assert.equal(accionCerrar(ESTADOS.DESCARGANDO), 'cancelar');
  assert.equal(accionCerrar(ESTADOS.VERIFICANDO), 'cancelar');
  assert.equal(accionCerrar(ESTADOS.INSTALANDO), 'volver');
});

test('desde cualquier estado se llega a una salida en pocos pasos', () => {
  const SALIDA = '__salida__';
  const eventos = Object.values(EVENTOS);

  for (const inicio of TODOS) {
    const vistos = new Set([inicio]);
    let frontera = [inicio];
    let alcanza = false;

    for (let paso = 0; paso < 6 && !alcanza; paso += 1) {
      const siguiente = [];
      for (const estado of frontera) {
        for (const evento of eventos) {
          const resultado = transicion(estado, evento);
          if (resultado === null) {
            alcanza = true;
            break;
          }
          if (resultado === ESTADOS.AVISO && puedeCerrar(ESTADOS.AVISO)) {
            alcanza = true;
            break;
          }
          if (!vistos.has(resultado)) {
            vistos.add(resultado);
            siguiente.push(resultado);
          }
        }
        if (alcanza) break;
      }
      frontera = siguiente;
    }

    assert.ok(alcanza, `el estado "${inicio}" no tiene salida (${SALIDA})`);
  }
});
