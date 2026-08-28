-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "cuotasTotales" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "costoCompra" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
