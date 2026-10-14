# Reporte de bug:CxC incompletas — el cajero no ve todas sus cuentas por cobrar

**Fecha:** 2026-10-14
**Severidad:** 🔴 HIGH
**Confianza:** 10/10
**Tipo de verificación:** Consultas de solo lectura sobre la base de datos y ejercicio de los endpoints `GET /api/cxc` y `GET /api/cxc/resumen` con tokens reales de `bodegon1` (EMPRESA) y `caja` (CAJA). No se modificó información durante el diagnóstico.

## Hallazgo

Existen tres causas distintas que hacen que el módulo de Cuentas por Cobrar no muestre toda la deuda registrada. Solo una es un defecto de código; las otras dos son diseño mal alineado y datos históricos.

### 1. Facturas pendientes sin cuenta por cobrar (defecto de datos)

De 21 facturas en estado `PENDING`, **11 no tienen cuenta por cobrar asociada**, por lo que no aparecen en el módulo de cobranza ni en el resumen. El cajero solo llega a ver 10 de 21 facturas pendientes en el historial de ventas.

Todas tienen `facturas.empresaId = NULL` y pertenecen a cajeros:

| Factura | Fecha | Cajero | Total |
|---|---|---|---|
| #526 | 2026-10-13 00:31 | 29540569 | 5.80 |
| #519 | 2026-10-12 20:54 | 29540569 | 2.12 |
| #445 | 2026-10-10 23:25 | 29540569 | 4.55 |
| #418 | 2026-10-10 12:46 | 36015584 | 3.28 |
| #395 | 2026-10-08 23:51 | 29540569 | 1.10 |
| #372 | 2026-10-07 23:52 | 36015584 | 8.15 |
| #371 | 2026-10-07 22:00 | 36015584 | 4.50 |
| #238 | 2026-10-05 16:33 | 29540569 | 7.10 |
| #199 | 2026-10-04 00:11 | 29540569 | 4.00 |
| #167 | 2026-10-02 00:29 | 29540569 | 27.00 |
| #150 | 2026-09-30 17:04 | 29540569 | 10.00 |

La migración que crea el módulo se aplicó el **2026-10-09 20:00**. Las 4 facturas posteriores (#418, #445, #519, #526) deberían tener su cuenta por cobrar y no la tienen. Las 7 anteriores son históricas y su ausencia es esperable.

**Causa:** las sub-cuentas `CAJA` nacen con `empresaRefId = NULL`, y su `empresaId` apunta al `Usuario` padre, no a la tabla `empresas`. `cuentas_por_cobrar.empresaId` es `NOT NULL`, por lo que la creación de la cuenta fallaba en el servidor. Este defecto ya fue corregido en `backend/src/utils/empresaContext.js`; las facturas anteriores a la corrección quedaron sin su cuenta.

### 2. El resumen se contradice a sí mismo (defecto de código)

Dentro de una misma respuesta de `GET /api/cxc/resumen` conviven dos alcances distintos:

| Dato del resumen | Filtro aplicado | Alcance para un cajero |
|---|---|---|
| `totalPendiente`, `totalVencido`, `porEstado` | `usuarioId` del cajero | Solo propias |
| `aging` | `empresaId` de la empresa | Empresa completa |

Para el usuario `caja` de ARCA C.A: los totales reportan **1 cuenta** y el aging se calcula sobre **21 cuentas**. Las tarjetas superiores y el gráfico inferior muestran cifras que no corresponden entre sí.

**Ubicación:** `backend/src/routes/cxc.js:49-97`. El `tenantFilter` se aplica a los agregados, pero la consulta de aging filtra por `empresaId`.

### 3. Alcance por rol (comportamiento esperado, documentado)

La regla acordada es: **el cajero solo ve y gestiona sus propias cuentas por cobrar; la empresa ve las de todos sus cajeros.**

El listado (`GET /cxc`) ya cumple esa regla mediante `cxcTenantFilter`, que para `CAJA` devuelve `{ usuarioId: <propio> }`. De las 21 cuentas de ARCA C.A, 20 las emitió `bodegon1` y 1 el cajero `caja`.

Lo que faltaba era que el resumen respetara la misma regla; por eso el defecto 2 es una inconsistencia y no una decisión de negocio.

## Verificación

Consulta directa sobre `cuentas_por_cobrar` (31 filas en total, 21 de ARCA C.A):

- Filas con `empresaId` que no apunta a una `Empresa`: **0**
- Filas donde `cuentas_por_cobrar.empresaId` difiere de `facturas.empresaId`: **0**
- Cuentas por cobrar huérfanas (factura inexistente): **0**

Los datos existentes son coherentes; el problema es de cobertura y de alcance, no de corrupción.

## Corrección aplicada

1. **Alcance unificado en el resumen.** El aging usa el mismo `tenantFilter` que los totales, de modo que un cajero ve cifras coherentes con su listado y la empresa ve la totalidad. El filtro por empresa se conserva únicamente donde corresponde: el detalle y el abono, que validan pertenencia.

2. **Script de reparación** `backend/scripts/backfill-cxc-pendientes.js` (ejecución en seco por defecto, `--apply` para persistir) que genera la cuenta por cobrar faltante de las facturas pendientes, resolviendo la empresa desde el usuario padre.

## Nota sobre el alcance por rol

La regla actual tiene una consecuencia operativa que conviene tener presente: si la caja 1 registra una venta a crédito y la caja 2 atiende el cobro, la caja 2 no ve esa deuda. Es el comportamiento pedido explícitamente, no un defecto; queda documentado aquí por si más adelante se quiere replantearlo.

## Estado

Corregido. Verificado con `GET /api/cxc` y `GET /api/cxc/resumen` para `bodegon1` y `caja`: los totales y el aging devuelven el mismo alcance, y las 11 facturas pendientes recuperan su cuenta por cobrar.
