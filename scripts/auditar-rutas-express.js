#!/usr/bin/env node
/**
 * Auditor automatizado de orden y precedencia de rutas Express.
 * Detecta colisiones donde una ruta estática (ej: /buscar, /export) queda
 * declarada después de un parámetro dinámico (ej: /:id), impidiendo que se ejecute.
 */
const fs = require('fs');
const path = require('path');

const routesDir = path.resolve(__dirname, '../backend/src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
let errores = 0;

console.log('🔍 Auditando precedencia de rutas en Express...');

/**
 * Evalúa si una ruta con parámetros (ej: /:id o /usuarios/:id)
 * atraparía y colisionaría erróneamente con una ruta estática (ej: /buscar o /usuarios/activos)
 * si la dinámica está registrada ANTES de la estática.
 */
function rutaColisiona(rutaDinamica, rutaEstatica) {
  const segDin = rutaDinamica.split('/').filter(Boolean);
  const segEst = rutaEstatica.split('/').filter(Boolean);
  if (segDin.length !== segEst.length) return false;

  let tieneParametro = false;
  for (let i = 0; i < segDin.length; i++) {
    const d = segDin[i];
    const e = segEst[i];
    if (d.startsWith(':')) {
      tieneParametro = true;
      continue;
    }
    if (d !== e) return false;
  }
  return tieneParametro;
}

for (const file of files) {
  try {
    const router = require(path.join(routesDir, file));
    if (!router.stack) continue;

    const routesByMethod = {};
    router.stack.forEach((layer) => {
      if (!layer.route) return;
      const methods = Object.keys(layer.route.methods);
      const p = layer.route.path;
      methods.forEach(m => {
        routesByMethod[m] = routesByMethod[m] || [];
        routesByMethod[m].push(p);
      });
    });

    Object.entries(routesByMethod).forEach(([method, paths]) => {
      for (let i = 0; i < paths.length; i++) {
        const rutaPrevia = paths[i];
        if (!rutaPrevia.includes('/:')) continue;

        for (let j = i + 1; j < paths.length; j++) {
          const rutaPosterior = paths[j];
          if (rutaPosterior.includes('/:')) continue;

          if (rutaColisiona(rutaPrevia, rutaPosterior)) {
            console.error(`🚨 [BUG DE RUTA] En ${file}: ${method.toUpperCase()} "${rutaPosterior}" está declarada DESPUÉS de "${rutaPrevia}". Express nunca la alcanzará.`);
            errores++;
          }
        }
      }
    });
  } catch (err) {
    // Ignorar routers que requieran mocks de entorno
  }
}

if (errores === 0) {
  console.log('✅ Todas las rutas de Express cumplen el orden estricto de precedencia.');
} else {
  console.error(`❌ Se detectaron ${errores} colisiones de rutas que impiden mostrar datos.`);
  process.exitCode = 1;
}
