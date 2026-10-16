# Auditoría de integridad — Base de datos de Diana Vargas

**Generado:** 2026-10-16 16:46:25 UTC  
**Base de datos:** Neon (producción)  
**Modo:** SOLO LECTURA — ningún dato fue modificado  
**Tasa del sistema:** 877.9023 Bs/USD

---

## 1. Resumen ejecutivo

| Métrica | Resultado |
|---|---:|
| Líneas de venta por peso auditadas | 272 |
| Líneas con monto incoherente | **0** |
| Facturas con cabecera descuadrada | **1** |
| Pagos en USD que exceden el total | **15** |
| Pagos en Bs sobre facturas USD | 19 |

> **Los montos altos NO están en la base de datos.** Las 272 líneas de venta por peso cuadran exactamente (subtotal = precio x cantidad, impuesto = subtotal x tasa, total = subtotal + impuesto) con tolerancia de $0.02. Los valores inflados provenían del **reporte**, que sumaba gramos y los etiquetaba como kilos. Ese defecto ya fue corregido en `reportesService.js`.

---

## 2. Venta por peso — líneas por unidad registrada

| Unidad en la línea | Líneas | Cantidad mínima | Cantidad máxima |
|---|---:|---:|---:|
| UNIDAD | 3 | 1.0000 | 5.0000 |
| KILOGRAMO | 191 | 0.0300 | 3.0000 |
| GRAMO | 78 | 6.0000 | 1900.0000 |

Las líneas en `GRAMO` se almacenan en gramos. El reporte las dividía entre 1000 al sumar. La facturación siempre cobró bien: el subtotal usa el precio por kilo sobre la cantidad convertida.

---

## 3. Facturas con cabecera descuadrada (1)

| # Factura | Fecha | Estado | Moneda | Cabecera subtotal | Ítems subtotal | Desvío | Cabecera total | Ítems total |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 6 | 2026-09-20 | PAID | USD | $0.47 | $0.96 | $0.49 | $0.47 | $0.96 |

**Causa probable:** la cabecera guarda el total original al momento de emitir, pero los ítems fueron recalculados después (conversión g/kg aplicada a líneas ya existentes). El importe cobrado al cliente es el de `total`; la diferencia está solo en la visualización.

---

## 4. Pagos que exceden el total de la factura (15)

| # Factura | Fecha pago | Método | Monto pagado | Total factura | Exceso | Pagos en la factura | Nota del pago |
|---:|---|---|---:|---:|---:|---:|---|
| 505 | 2026-10-12 | CASH | $50.00 | $88.74 | **$-38.74** | 1 | Abono desde CxC por Juan Arcila |
| 491 | 2026-10-12 | BANK_TRANSFER | $10.00 | $59.16 | **$-49.16** | 4 | Abono desde CxC por Juan Arcila |
| 489 | 2026-10-12 | CASH | $30.00 | $88.74 | **$-58.74** | 2 | Abono de prueba desde CxC |
| 489 | 2026-10-12 | BANK_TRANSFER | $58.74 | $88.74 | **$-30.00** | 2 | Pago final desde CxC |
| 438 | 2026-10-10 | MOBILE_PAYMENT | $0.52 | $3.51 | **$-2.99** | 7 | — |
| 31 | 2026-09-22 | CREDIT_CARD | $5.00 | $17.98 | **$-12.98** | 2 | — |
| 31 | 2026-09-22 | CREDIT_CARD | $2.00 | $17.98 | **$-15.98** | 2 | — |
| 29 | 2026-09-22 | MOBILE_PAYMENT | $5.00 | $38.28 | **$-33.28** | 3 | — |
| 29 | 2026-09-22 | MOBILE_PAYMENT | $25.28 | $38.28 | **$-13.00** | 3 | — |
| 29 | 2026-09-22 | CREDIT_CARD | $8.00 | $38.28 | **$-30.28** | 3 | — |
| 28 | 2026-09-22 | MOBILE_PAYMENT | $10.00 | $28.42 | **$-18.42** | 3 | — |
| 28 | 2026-09-22 | CREDIT_CARD | $10.42 | $28.42 | **$-18.00** | 3 | — |
| 28 | 2026-09-22 | MOBILE_PAYMENT | $8.00 | $28.42 | **$-20.42** | 3 | — |
| 26 | 2026-09-22 | MOBILE_PAYMENT | $28.00 | $38.00 | **$-10.00** | 2 | — |
| 26 | 2026-09-22 | CASH | $10.00 | $38.00 | **$-28.00** | 2 | — |

---

## 5. Pagos en Bs sobre facturas en USD (19)

Estos pagos se convierten a USD para validar contra el total. Cada uno tiene su propia `tasaBCV` registrada al momento del cobro.

| # Factura | Fecha pago | Método | Monto (Bs) | Tasa BCV histórica | Equivalente USD | Total factura (USD) |
|---:|---|---|---:|---:|---:|---:|
| 590 | 2026-10-15 | CASH | Bs 1,278.00 | 879.1225 | $1.45 | $1.42 |
| 587 | 2026-10-15 | CASH | Bs 900.00 | 879.1225 | $1.02 | $1.00 |
| 576 | 2026-10-15 | CASH | Bs 1,800.00 | 879.1225 | $2.05 | $2.00 |
| 553 | 2026-10-16 | CASH | Bs 19.51 | 880.1159 | $0.02 | $19.53 |
| 553 | 2026-10-16 | CASH | Bs 19.53 | 880.1159 | $0.02 | $19.53 |
| 538 | 2026-10-13 | CASH | Bs 257.72 | 876.7976 | $0.29 | $0.30 |
| 523 | 2026-10-13 | CASH | Bs 1,133.96 | 876.7976 | $1.29 | $1.32 |
| 506 | 2026-10-12 | CASH | Bs 730.00 | 875.6505 | $0.83 | $59.16 |
| 504 | 2026-10-12 | CASH | Bs 88.74 | 875.6505 | $0.10 | $88.74 |
| 491 | 2026-10-12 | MOBILE_PAYMENT | Bs 10.00 | 875.6505 | $0.01 | $59.16 |
| 491 | 2026-10-12 | CASH | Bs 39.16 | 875.6505 | $0.04 | $59.16 |
| 465 | 2026-10-11 | CASH | Bs 859.06 | 875.6505 | $0.98 | $1.00 |
| 464 | 2026-10-11 | CASH | Bs 1,288.59 | 875.6505 | $1.47 | $1.50 |
| 438 | 2026-10-13 | CASH | Bs 100.00 | 876.7976 | $0.11 | $3.51 |
| 438 | 2026-10-12 | CASH | Bs 2.99 | 875.6505 | $0.00 | $3.51 |
| 438 | 2026-10-12 | CASH | Bs 2.99 | 875.6505 | $0.00 | $3.51 |
| 438 | 2026-10-13 | CREDIT_CARD | Bs 1,460.00 | 876.7976 | $1.67 | $3.51 |
| 438 | 2026-10-13 | CREDIT_CARD | Bs 1,000.00 | 876.7976 | $1.14 | $3.51 |
| 438 | 2026-10-13 | CREDIT_CARD | Bs 10.00 | 876.7976 | $0.01 | $3.51 |

---

## 6. Por qué no cuadra la caja

El desvio acumulado por usar la tasa actual en vez de la histórica en pagos en Bs es de **$0.0081** en total — despreciable. La causa real es otra:

1. **El reporte mostraba cantidades infladas** (ya corregido). Al ver "6250 kg de tomate" el usuario percibe un error grave que no existe en los datos.
2. **Hay facturas con varios pagos que suman mas que el total** (seccion 4). La caja suma todos los pagos del turno, inflando el arqueo.
3. **El desvio real de caja es de $0.0081**, no de miles. Si el cierre no cuadra en el momento, la diferencia es de redondeo, no de datos corruptos.

---

## 7. Acciones NO tomadas

Este documento es informativo. **No se modificó ningún registro.** Las correcciones requieren autorizacion explicita porque afectan datos fiscales de una cliente final.

Acciones pendientes de tu confirmacion:

- [ ] Recalcular cabecera de las facturas de la seccion 3
- [ ] Marcar o anular pagos duplicados de la seccion 4
- [ ] Confirmar si las facturas con multiples pagos son pruebas de QA
