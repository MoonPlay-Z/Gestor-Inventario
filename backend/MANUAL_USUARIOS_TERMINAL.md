# Manual de administración de usuarios por terminal en producción

Este manual explica la forma correcta de administrar usuarios desde un servidor remoto en producción, sin depender del entorno local ni de la app web.

## 1) Recomendación de seguridad y no interrupción del sistema

Este sistema ya está en producción y es usado por clientes reales, por lo que cualquier cambio debe hacerse con extremo cuidado para no interrumpir la operación activa.

La regla principal es:

- no tocar la lógica principal del backend ni el flujo de autenticación sin necesidad
- no modificar rutas activas ni permisos globales a la ligera
- preferir scripts independientes de administración, ejecutados manualmente
- administrar usuarios desde la terminal del servidor (SSH, consola del host o ejecución remota)

La API de registro remoto está protegida y la ruta de producción bloquea el acceso en [backend/src/routes/auth.js](backend/src/routes/auth.js#L168-L179).

> En este proyecto el rol principal es `SUPER_ADMIN`. No se usa `ADMIN` como valor real del sistema.

### Cambios recomendados

- Scripts externos para crear, listar y cambiar usuarios
- Ejecución manual desde terminal
- Cambios aislados sin afectar la app principal

### Cambios a evitar

- editar la lógica del login sin criterio
- tocar endpoints públicos que ya están operando en producción
- modificar permisos de acceso de clientes sin revisión previa
- hacer cambios masivos que puedan romper sesiones o flujos activos

---

## 2) Roles válidos

Los roles admitidos por la aplicación son:

- `SUPER_ADMIN`
- `EMPRESA`
- `CAJA`
- `INVENTARIO`
- `VISOR`

---

## 3) Crear o actualizar el usuario administrador desde producción

Conéctate al servidor donde está desplegado el backend y ejecuta esto:

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const password = 'Admin123!';
  const rol = 'SUPER_ADMIN';

  try {
    const existing = await prisma.usuario.findUnique({ where: { username } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      await prisma.usuario.update({
        where: { username },
        data: {
          passwordHash,
          nombre: 'Administrador',
          rol,
          activo: true,
          subscriptionStatus: 'active'
        }
      });
      console.log('✅ Usuario admin actualizado');
    } else {
      await prisma.usuario.create({
        data: {
          username,
          passwordHash,
          nombre: 'Administrador',
          rol,
          activo: true,
          subscriptionStatus: 'active'
        }
      });
      console.log('✅ Usuario admin creado');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

### Credenciales iniciales

- Usuario: `admin`
- Contraseña: `Admin123!`
- Rol: `SUPER_ADMIN`

> Cambia esa contraseña inmediatamente después del primer acceso.

---

## 4) Listar usuarios en producción

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    console.table(usuarios.map(u => ({
      id: u.id,
      usuario: u.username,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo ? 'Sí' : 'No',
      fecha: new Date(u.createdAt).toLocaleString()
    })));
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 5) Cambiar contraseña de un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const nuevaPassword = 'NuevaClave2026!';

  try {
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    await prisma.usuario.update({
      where: { username },
      data: { passwordHash }
    });
    console.log(`✅ Contraseña actualizada para ${username}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 6) Cambiar el rol de un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const nuevoRol = 'CAJA';

  try {
    const validRoles = ['SUPER_ADMIN', 'EMPRESA', 'CAJA', 'INVENTARIO', 'VISOR'];
    if (!validRoles.includes(nuevoRol)) {
      throw new Error(`Rol inválido: ${nuevoRol}`);
    }

    const usuario = await prisma.usuario.update({
      where: { username },
      data: { rol: nuevoRol }
    });

    console.log(`✅ Rol actualizado: ${usuario.username} -> ${usuario.rol}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 7) Activar o desactivar un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const activo = false;

  try {
    const usuario = await prisma.usuario.update({
      where: { username },
      data: { activo }
    });

    console.log(`✅ Usuario ${usuario.username} ahora está ${usuario.activo ? 'activo' : 'inactivo'}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 8) Eliminar un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const username = 'usuario_a_eliminar';

  try {
    await prisma.usuario.delete({ where: { username } });
    console.log(`✅ Usuario eliminado: ${username}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

> Esta acción es irreversible; úsala solo si estás seguro.

---

## 9) Si quieres usar la API remota

Puede existir esta ruta:

```bash
POST /api/auth/register-remote
Headers:
  x-dev-secret: TU_DEV_SECRET
Body:
{
  "username": "admin",
  "password": "Admin123!",
  "nombre": "Administrador",
  "rol": "SUPER_ADMIN"
}
```

Pero en producción la ruta queda bloqueada por validación del servidor; por eso, para producción real, el método recomendado es hacerlo directamente en la base de datos desde la terminal del servidor.

---

## 10) Recomendación práctica del equipo

Para no interferir con clientes ni con la operación actual, lo mejor es:

- mantener producción estable
- usar terminal del servidor para tareas administrativas puntuales
- no tocar flujo principal si no es necesario
- crear scripts separados para gestión de usuarios
- hacer cambios controlados y documentados antes de ejecutarlos

---

## 11) Resumen rápido

```bash
# crear o actualizar el admin
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
(async () => {
  const prisma = new PrismaClient();
  const user = 'admin';
  const pass = 'Admin123!';
  const hash = await bcrypt.hash(pass, 10);
  const existing = await prisma.usuario.findUnique({ where: { username: user } });

  if (existing) {
    await prisma.usuario.update({
      where: { username: user },
      data: { passwordHash: hash, rol: 'SUPER_ADMIN', activo: true, subscriptionStatus: 'active' }
    });
  } else {
    await prisma.usuario.create({
      data: { username: user, passwordHash: hash, nombre: 'Administrador', rol: 'SUPER_ADMIN', activo: true, subscriptionStatus: 'active' }
    });
  }

  console.log('Usuario listo');
  await prisma.$disconnect();
})();
NODE
```

Si quieres, puedo dejarte un script aislado para producción como `crear-admin-prod.js`, `listar-usuarios-prod.js` y `cambiar-password-prod.js`, sin tocar la lógica que ya usa la app en producción.

---

## 2) Roles válidos

Los roles admitidos por la aplicación son:

- `SUPER_ADMIN`
- `EMPRESA`
- `CAJA`
- `INVENTARIO`
- `VISOR`

---

## 3) Crear o actualizar el usuario administrador desde producción

Conéctate al servidor donde está desplegado el backend y ejecuta esto:

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const password = 'Admin123!';
  const rol = 'SUPER_ADMIN';

  try {
    const existing = await prisma.usuario.findUnique({ where: { username } });
    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      await prisma.usuario.update({
        where: { username },
        data: {
          passwordHash,
          nombre: 'Administrador',
          rol,
          activo: true,
          subscriptionStatus: 'active'
        }
      });
      console.log('✅ Usuario admin actualizado');
    } else {
      await prisma.usuario.create({
        data: {
          username,
          passwordHash,
          nombre: 'Administrador',
          rol,
          activo: true,
          subscriptionStatus: 'active'
        }
      });
      console.log('✅ Usuario admin creado');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

### Credenciales iniciales

- Usuario: `admin`
- Contraseña: `Admin123!`
- Rol: `SUPER_ADMIN`

> Cambia esa contraseña inmediatamente después del primer acceso.

---

## 4) Listar usuarios en producción

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    console.table(usuarios.map(u => ({
      id: u.id,
      usuario: u.username,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo ? 'Sí' : 'No',
      fecha: new Date(u.createdAt).toLocaleString()
    })));
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 5) Cambiar contraseña de un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const nuevaPassword = 'NuevaClave2026!';

  try {
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    await prisma.usuario.update({
      where: { username },
      data: { passwordHash }
    });
    console.log(`✅ Contraseña actualizada para ${username}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 6) Cambiar el rol de un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const nuevoRol = 'CAJA';

  try {
    const validRoles = ['SUPER_ADMIN', 'EMPRESA', 'CAJA', 'INVENTARIO', 'VISOR'];
    if (!validRoles.includes(nuevoRol)) {
      throw new Error(`Rol inválido: ${nuevoRol}`);
    }

    const usuario = await prisma.usuario.update({
      where: { username },
      data: { rol: nuevoRol }
    });

    console.log(`✅ Rol actualizado: ${usuario.username} -> ${usuario.rol}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 7) Activar o desactivar un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const username = 'admin';
  const activo = false;

  try {
    const usuario = await prisma.usuario.update({
      where: { username },
      data: { activo }
    });

    console.log(`✅ Usuario ${usuario.username} ahora está ${usuario.activo ? 'activo' : 'inactivo'}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

---

## 8) Eliminar un usuario

```bash
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const username = 'usuario_a_eliminar';

  try {
    await prisma.usuario.delete({ where: { username } });
    console.log(`✅ Usuario eliminado: ${username}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
```

> Esta acción es irreversible; úsala solo si estás seguro.

---

## 9) Si quieres usar la API remota

Puede existir esta ruta:

```bash
POST /api/auth/register-remote
Headers:
  x-dev-secret: TU_DEV_SECRET
Body:
{
  "username": "admin",
  "password": "Admin123!",
  "nombre": "Administrador",
  "rol": "SUPER_ADMIN"
}
```

Pero en producción la ruta queda bloqueada por validación del servidor; por eso, para producción real, el método recomendado es hacerlo directamente en la base de datos desde la terminal del servidor.

---

## 10) Resumen rápido

```bash
# crear o actualizar el admin
cd /ruta/al/proyecto/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
(async () => {
  const prisma = new PrismaClient();
  const user = 'admin';
  const pass = 'Admin123!';
  const hash = await bcrypt.hash(pass, 10);
  const existing = await prisma.usuario.findUnique({ where: { username: user } });

  if (existing) {
    await prisma.usuario.update({
      where: { username: user },
      data: { passwordHash: hash, rol: 'SUPER_ADMIN', activo: true, subscriptionStatus: 'active' }
    });
  } else {
    await prisma.usuario.create({
      data: { username: user, passwordHash: hash, nombre: 'Administrador', rol: 'SUPER_ADMIN', activo: true, subscriptionStatus: 'active' }
    });
  }

  console.log('Usuario listo');
  await prisma.$disconnect();
})();
NODE
```

Si quieres, puedo dejarte este mismo manual en una versión más corta para tu servidor de producción o convertirlo en un script `crear-admin-prod.js` listo para ejecutar.

---

## SQL para una app de administración en React Native

Si quieres soportar una app móvil de administración con React Native, puedes usar este SQL base para crear los roles y usuario administrador del panel. Este bloque es compatible con PostgreSQL y sigue la lógica del backend actual.

```sql
-- ==============================================
-- APP ADMINISTRACION - REACT NATIVE
-- ==============================================

-- Roles del sistema
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permisos por modulo
CREATE TABLE IF NOT EXISTS permisos (
  id SERIAL PRIMARY KEY,
  modulo VARCHAR(100) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  descripcion TEXT,
  UNIQUE (modulo, accion)
);

-- Relación role-permiso
CREATE TABLE IF NOT EXISTS roles_permisos (
  rol_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id INTEGER NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre VARCHAR(150) NOT NULL DEFAULT '',
  email VARCHAR(150),
  rol VARCHAR(50) NOT NULL DEFAULT 'CAJA',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar roles base
INSERT INTO roles (nombre, descripcion)
VALUES
  ('SUPER_ADMIN', 'Administrador total del sistema'),
  ('EMPRESA', 'Administrador de la empresa'),
  ('CAJA', 'Operador de caja'),
  ('INVENTARIO', 'Encargado de inventario'),
  ('VISOR', 'Consulta y visualización')
ON CONFLICT (nombre) DO NOTHING;

-- Permisos base para administración
INSERT INTO permisos (modulo, accion, descripcion)
VALUES
  ('usuarios', 'read', 'Ver usuarios'),
  ('usuarios', 'create', 'Crear usuarios'),
  ('usuarios', 'update', 'Editar usuarios'),
  ('usuarios', 'delete', 'Eliminar usuarios'),
  ('ventas', 'read', 'Ver ventas'),
  ('ventas', 'create', 'Crear ventas'),
  ('inventario', 'read', 'Ver inventario'),
  ('inventario', 'update', 'Actualizar inventario'),
  ('caja', 'read', 'Ver caja'),
  ('caja', 'create', 'Registrar movimientos de caja')
ON CONFLICT (modulo, accion) DO NOTHING;

-- Usuario administrador base para React Native app
-- La contraseña debe ser hasheada antes de insertarla en producción.
INSERT INTO usuarios (username, password_hash, nombre, email, rol, activo)
VALUES (
  'admin',
  '$2b$10$g0KM4BZMugkYl.qDZhor6OoDDg4J2xGs3zHYpqhGS9Al51yVuWoJS',
  'Administrador',
  'admin@empresa.com',
  'SUPER_ADMIN',
  true
)
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Consulta rápida para revisar usuarios y roles
SELECT u.id, u.username, u.nombre, u.rol, u.activo, r.descripcion
FROM usuarios u
LEFT JOIN roles r ON r.nombre = u.rol
ORDER BY u.id;
```

### Nota importante

- En producción no se debe guardar la contraseña en texto plano.
- Debes generar el hash con `bcrypt` antes de insertarlo.
- El usuario real del proyecto usa el mismo patrón de roles: `SUPER_ADMIN`, `EMPRESA`, `CAJA`, `INVENTARIO`, `VISOR`.

### Ejemplo de login móvil

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

Y en el backend, el usuario deberá validar:

- `username`
- `passwordHash`
- `rol`
- `activo`

Esto permite que la app React Native se conecte a la API y muestre paneles según el rol.

---


---

## 9) Recomendaciones

- Usa contraseñas largas y complejas.
- Cambia la contraseña inicial del usuario `admin` en producción.
- Mantén al menos un usuario `SUPER_ADMIN` activo como respaldo.
- No uses el rol `ADMIN` porque no está definido en el sistema.

---

## 10) Resumen rápido

### Crear administrador

```bash
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
node - <<'NODE'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
(async () => {
  const prisma = new PrismaClient();
  const user = 'admin';
  const pass = 'Admin123!';
  const hash = await bcrypt.hash(pass, 10);
  const existing = await prisma.usuario.findUnique({ where: { username: user } });
  if (existing) {
    await prisma.usuario.update({ where: { username: user }, data: { passwordHash: hash, rol: 'SUPER_ADMIN', activo: true } });
  } else {
    await prisma.usuario.create({ data: { username: user, passwordHash: hash, nombre: 'Administrador', rol: 'SUPER_ADMIN', activo: true } });
  }
  console.log('Usuario listo');
  await prisma.$disconnect();
})();
NODE
```

Si necesitas, puedo dejarte además un script reutilizable dentro de la carpeta `backend/scripts` para crear usuarios desde una sola línea de comando.
