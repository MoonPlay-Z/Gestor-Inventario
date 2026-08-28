#!/usr/bin/env node

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('\n--- 🔐 Creación de Usuario Remota ---');
  
  const username = await prompt('Nombre de usuario: ');
  const password = await prompt('Contraseña: ');
  let rol = await prompt('Rol (ADMIN/CASHIER) [CASHIER]: ');
  
  if (!rol || rol.trim() === '') rol = 'CASHIER';
  rol = rol.toUpperCase();

  if (!['ADMIN', 'CASHIER'].includes(rol)) {
    console.log('❌ Rol inválido. Debe ser ADMIN o CASHIER.');
    process.exit(1);
  }

  if (password.length < 6) {
    console.log('❌ La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  try {
    const existing = await prisma.usuario.findUnique({ where: { username } });
    if (existing) {
      console.log('❌ El usuario ya existe.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.usuario.create({
      data: {
        username,
        passwordHash,
        rol
      }
    });

    console.log(`\n✅ Usuario creado exitosamente!`);
    console.log(`ID: ${user.id}`);
    console.log(`Usuario: ${user.username}`);
    console.log(`Rol: ${user.rol}\n`);

  } catch (err) {
    console.error('❌ Error creando usuario:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
