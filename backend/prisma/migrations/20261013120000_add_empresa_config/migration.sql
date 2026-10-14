-- AlterTable
ALTER TABLE "empresas" ADD COLUMN "email" TEXT;
ALTER TABLE "empresas" ADD COLUMN "monedaSimbolo" TEXT;
ALTER TABLE "empresas" ADD COLUMN "monedaCodigo" TEXT;
ALTER TABLE "empresas" ADD COLUMN "tasaDolar" DOUBLE PRECISION DEFAULT 36.5;
