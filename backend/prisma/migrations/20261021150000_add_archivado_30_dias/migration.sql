-- Archivado con borrado diferido (30 días por defecto).
-- `archivedAt` marca cuándo se archivó una empresa y
-- `scheduledDeletionAt` cuándo el job de purga puede borrarla físicamente.
ALTER TABLE "empresas" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "empresas" ADD COLUMN "scheduledDeletionAt" TIMESTAMP(3);

-- Los usuarios no-EMPRESA también se archivan antes de borrarse.
ALTER TABLE "usuarios" ADD COLUMN "scheduledDeletionAt" TIMESTAMP(3);

-- El job de purga consulta por fecha; los índices evitan escaneos completos.
CREATE INDEX "empresas_scheduledDeletionAt_idx" ON "empresas"("scheduledDeletionAt");
CREATE INDEX "usuarios_scheduledDeletionAt_idx" ON "usuarios"("scheduledDeletionAt");
