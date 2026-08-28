/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,sku]` on the table `productos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `empresaId` to the `productos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "productos_sku_key";

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "anuladoPor" TEXT,
ADD COLUMN     "motivoAnulacion" TEXT,
ADD COLUMN     "usuarioId" TEXT;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT '',
    "rol" TEXT NOT NULL DEFAULT 'CAJA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'trialing',
    "planType" TEXT,
    "trialStartsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- Seed an EMPRESA user for existing product/company references
INSERT INTO "usuarios" ("id", "username", "passwordHash", "nombre", "rol", "activo", "subscriptionStatus", "planType", "createdAt", "updatedAt")
SELECT 'fa3384a2-0655-433c-931b-e660d83e738d', 'admin', '$2b$10$g0KM4BZMugkYl.qDZhor6OoDDg4J2xGs3zHYpqhGS9Al51yVuWoJS', 'Administrador', 'EMPRESA', true, 'active', 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "usuarios" WHERE "username" = 'admin');

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "empresaId" TEXT;

-- Set empresaId for existing products
UPDATE "productos" SET "empresaId" = 'fa3384a2-0655-433c-931b-e660d83e738d' WHERE "empresaId" IS NULL;
ALTER TABLE "productos" ALTER COLUMN "empresaId" SET NOT NULL;

-- CreateTable
CREATE TABLE "cierres_caja" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "montoInicial" DECIMAL(12,2) NOT NULL,
    "montoFinal" DECIMAL(12,2),
    "ingresosEfectivo" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "ingresosBanco" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "estado" TEXT NOT NULL DEFAULT 'OPEN',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cierres_caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaValidez" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "impuestoTotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "estado" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_cotizacion" (
    "id" TEXT NOT NULL,
    "cotizacionId" TEXT NOT NULL,
    "productoId" TEXT,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "totalLinea" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "items_cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_activacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_activacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cierres_caja_usuarioId_idx" ON "cierres_caja"("usuarioId");

-- CreateIndex
CREATE INDEX "cierres_caja_estado_idx" ON "cierres_caja"("estado");

-- CreateIndex
CREATE INDEX "cierres_caja_fechaApertura_idx" ON "cierres_caja"("fechaApertura");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_numero_key" ON "cotizaciones"("numero");

-- CreateIndex
CREATE INDEX "cotizaciones_clienteId_idx" ON "cotizaciones"("clienteId");

-- CreateIndex
CREATE INDEX "cotizaciones_usuarioId_idx" ON "cotizaciones"("usuarioId");

-- CreateIndex
CREATE INDEX "cotizaciones_estado_idx" ON "cotizaciones"("estado");

-- CreateIndex
CREATE INDEX "items_cotizacion_cotizacionId_idx" ON "items_cotizacion"("cotizacionId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE INDEX "solicitudes_activacion_usuarioId_idx" ON "solicitudes_activacion"("usuarioId");

-- CreateIndex
CREATE INDEX "solicitudes_activacion_estado_idx" ON "solicitudes_activacion"("estado");

-- CreateIndex
CREATE INDEX "clientes_razonSocial_idx" ON "clientes"("razonSocial");

-- CreateIndex
CREATE INDEX "clientes_rifCedula_idx" ON "clientes"("rifCedula");

-- CreateIndex
CREATE INDEX "facturas_fechaEmision_idx" ON "facturas"("fechaEmision");

-- CreateIndex
CREATE INDEX "facturas_usuarioId_idx" ON "facturas"("usuarioId");

-- CreateIndex
CREATE INDEX "facturas_clienteId_idx" ON "facturas"("clienteId");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "items_factura_facturaId_idx" ON "items_factura"("facturaId");

-- CreateIndex
CREATE INDEX "pagos_facturaId_idx" ON "pagos"("facturaId");

-- CreateIndex
CREATE INDEX "pagos_fechaPago_idx" ON "pagos"("fechaPago");

-- CreateIndex
CREATE INDEX "productos_empresaId_idx" ON "productos"("empresaId");

-- CreateIndex
CREATE INDEX "productos_nombre_idx" ON "productos"("nombre");

-- CreateIndex
CREATE INDEX "productos_categoria_idx" ON "productos"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "productos_empresaId_sku_key" ON "productos"("empresaId", "sku");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_caja" ADD CONSTRAINT "cierres_caja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_cotizacion" ADD CONSTRAINT "items_cotizacion_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_activacion" ADD CONSTRAINT "solicitudes_activacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
