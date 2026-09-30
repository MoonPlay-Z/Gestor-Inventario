-- Crear enum UnidadMedida
CREATE TYPE "UnidadMedida" AS ENUM (
  'UNIDAD',
  'KILOGRAMO',
  'GRAMO',
  'LITRO',
  'MILILITRO',
  'METRO',
  'CENTIMETRO',
  'BULTO',
  'PAQUETE',
  'CAJA',
  'SACO',
  'BOTELLA',
  'LATA',
  'DOCENA',
  'MEDIA_DOCENA'
);

-- Agregar campos de unidad de medida y venta por peso a productos
ALTER TABLE "productos" ADD COLUMN "unidadMedida" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD';
ALTER TABLE "productos" ADD COLUMN "esVentaPorPeso" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "productos" ADD COLUMN "precioPorKilo" DECIMAL(10,2);
ALTER TABLE "productos" ADD COLUMN "toleranciaPeso" DECIMAL(5,2);

-- Cambiar stock de Int a Decimal
ALTER TABLE "productos" ALTER COLUMN "stockActual" TYPE DECIMAL(12,4) USING "stockActual"::DECIMAL(12,4);
ALTER TABLE "productos" ALTER COLUMN "stockMinimo" TYPE DECIMAL(12,4) USING "stockMinimo"::DECIMAL(12,4);

-- Agregar campos a items_factura
ALTER TABLE "items_factura" ALTER COLUMN "cantidad" TYPE DECIMAL(12,4) USING "cantidad"::DECIMAL(12,4);
ALTER TABLE "items_factura" ADD COLUMN "unidadMedida" "UnidadMedida" NOT NULL DEFAULT 'UNIDAD';
ALTER TABLE "items_factura" ADD COLUMN "pesoReal" DECIMAL(10,3);
