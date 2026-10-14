-- AlterTable
ALTER TABLE "cotizaciones" ADD COLUMN "facturaId" TEXT;

-- Index
CREATE INDEX "cotizaciones_facturaId_idx" ON "cotizaciones"("facturaId");
