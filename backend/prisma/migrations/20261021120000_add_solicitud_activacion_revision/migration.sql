-- Bandeja de pagos del Super Admin: permite resolver (aprobar/rechazar) una
-- solicitud de activación dejando rastro de quién la revisó, cuándo y con qué
-- nota interna. Los tres campos son opcionales para no romper solicitudes
-- históricas ni las creadas por B2B.
ALTER TABLE "solicitudes_activacion"
  ADD COLUMN "notas" TEXT,
  ADD COLUMN "revisadoPor" TEXT,
  ADD COLUMN "revisadoEn" TIMESTAMP(3);
