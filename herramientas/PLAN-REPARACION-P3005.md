# Plan estructurado para P3005

## Objetivo

Resolver `P3005` sin perder datos y sin marcar migraciones como aplicadas cuando la
estructura real no coincide con el esquema Prisma.

## Variables medibles

Sea `E` el error estructural total:

```text
E = T + C + Y + R + I
```

- `T`: tablas faltantes.
- `C`: columnas faltantes o sobrantes no esperadas.
- `Y`: tipos, nulabilidad o valores por defecto diferentes.
- `R`: relaciones, claves únicas, índices o restricciones diferentes.
- `I`: inconsistencias de integridad: huérfanos, duplicados o valores inválidos.

Cada componente es un conteo no negativo. La condición de aceptación es:

```text
E = 0
```

Si `E > 0`, no se debe ejecutar `prisma migrate resolve --applied` para ocultar el
problema. Primero se corrige la estructura o se restaura el respaldo.

## Procedimiento

1. Cerrar el POS y detener el backend para evitar escrituras concurrentes.
2. Crear un respaldo `pg_dump` y comprobar que el archivo existe y tiene tamaño mayor que cero.
3. Ejecutar el script correspondiente en modo de diagnóstico.
4. Si el problema es solo historial Prisma y `E = 0`, registrar únicamente la migración que realmente corresponde con `migrate resolve`.
5. Si `E > 0`, ejecutar `prisma db push` con el respaldo disponible o aplicar una migración explícita revisada.
6. Ejecutar `verificar-integridad-bd.js`.
7. Aceptar la reparación solo si `I = 0` y el proceso de inicio completa.

## Regla de decisión

```text
respaldo valido AND E = 0  -> se puede corregir historial Prisma
respaldo valido AND E > 0  -> reparar estructura, luego volver a medir E
respaldo invalido           -> detenerse; no modificar la base
```

## Comandos

Windows:

```bat
reparar-bd-windows.bat
```

Linux:

```bash
chmod +x reparar-bd-linux.sh
./reparar-bd-linux.sh
```

Los scripts no ejecutan `migrate reset`, porque ese comando elimina la base de datos.