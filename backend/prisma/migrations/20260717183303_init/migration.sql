-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'VOIDED');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT');

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "rifCedula" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 5,
    "precioVenta" DECIMAL(10,2) NOT NULL,
    "tasaImpuesto" DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "numeroFactura" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "impuestoTotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDING',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_factura" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "productoId" TEXT,
    "descripcionHistorica" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitarioHistorico" DECIMAL(10,2) NOT NULL,
    "tasaImpuestoAplicada" DECIMAL(5,2) NOT NULL,
    "subtotalLinea" DECIMAL(12,2) NOT NULL,
    "impuestoLinea" DECIMAL(12,2) NOT NULL,
    "totalLinea" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "facturaId" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "referenciaTransaccion" TEXT,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correlativos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "valor" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "correlativos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_rifCedula_key" ON "clientes"("rifCedula");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numeroFactura_key" ON "facturas"("numeroFactura");

-- CreateIndex
CREATE UNIQUE INDEX "correlativos_nombre_key" ON "correlativos"("nombre");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
