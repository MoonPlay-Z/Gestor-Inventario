# Reporte de bugs encontrados — QA de flujos POS

**Fecha:** 2026-10-29
**Alcance:** clientes, productos por peso, ventas, métodos de pago, CxC y abonos, tasa, caja y subusuarios.
**Entorno:** base SQLite temporal con datos sintéticos; tasa BCV simulada de 52 VES/USD.
**Producción:** no se conectó ni se escribieron datos en producción.

## Resumen

Durante la validación se encontraron cinco problemas. Todos fueron corregidos y
se volvieron a validar en el entorno aislado. No quedan bugs de esta ejecución
pendientes de corrección.

| ID | Severidad | Área | Problema | Estado |
|---|---|---|---|---|
| QA-POS-01 | Media | Adaptador Prisma/SQLite | Conversión numérica incompleta en operaciones de inventario y cierre de caja | Corregido |
| QA-POS-02 | Media | Adaptador Prisma/SQLite | El middleware alteraba fragmentos `Prisma.Sql` usados por consultas raw | Corregido |
| QA-POS-03 | Baja | POS | Se ejecutaba una notificación dentro del actualizador funcional de React | Corregido |
| QA-POS-04 | Alta | Arqueo de caja | Los cobros en VES podían sumarse al efectivo físico esperado en USD | Corregido |
| QA-POS-05 | Baja | Historial de caja | La columna de efectivo VES se presentaba con símbolo de dólares | Corregido |

## Detalle de incidencias

### QA-POS-01 — Conversión numérica incompleta en SQLite

- **Severidad:** Media.
- **Síntoma:** operaciones con productos por peso podían fallar al crear o
  actualizar productos; el cierre también fallaba al procesar campos de
  ingresos separados por moneda.
- **Causa:** el middleware SQLite no convertía algunos valores numéricos
  almacenados como texto. Faltaban campos de inventario y peso (`stockActual`,
  `stockMinimo`, `precioPorKilo`, `toleranciaPeso`) y los campos de ingresos VES
  del cierre (`ingresosEfectivoVES`, `ingresosBancoVES`).
- **Corrección:** se completó el conjunto de campos que el adaptador convierte
  a números.
- **Validación:** alta y venta de productos por peso, además de previsualización
  y cierre de caja, pasaron en SQLite temporal.

### QA-POS-02 — Fragmentos `Prisma.Sql` alterados por el middleware

- **Severidad:** Media.
- **Síntoma:** la consulta raw que agrega pagos del turno fallaba en SQLite y
  bloqueaba el cálculo de la previsualización de caja.
- **Causa:** la conversión recursiva reconstruía como objetos ordinarios
  instancias con prototipos propios, incluidos fragmentos `Prisma.Sql`.
- **Corrección:** el middleware conserva instancias con prototipos no planos
  y solo recorre objetos planos.
- **Validación:** consulta de pagos y previsualización de caja ejecutadas
  correctamente en el entorno aislado.

### QA-POS-03 — Efecto secundario dentro de un actualizador de React

- **Severidad:** Baja.
- **Síntoma:** al validar cantidades del carrito aparecía una advertencia de
  React por ejecutar `showToast` durante el actualizador funcional de `setCart`.
- **Causa:** el callback usado para actualizar el carrito también podía
  mostrar una notificación.
- **Corrección:** la comprobación de stock y su notificación se realizan antes
  de actualizar el estado; el actualizador queda libre de efectos secundarios.
- **Validación:** se comprobó una cantidad válida y no reapareció la
  advertencia durante la venta desde la interfaz.

### QA-POS-04 — Monedas mezcladas en el arqueo de efectivo USD

- **Severidad:** Alta.
- **Síntoma:** el resumen de cierre podía incluir en el efectivo físico USD el
  valor de ventas cobradas en VES convertido a dólares. Eso mostraba un
  esperado incorrecto para el conteo físico independiente por moneda.
- **Causa:** el modal usaba el total normalizado en USD en vez del total
  efectivamente recibido en USD.
- **Corrección:** el cálculo, el desglose visual y el dato de auditoría USD
  ahora toman `efectivoRecibido.USD`; el arqueo VES conserva su total original
  en bolívares.
- **Validación:** con una venta de Bs. 104 a tasa 52, el arqueo registró
  Bs. 104 en VES y $0 de efectivo recibido en USD; el cierre cuadró al contar
  esos montos por separado.

### QA-POS-05 — Símbolo de moneda incorrecto en el historial VES

- **Severidad:** Baja.
- **Síntoma:** la columna “Efectivo VES” se mostraba con formato de dólares,
  aunque el monto almacenado correspondía a bolívares.
- **Causa:** el formateador de moneda usaba su símbolo predeterminado (`$`).
- **Corrección:** el historial de escritorio y el resumen móvil pasan
  explícitamente el símbolo `Bs.`.
- **Validación:** ambos formatos compilan y presentan el efectivo VES con el
  símbolo correcto.

## Flujos verificados

- **Interfaz:** búsqueda y selección de cliente; venta de 500 g registrada como
  0,5 kg por Bs. 520 a tasa 52; venta adicional de 100 g por Bs. 104; apertura
  y cierre de caja desde el navegador.
- **API aislada:** productos por unidad y peso; métodos de pago del catálogo y
  financiamiento; CxC y abonos en VES/USD; tasa manual y actualización
  simulada; caja; creación y autenticación de subusuarios CAJA, INVENTARIO y
  VISOR, con rechazo de permisos no autorizados.

## Validación técnica y límites

- `npm test` en frontend: **22 pruebas aprobadas**.
- `npm run build`: **correcto**. Vite informó advertencias existentes sobre
  importación mixta de `outbox.js` y tamaño de algunos chunks; no impidieron la
  compilación.
- `git diff --check`: **correcto**.
- Las pruebas de tasa usaron una respuesta BCV local simulada. No se verificó
  el servicio BCV real, una instancia productiva ni una APK instalada.
- Los servicios y la base temporal de QA se detuvieron y eliminaron al terminar.
