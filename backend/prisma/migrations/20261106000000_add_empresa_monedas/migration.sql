-- AlterTable
ALTER TABLE "empresas" ADD COLUMN "monedaBase" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "empresas" ADD COLUMN "monedaExhibicion" TEXT NOT NULL DEFAULT 'USD';
