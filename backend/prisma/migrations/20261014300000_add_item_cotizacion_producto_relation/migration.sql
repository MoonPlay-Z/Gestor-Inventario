-- AlterTable: relación ItemCotizacion -> Producto.
-- `productoId` ya existía como columna suelta; se le añade la clave foránea
-- que Prisma necesita para exponer `items.producto` en el select del detalle
-- de cotización (GET /api/cotizaciones/:id devolvía 500 sin esto).
ALTER TABLE "items_cotizacion"
  ADD CONSTRAINT "items_cotizacion_productoId_fkey"
  FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
