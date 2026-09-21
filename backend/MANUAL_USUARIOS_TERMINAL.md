# Manual de administración de usuarios por terminal en producción

Este manual explica la forma correcta de administrar usuarios desde el servidor en producción, sin depender del entorno local ni de la app web.

## 1) Reglas de seguridad y operación

Este sistema ya está en producción con clientes reales, así que cualquier cambio debe hacerse con cuidado y sin alterar el flujo principal.

Reglas recomendadas:

- no tocar la lógica de login ni la autenticación salvo que sea estrictamente necesario
- no cambiar rutas activas ni permisos globales sin revisión previa
- preferir scripts independientes de administración en la terminal del servidor
- trabajar con cambios puntuales y documentados

La ruta de registro remoto está bloqueada en producción según [backend/src/routes/auth.js](backend/src/routes/auth.js#L167-L179).

> En este proyecto el rol principal es `SUPER_ADMIN`. No se usa `ADMIN` como valor del sistema.

### Cambios recomendados

- scripts externos para crear, listar y actualizar usuarios
- ejecución manual desde SSH o consola del host
- cambios aislados sin afectar la app principal

### Cambios a evitar

- editar la lógica del login sin necesidad
- alterar endpoints en producción sin revisión
- cambiar roles masivamente sin confirmar permisos
- hacer operaciones destructivas sin respaldo

---

## 2) Roles válidos

Los roles aceptados por el backend son:

- `SUPER_ADMIN`
- `EMPRESA`
- `CAJA`
- `INVENTARIO`
- `VISOR`

El modelo `Usuario` usa `rol` como texto en Prisma, con valores por defecto y comprobaciones en el backend; se ve en [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L310-L345).

---

## 3) Crear o actualizar el usuario administrador en producción

Conéctate al servidor donde está desplegado el backend y ejecuta esto:

```bash
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
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
          subscriptionStatus: 'trialing'
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
          subscriptionStatus: 'trialing'
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
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
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
        subscriptionStatus: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.table(usuarios.map(u => ({
      id: u.id,
      usuario: u.username,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo ? 'Sí' : 'No',
      suscripcion: u.subscriptionStatus,
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

## 5) Cambiar la contraseña de un usuario

```bash
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
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
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
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
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
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
cd /home/juan/Desktop/gestor\ de\ inventario/linux/backend
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

> Esta acción es irreversible. Úsala solo si estás completamente seguro.

---

## 9) Si quieres usar la API remota

La ruta de registro remota existe, pero en producción queda bloqueada. La comprobación real está en [backend/src/routes/auth.js](backend/src/routes/auth.js#L167-L179).

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

En producción real, la práctica recomendada es actualizar la base de datos desde la terminal del servidor, no llamar a la API pública.

---

## 10) Recomendaciones de operación

- conserva al menos un usuario `SUPER_ADMIN` activo como respaldo
- cambia la contraseña inicial del `admin` inmediatamente
- usa contraseñas largas y únicas
- documenta cada cambio hecho en producción
- evita cambios masivos si el sistema está operando con clientes reales

---

## 11) Resumen rápido

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
    await prisma.usuario.update({
      where: { username: user },
      data: { passwordHash: hash, rol: 'SUPER_ADMIN', activo: true, subscriptionStatus: 'trialing' }
    });
  } else {
    await prisma.usuario.create({
      data: {
        username: user,
        passwordHash: hash,
        nombre: 'Administrador',
        rol: 'SUPER_ADMIN',
        activo: true,
        subscriptionStatus: 'trialing'
      }
    });
  }

  console.log('✅ Usuario listo');
  await prisma.$disconnect();
})();
NODE
```

Si necesitas, puedo dejarte además un script reutilizable dentro de [backend/scripts](backend/scripts) para crear usuarios desde una sola línea de comando.

---

## 12) Datos técnicos relevantes del sistema

El backend actual usa estos campos en el modelo `Usuario`:

- `username` es único
- `passwordHash` guarda la contraseña cifrada
- `rol` es texto y debe ser uno de los roles validos
- `activo` indica si el usuario puede iniciar sesión
- `subscriptionStatus` es usado por el login y puede bloquear acceso según el estado
- `empresaRefId` vincula usuarios a empresas cuando aplica

Esto está definido en [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L310-L345) y validado también por la lógica de login en [backend/src/routes/auth.js](backend/src/routes/auth.js#L16-L117).

---

## 13) Nota final

Para producción, la regla más importante es evitar cambios en la lógica principal y hacer administración desde la terminal del servidor. Es la forma más segura y estable para mantener el sistema en operación sin depender de la app web ni de endpoints no controlados.
