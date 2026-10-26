-- AlterTable
ALTER TABLE "facturas"
  ADD COLUMN IF NOT EXISTS "descripcionAnulacion" TEXT,
  ADD COLUMN IF NOT EXISTS "fechaAnulacion" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "tasaAnulacion" DECIMAL(10, 4);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "facturas_fechaAnulacion_idx" ON "facturas"("fechaAnulacion");
