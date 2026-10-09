-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'VOIDED');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT', 'PAGO_MOVIL');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('UNIDAD', 'KILOGRAMO', 'GRAMO', 'LITRO', 'MILILITRO', 'METRO', 'CENTIMETRO', 'BULTO', 'PAQUETE', 'CAJA', 'SACO', 'BOTELLA', 'LATA', 'DOCENA', 'MEDIA_DOCENA');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rif" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'trialing',
    "planType" TEXT,
    "trialStartsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "rolId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "datosAnteriores" JSONB,
    "datosNuevos" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "rifCedula" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "empresaId" TEXT,
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
    "imagenUrl" TEXT,
    "unidadMedida" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD',
    "stockActual" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "stockMinimo" DECIMAL(12,4) NOT NULL DEFAULT 5,
    "esVentaPorPeso" BOOLEAN NOT NULL DEFAULT false,
    "precioPorKilo" DECIMAL(10,2),
    "toleranciaPeso" DECIMAL(5,2),
    "precioVenta" DECIMAL(10,2) NOT NULL,
    "costoCompra" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "tasaImpuesto" DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    "categoria" TEXT NOT NULL DEFAULT 'General',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "numeroFactura" SERIAL NOT NULL,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "empresaId" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "impuestoTotal" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDING',
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "tasaCambio" DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    "cuotasTotales" INTEGER NOT NULL DEFAULT 1,
    "observaciones" TEXT,
    "anuladoPor" TEXT,
    "motivoAnulacion" TEXT,
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
    "cantidad" DECIMAL(12,4) NOT NULL,
    "unidadMedida" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD',
    "pesoReal" DECIMAL(10,3),
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
    "monedaPago" TEXT NOT NULL DEFAULT 'USD',
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

-- CreateTable
CREATE TABLE "cierres_caja" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "empresaId" TEXT,
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "montoInicial" DECIMAL(12,2) NOT NULL,
    "montoFinal" DECIMAL(12,2),
    "ingresosEfectivo" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "ingresosBanco" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "estado" TEXT NOT NULL DEFAULT 'OPEN',
    "observaciones" TEXT,
    "arqueoDetalle" TEXT,
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
    "empresaId" TEXT,
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
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'CAJA',
    "rolId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "empresaId" TEXT,
    "empresaRefId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'trialing',
    "planType" TEXT,
    "trialStartsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "sudoModeExpiresAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "noticias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "contenido" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'Anuncio',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "noticias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promociones" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "descuentoPorc" DECIMAL(5,2),
    "diasExtraTrial" INTEGER NOT NULL DEFAULT 0,
    "planDestino" TEXT,
    "usosMaximos" INTEGER NOT NULL DEFAULT 100,
    "usosActuales" INTEGER NOT NULL DEFAULT 0,
    "fechaFin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promociones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_rif_key" ON "empresas"("rif");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_modulo_accion_key" ON "permisos"("modulo", "accion");

-- CreateIndex
CREATE INDEX "audit_logs_empresaId_idx" ON "audit_logs"("empresaId");

-- CreateIndex
CREATE INDEX "audit_logs_usuarioId_idx" ON "audit_logs"("usuarioId");

-- CreateIndex
CREATE INDEX "audit_logs_accion_idx" ON "audit_logs"("accion");

-- CreateIndex
CREATE INDEX "clientes_empresaId_idx" ON "clientes"("empresaId");

-- CreateIndex
CREATE INDEX "clientes_razonSocial_idx" ON "clientes"("razonSocial");

-- CreateIndex
CREATE INDEX "clientes_rifCedula_idx" ON "clientes"("rifCedula");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_empresaId_rifCedula_key" ON "clientes"("empresaId", "rifCedula");

-- CreateIndex
CREATE INDEX "productos_empresaId_idx" ON "productos"("empresaId");

-- CreateIndex
CREATE INDEX "productos_nombre_idx" ON "productos"("nombre");

-- CreateIndex
CREATE INDEX "productos_categoria_idx" ON "productos"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "productos_empresaId_sku_key" ON "productos"("empresaId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numeroFactura_key" ON "facturas"("numeroFactura");

-- CreateIndex
CREATE INDEX "facturas_fechaEmision_idx" ON "facturas"("fechaEmision");

-- CreateIndex
CREATE INDEX "facturas_usuarioId_idx" ON "facturas"("usuarioId");

-- CreateIndex
CREATE INDEX "facturas_clienteId_idx" ON "facturas"("clienteId");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "facturas_empresaId_idx" ON "facturas"("empresaId");

-- CreateIndex
CREATE INDEX "items_factura_facturaId_idx" ON "items_factura"("facturaId");

-- CreateIndex
CREATE INDEX "pagos_facturaId_idx" ON "pagos"("facturaId");

-- CreateIndex
CREATE INDEX "pagos_fechaPago_idx" ON "pagos"("fechaPago");

-- CreateIndex
CREATE UNIQUE INDEX "correlativos_nombre_key" ON "correlativos"("nombre");

-- CreateIndex
CREATE INDEX "cierres_caja_usuarioId_idx" ON "cierres_caja"("usuarioId");

-- CreateIndex
CREATE INDEX "cierres_caja_empresaId_idx" ON "cierres_caja"("empresaId");

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
CREATE INDEX "cotizaciones_empresaId_idx" ON "cotizaciones"("empresaId");

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
CREATE UNIQUE INDEX "promociones_codigo_key" ON "promociones"("codigo");

-- Índices adicionales de rendimiento
CREATE INDEX IF NOT EXISTS "facturas_empresaId_estado_idx" ON "facturas"("empresaId", "estado");
CREATE INDEX IF NOT EXISTS "facturas_usuarioId_estado_idx" ON "facturas"("usuarioId", "estado");
CREATE INDEX IF NOT EXISTS "facturas_fechaEmision_estado_idx" ON "facturas"("fechaEmision", "estado");
CREATE INDEX IF NOT EXISTS "facturas_fechaVencimiento_estado_idx" ON "facturas"("fechaVencimiento", "estado");
CREATE INDEX IF NOT EXISTS "pagos_facturaId_fechaPago_idx" ON "pagos"("facturaId", "fechaPago");
CREATE INDEX IF NOT EXISTS "productos_empresaId_activo_idx" ON "productos"("empresaId", "activo");
CREATE INDEX IF NOT EXISTS "productos_empresaId_stockActual_idx" ON "productos"("empresaId", "stockActual");
CREATE INDEX IF NOT EXISTS "clientes_empresaId_razonSocial_idx" ON "clientes"("empresaId", "razonSocial");
CREATE INDEX IF NOT EXISTS "cotizaciones_empresaId_estado_idx" ON "cotizaciones"("empresaId", "estado");
CREATE INDEX IF NOT EXISTS "cotizaciones_usuarioId_estado_idx" ON "cotizaciones"("usuarioId", "estado");
CREATE INDEX IF NOT EXISTS "usuarios_empresaId_rol_idx" ON "usuarios"("empresaId", "rol");
CREATE INDEX IF NOT EXISTS "usuarios_empresaId_activo_idx" ON "usuarios"("empresaId", "activo");
CREATE INDEX IF NOT EXISTS "cierres_caja_usuarioId_estado_idx" ON "cierres_caja"("usuarioId", "estado");
CREATE INDEX IF NOT EXISTS "cierres_caja_empresaId_estado_idx" ON "cierres_caja"("empresaId", "estado");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_caja" ADD CONSTRAINT "cierres_caja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres_caja" ADD CONSTRAINT "cierres_caja_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_cotizacion" ADD CONSTRAINT "items_cotizacion_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaRefId_fkey" FOREIGN KEY ("empresaRefId") REFERENCES "empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_activacion" ADD CONSTRAINT "solicitudes_activacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
