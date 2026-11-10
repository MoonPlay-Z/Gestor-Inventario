const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hashFila,
  mensajeErrorSeguro,
  sanitizar,
  verificarFilas,
} = require('./bitacora');

function registro(id, hashAnterior, cambios = {}) {
  const fila = {
    id,
    empresaId: 'empresa-1',
    usuarioId: 'usuario-1',
    usuarioNombre: 'Operador',
    usuarioRol: 'CAJA',
    categoria: 'INVENTARIO',
    modulo: 'productos',
    accion: 'PRODUCTO_MODIFICADO',
    entidad: 'Producto',
    entidadId: 'producto-1',
    descripcion: 'Cambió el precio',
    datosAnteriores: '{"precioVenta":1}',
    datosNuevos: '{"precioVenta":2}',
    monto: null,
    ipAddress: '127.0.0.1',
    userAgent: 'test',
    creadoEn: new Date('2026-10-30T12:00:00.000Z'),
    hashAnterior,
    ...cambios,
  };
  fila.hash = hashFila(hashAnterior || '', fila);
  return fila;
}

test('sanitiza secretos recursivamente sin alterar los campos públicos', () => {
  assert.deepEqual(
    sanitizar({
      username: 'caja',
      passwordHash: 'no-guardar',
      refreshToken: 'no-guardar',
      perfil: { ApiKey: 'no-guardar', nombre: 'Operador' },
    }),
    {
      username: 'caja',
      perfil: { nombre: 'Operador' },
    },
  );
});

test('redacta credenciales de las URL en errores de conexión', () => {
  const mensaje = mensajeErrorSeguro(new Error(
    'No conecta a postgresql://auditor:clave@db.example/neondb',
  ));
  assert.equal(mensaje.includes('clave@'), false);
  assert.match(mensaje, /postgresql:\/\/\[redacted\]@db\.example/);
});

test('verifica una cadena válida y detecta contenido alterado', () => {
  const primero = registro('1', null);
  const segundo = registro('2', primero.hash, {
    creadoEn: new Date('2026-10-30T12:00:00.001Z'),
    httpMethod: 'POST',
    httpPath: '/api/productos',
    httpStatus: 201,
    duracionMs: 42,
  });

  assert.deepEqual(verificarFilas([primero, segundo]), {
    valido: true,
    registrosVerificados: 2,
  });

  const alterado = { ...segundo, descripcion: 'Contenido alterado' };
  assert.equal(verificarFilas([primero, alterado]).valido, false);
  assert.equal(verificarFilas([primero, { ...segundo, httpStatus: 500 }]).valido, false);
});

test('detecta un registro faltante entre dos hashes encadenados', () => {
  const primero = registro('1', null);
  const segundo = registro('2', primero.hash, {
    creadoEn: new Date('2026-10-30T12:00:00.001Z'),
  });
  const tercero = registro('3', segundo.hash, {
    creadoEn: new Date('2026-10-30T12:00:00.002Z'),
  });

  assert.deepEqual(verificarFilas([primero, tercero]), {
    valido: false,
    registroId: tercero.id,
    motivo: 'La cadena de hashes está interrumpida',
  });
});
