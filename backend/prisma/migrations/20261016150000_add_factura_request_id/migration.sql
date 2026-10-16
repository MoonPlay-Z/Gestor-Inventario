-- Idempotencia de emisión de facturas.
-- requestId es la clave que envía el POS para que un doble clic, una recarga
-- o un reintento del proxy no generen una segunda factura con los mismos datos.
-- Es nullable: las facturas históricas y las de otros flujos quedan en NULL.
-- En PostgreSQL los NULL no colisionan en un índice único, así que puede haber
-- varias facturas sin requestId sin problema.
ALTER TABLE "facturas" ADD COLUMN IF NOT EXISTS "requestId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "facturas_requestId_key" ON "facturas"("requestId");