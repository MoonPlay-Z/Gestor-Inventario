-- La anulación de un pago es lógica: se conserva la fila y su rastro.
ALTER TABLE "pagos"
  ADD COLUMN "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
  ADD COLUMN "motivoAnulacion" TEXT,
  ADD COLUMN "descripcionAnulacion" TEXT,
  ADD COLUMN "anuladoPor" TEXT,
  ADD COLUMN "fechaAnulacion" TIMESTAMP(3);

CREATE INDEX "pagos_estado_idx" ON "pagos"("estado");
CREATE INDEX "pagos_fechaAnulacion_idx" ON "pagos"("fechaAnulacion");
