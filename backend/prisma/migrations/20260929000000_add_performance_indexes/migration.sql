-- Índices para optimizar consultas frecuentes del dashboard y listados

-- Facturas: filtros por empresa, estado y fecha
CREATE INDEX IF NOT EXISTS "facturas_empresaId_estado_idx" ON "facturas"("empresaId", "estado");
CREATE INDEX IF NOT EXISTS "facturas_usuarioId_estado_idx" ON "facturas"("usuarioId", "estado");
CREATE INDEX IF NOT EXISTS "facturas_fechaEmision_estado_idx" ON "facturas"("fechaEmision", "estado");
CREATE INDEX IF NOT EXISTS "facturas_fechaVencimiento_estado_idx" ON "facturas"("fechaVencimiento", "estado");

-- Pagos: agregaciones por fecha y factura
CREATE INDEX IF NOT EXISTS "pagos_fechaPago_idx" ON "pagos"("fechaPago");
CREATE INDEX IF NOT EXISTS "pagos_facturaId_fechaPago_idx" ON "pagos"("facturaId", "fechaPago");

-- Productos: filtros por empresa y stock
CREATE INDEX IF NOT EXISTS "productos_empresaId_activo_idx" ON "productos"("empresaId", "activo");
CREATE INDEX IF NOT EXISTS "productos_empresaId_stockActual_idx" ON "productos"("empresaId", "stockActual");

-- Clientes: búsqueda por empresa
CREATE INDEX IF NOT EXISTS "clientes_empresaId_razonSocial_idx" ON "clientes"("empresaId", "razonSocial");

-- Cotizaciones: filtros por empresa y estado
CREATE INDEX IF NOT EXISTS "cotizaciones_empresaId_estado_idx" ON "cotizaciones"("empresaId", "estado");
CREATE INDEX IF NOT EXISTS "cotizaciones_usuarioId_estado_idx" ON "cotizaciones"("usuarioId", "estado");

-- Usuarios: filtros por empresa y rol
CREATE INDEX IF NOT EXISTS "usuarios_empresaId_rol_idx" ON "usuarios"("empresaId", "rol");
CREATE INDEX IF NOT EXISTS "usuarios_empresaId_activo_idx" ON "usuarios"("empresaId", "activo");

-- Cierres de caja: filtros por usuario y estado
CREATE INDEX IF NOT EXISTS "cierres_caja_usuarioId_estado_idx" ON "cierres_caja"("usuarioId", "estado");
CREATE INDEX IF NOT EXISTS "cierres_caja_empresaId_estado_idx" ON "cierres_caja"("empresaId", "estado");
