CREATE TABLE "bitacora" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT,
    "usuarioRol" TEXT,
    "categoria" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "descripcion" TEXT NOT NULL,
    "datosAnteriores" TEXT,
    "datosNuevos" TEXT,
    "monto" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "httpMethod" TEXT,
    "httpPath" TEXT,
    "httpStatus" INTEGER,
    "duracionMs" INTEGER,
    "hash" TEXT NOT NULL,
    "hashAnterior" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bitacora_empresaId_creadoEn_idx" ON "bitacora"("empresaId", "creadoEn");
CREATE INDEX "bitacora_categoria_creadoEn_idx" ON "bitacora"("categoria", "creadoEn");
CREATE INDEX "bitacora_accion_idx" ON "bitacora"("accion");
CREATE INDEX "bitacora_usuarioId_idx" ON "bitacora"("usuarioId");

CREATE OR REPLACE FUNCTION "rechazar_mutacion_bitacora"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'La bitácora es append-only';
END;
$$;

CREATE TRIGGER "bitacora_no_update_delete"
BEFORE UPDATE OR DELETE ON "bitacora"
FOR EACH ROW EXECUTE FUNCTION "rechazar_mutacion_bitacora"();

CREATE TRIGGER "bitacora_no_truncate"
BEFORE TRUNCATE ON "bitacora"
FOR EACH STATEMENT EXECUTE FUNCTION "rechazar_mutacion_bitacora"();

REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "bitacora" FROM PUBLIC;
