const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'backend', 'node_modules', '.prisma', 'client');
if (!fs.existsSync(clientDir)) {
  throw new Error(`No existe ${clientDir}. Ejecuta npm run prisma:generate.`);
}

const files = fs.readdirSync(clientDir);
const hasWindows = files.some((file) => file.includes('windows') && file.includes('query_engine'));
const hasLinux = files.some((file) =>
  (file.includes('linux') || file.includes('debian')) && file.includes('query_engine')
);

if (!hasWindows || !hasLinux) {
  throw new Error(`Faltan engines de Prisma. Linux=${hasLinux}, Windows=${hasWindows}. Ejecuta npm run prisma:generate.`);
}

console.log(`Prisma engines verificados: Linux=${hasLinux}, Windows=${hasWindows}`);
