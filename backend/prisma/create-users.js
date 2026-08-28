/**
 * create-users.js — Bootstrap de usuarios del sistema
 * Crea o actualiza todos los usuarios con contraseñas hasheadas correctamente.
 * Es IDEMPOTENTE: se puede ejecutar múltiples veces sin duplicados.
 *
 * Uso:
 *   cd backend
 *   node prisma/create-users.js
 */

const { PrismaClient: PostgreSqlClient } = require('@prisma/client');
const { PrismaClient: SqliteClient }    = require('../src/generated/prisma-sqlite');
const bcrypt = require('bcrypt');

const useSqlite = process.env.DB_PROVIDER === 'sqlite' || process.env.DATABASE_URL?.startsWith('file:');
const prisma    = useSqlite ? new SqliteClient() : new PostgreSqlClient();
const SALT_ROUNDS = 10;

async function hash(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('👤 Creando/actualizando usuarios del sistema...\n');

  const usuarios = [
    // ─── Administrador global del sistema SaaS ──────────────────────────────
    {
      username: 'superadmin',
      password: 'SuperAdmin2024!',
      nombre:   'Administrador del Sistema',
      rol:      'SUPER_ADMIN',
      activo:   true,
      subscriptionStatus: 'active',
    },
    // ─── Empresa de demostración / cliente de prueba ─────────────────────────
    {
      username: 'empresa_demo',
      password: 'Empresa2024!',
      nombre:   'Empresa Demo S.A.',
      rol:      'EMPRESA',
      activo:   true,
      subscriptionStatus: 'active',
    },
    // ─── Operador de caja ────────────────────────────────────────────────────
    {
      username: 'cajero1',
      password: 'Cajero2024!',
      nombre:   'Operador de Caja',
      rol:      'CAJA',
      activo:   true,
      subscriptionStatus: 'active',
    },
    // ─── Encargado de inventario ─────────────────────────────────────────────
    {
      username: 'inventario1',
      password: 'Inventario2024!',
      nombre:   'Encargado de Inventario',
      rol:      'INVENTARIO',
      activo:   true,
      subscriptionStatus: 'active',
    },
  ];

  for (const u of usuarios) {
    const passwordHash = await hash(u.password);

    // upsert: si el username existe, actualiza el hash y los campos.
    // Si no existe, lo crea. Nunca duplica.
    const result = await prisma.usuario.upsert({
      where:  { username: u.username },
      update: {
        passwordHash,
        nombre: u.nombre,
        rol:    u.rol,
        activo: u.activo,
        subscriptionStatus: u.subscriptionStatus,
      },
      create: {
        username: u.username,
        passwordHash,
        nombre:   u.nombre,
        rol:      u.rol,
        activo:   u.activo,
        subscriptionStatus: u.subscriptionStatus,
      },
    });

    console.log(`✅ ${result.rol.padEnd(12)} │ usuario: ${result.username.padEnd(16)} │ contraseña: ${u.password}`);
  }

  console.log('\n⚠️  Guarda estas credenciales en un lugar seguro y cambia las contraseñas en producción.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
