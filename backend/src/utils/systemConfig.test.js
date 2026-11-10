const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test, after } = require('node:test');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gestor-config-'));
const dataDirOriginal = process.env.DATA_DIR;
process.env.DATA_DIR = dataDir;
const { configPath, getSystemConfig } = require('./systemConfig');

test('carga y conserva la moneda base y la moneda de exhibición guardadas', () => {
  fs.writeFileSync(configPath, JSON.stringify({
    moneda: {
      simbolo: '$',
      codigo: 'USD',
      tasaDolar: 37,
      monedaBase: 'USD',
      monedaExhibicion: 'VES',
    },
  }));

  const config = getSystemConfig();

  assert.equal(config.moneda.monedaBase, 'USD');
  assert.equal(config.moneda.monedaExhibicion, 'VES');
});

after(() => {
  if (dataDirOriginal === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = dataDirOriginal;
  fs.rmSync(dataDir, { recursive: true, force: true });
});
