# Reporte de bug: unidad incorrecta al ajustar inventario por peso

**Fecha:** 2026-10-06  
**Severidad:** 🟡 MEDIUM  
**Confianza:** 10/10  
**Tipo de verificación:** Revisión estática y prueba local de conversión de unidades. No se accedió a cuentas ni bases remotas y no se modificó inventario.

## Hallazgo

Al ajustar existencias de un producto vendido por peso cuya unidad configurada es `GRAMO`, el diálogo muestra “Kilogramos” como unidad inicial, pero el estado del formulario permanece vacío hasta que el usuario cambia manualmente el selector. Si se deja ese valor visual sin tocar, la solicitud envía una unidad vacía y el backend toma la unidad configurada del producto (`GRAMO`).

Por tanto, una operación que el usuario interpreta como `1 kg` puede registrarse como `1 g` —equivalente a `0.001 kg`—. Esto afecta las operaciones de agregar y establecer existencias y puede dejar cantidades incorrectas en el inventario.

## Ubicaciones

- `frontend/src/pages/InventarioPage.jsx:617-618`: unidad “Kilogramos” mostrada por defecto, sin inicializar el valor enviado.
- `backend/src/routes/productos.js:433`: la unidad omitida/vacía se sustituye por la unidad configurada del producto.

## Verificación segura

La conversión local confirma:

- `1` con unidad enviada vacía y producto base `GRAMO` se convierte a `0.001 kg`.
- `1` con unidad enviada `KILOGRAMO` se convierte a `1 kg`.

La reproducción depende de ajustar un producto vendido por peso cuya unidad configurada es `GRAMO` y dejar intacto el selector visual predeterminado.

No se ejecutó `scripts/validar-flujos.js`: dicho flujo crea facturas y altera existencias y datos de caja.

## Corrección recomendada

Inicializar el estado del selector con la unidad que se muestra y enviar explícitamente esa unidad. Alternativamente, cambiar el valor predeterminado del backend para que coincida con la unidad base mostrada en el diálogo.

## Estado

Corregido en `frontend/src/pages/InventarioPage.jsx`: al abrir el ajuste de stock de un producto vendido por peso, el estado del formulario ahora se inicializa en `KILOGRAMO`, que es también la unidad mostrada por defecto. La verificación local confirmó que 1 kg se convierte a 1 kg incluso cuando la unidad base configurada del producto es `GRAMO`.
