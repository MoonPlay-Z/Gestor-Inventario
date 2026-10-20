import test from 'node:test';
import assert from 'node:assert/strict';

import {
  REINTENTO_TRAS_FALLO,
  REVISION_CADA,
  decidirAviso,
  decidirRevision,
} from './politica.js';

const HORA = 1_760_000_000_000;

test('la primera consulta siempre se hace', () => {
  assert.equal(decidirRevision({ ahora: HORA }).revisar, true);
});

test('una consulta correcta vale 24 h', () => {
  const hace23h = HORA - REVISION_CADA + 60_000;
  assert.deepEqual(decidirRevision({ ahora: HORA, ultimaCorrecta: hace23h }), {
    revisar: false,
    motivo: 'reciente',
  });
  assert.equal(decidirRevision({ ahora: HORA, ultimaCorrecta: HORA - REVISION_CADA }).revisar, true);
});

test('tras un fallo espera 30 min para reintentar', () => {
  const hace10min = HORA - 10 * 60 * 1000;
  assert.deepEqual(decidirRevision({ ahora: HORA, ultimoFallo: hace10min }), {
    revisar: false,
    motivo: 'espera-tras-fallo',
  });
  assert.equal(
    decidirRevision({ ahora: HORA, ultimoFallo: HORA - REINTENTO_TRAS_FALLO }).revisar,
    true,
  );
});

test('forzar ignora el throttle (y el backoff)', () => {
  assert.deepEqual(
    decidirRevision({ ahora: HORA, ultimaCorrecta: HORA, ultimoFallo: HORA, forzar: true }),
    { revisar: true, motivo: 'forzado' },
  );
});

test('no avisa si la publicada no es más nueva', () => {
  const r = decidirAviso({
    manifiesto: { versionCode: 9, minVersionCode: 0 },
    instalada: { versionCode: 9 },
  });
  assert.equal(r.avisar, false);
});

test('una versión aplazada no vuelve a molestar', () => {
  const r = decidirAviso({
    manifiesto: { versionCode: 9, minVersionCode: 0 },
    instalada: { versionCode: 8 },
    descartada: 9,
  });
  assert.equal(r.avisar, false);
});

test('pero sí si es obligatoria', () => {
  const r = decidirAviso({
    manifiesto: { versionCode: 9, minVersionCode: 9 },
    instalada: { versionCode: 8 },
    descartada: 9,
  });
  assert.deepEqual(r, { avisar: true, obligatoria: true });
});

test('minVersionCode igual a la instalada no obliga', () => {
  const r = decidirAviso({
    manifiesto: { versionCode: 10, minVersionCode: 8 },
    instalada: { versionCode: 8 },
  });
  assert.deepEqual(r, { avisar: true, obligatoria: false });
});
