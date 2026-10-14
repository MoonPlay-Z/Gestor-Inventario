-- DropIndex
DROP INDEX "cierres_caja_empresaId_estado_idx";

-- DropIndex
DROP INDEX "cierres_caja_usuarioId_estado_idx";

-- DropIndex
DROP INDEX "clientes_empresaId_razonSocial_idx";

-- DropIndex
DROP INDEX "cotizaciones_empresaId_estado_idx";

-- DropIndex
DROP INDEX "cotizaciones_usuarioId_estado_idx";

-- DropIndex
DROP INDEX "facturas_empresaId_estado_idx";

-- DropIndex
DROP INDEX "facturas_fechaEmision_estado_idx";

-- DropIndex
DROP INDEX "facturas_fechaVencimiento_estado_idx";

-- DropIndex
DROP INDEX "facturas_usuarioId_estado_idx";

-- DropIndex
DROP INDEX "pagos_facturaId_fechaPago_idx";

-- DropIndex
DROP INDEX "productos_empresaId_activo_idx";

-- DropIndex
DROP INDEX "productos_empresaId_stockActual_idx";

-- DropIndex
DROP INDEX "usuarios_empresaId_activo_idx";

-- DropIndex
DROP INDEX "usuarios_empresaId_rol_idx";

-- CreateTable
CREATE TABLE "cuentas_por_cobrar" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "montoOriginal" DECIMAL(12,2) NOT NULL,
    "montoCobrado" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "montoPendiente" DECIMAL(12,2) NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDING',
    "diasVencido" INTEGER NOT NULL DEFAULT 0,
    "ultimaGestion" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_por_cobrar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gestiones_cobranza" (
    "id" TEXT NOT NULL,
    "cuentaPorCobrarId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gestiones_cobranza_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_por_cobrar_facturaId_key" ON "cuentas_por_cobrar"("facturaId");

-- CreateIndex
CREATE INDEX "cuentas_por_cobrar_empresaId_idx" ON "cuentas_por_cobrar"("empresaId");

-- CreateIndex
CREATE INDEX "cuentas_por_cobrar_clienteId_idx" ON "cuentas_por_cobrar"("clienteId");

-- CreateIndex
CREATE INDEX "cuentas_por_cobrar_usuarioId_idx" ON "cuentas_por_cobrar"("usuarioId");

-- CreateIndex
CREATE INDEX "cuentas_por_cobrar_estado_idx" ON "cuentas_por_cobrar"("estado");

-- CreateIndex
CREATE INDEX "cuentas_por_cobrar_fechaVencimiento_idx" ON "cuentas_por_cobrar"("fechaVencimiento");

-- CreateIndex
CREATE INDEX "gestiones_cobranza_cuentaPorCobrarId_idx" ON "gestiones_cobranza"("cuentaPorCobrarId");

-- CreateIndex
CREATE INDEX "gestiones_cobranza_empresaId_idx" ON "gestiones_cobranza"("empresaId");

-- CreateIndex
CREATE INDEX "gestiones_cobranza_usuarioId_idx" ON "gestiones_cobranza"("usuarioId");

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_por_cobrar" ADD CONSTRAINT "cuentas_por_cobrar_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestiones_cobranza" ADD CONSTRAINT "gestiones_cobranza_cuentaPorCobrarId_fkey" FOREIGN KEY ("cuentaPorCobrarId") REFERENCES "cuentas_por_cobrar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestiones_cobranza" ADD CONSTRAINT "gestiones_cobranza_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
