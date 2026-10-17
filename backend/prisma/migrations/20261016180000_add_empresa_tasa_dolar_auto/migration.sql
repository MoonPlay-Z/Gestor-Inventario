-- AlterTable
ALTER TABLE "empresas" ADD COLUMN     "tasaDolarActualizadaEn" TIMESTAMP(3),
ADD COLUMN     "tasaDolarModo" TEXT NOT NULL DEFAULT 'AUTO';

