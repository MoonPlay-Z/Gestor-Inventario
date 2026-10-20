import test from 'node:test';
import assert from 'node:assert/strict';

import { esMasNueva, esObligatoria, validarManifiesto } from './manifiesto.js';

const SHA = 'a'.repeat(64);

const base = () => ({
  versionCode: 9,
  versionName: '1.8',
  url: 'https://gestor-pos.netlify.app/descargas/gestorpos-android.apk',
  sha256: SHA,
  size: 9347070,
  publishedAt: '2026-10-20',
  minVersionCode: 0,
  notes: ['Prueba'],
});

test('acepta un manifiesto completo y normaliza el hash a minúsculas', () => {
  const m = validarManifiesto({ ...base(), sha256: SHA.toUpperCase() });
  assert.ok(m);
  assert.equal(m.versionCode, 9);
  assert.equal(m.sha256, SHA);
  assert.deepEqual(m.notes, ['Prueba']);
});

test('descarta manifiestos que no cumplen el contrato', () => {
  assert.equal(validarManifiesto(null), null);
  assert.equal(validarManifiesto('texto'), null);
  assert.equal(validarManifiesto({ ...base(), versionCode: 'abc' }), null);
  assert.equal(validarManifiesto({ ...base(), versionCode: 0 }), null);
  assert.equal(validarManifiesto({ ...base(), url: 'http://inseguro/apk' }), null);
  assert.equal(validarManifiesto({ ...base(), sha256: '1234' }), null);
  assert.equal(validarManifiesto({ ...base(), size: 0 }), null);
  assert.equal(validarManifiesto({ ...base(), size: 'mucho' }), null);
});

test('filtra notas vacías y limita a 12', () => {
  const notas = Array.from({ length: 20 }, (_, i) => `nota ${i}`);
  const m = validarManifiesto({ ...base(), notes: [...notas, '', '   ', 42] });
  assert.equal(m.notes.length, 12);
  assert.ok(m.notes.every((n) => typeof n === 'string' && n.trim()));
});

test('esMasNueva compara versionCode, no strings', () => {
  assert.equal(esMasNueva({ versionCode: 10 }, { versionCode: 9 }), true);
  assert.equal(esMasNueva({ versionCode: 9 }, { versionCode: 9 }), false);
  assert.equal(esMasNueva({ versionCode: 8 }, { versionCode: 9 }), false);
  assert.equal(esMasNueva(null, { versionCode: 9 }), false);
});

test('esObligatoria depende de minVersionCode', () => {
  assert.equal(esObligatoria({ minVersionCode: 9 }, { versionCode: 8 }), true);
  assert.equal(esObligatoria({ minVersionCode: 9 }, { versionCode: 9 }), false);
  assert.equal(esObligatoria({ minVersionCode: 0 }, { versionCode: 1 }), false);
});
