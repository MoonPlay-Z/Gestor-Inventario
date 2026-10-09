ALTER TABLE "pagos" ADD COLUMN "monedaPago" TEXT;

UPDATE "pagos" AS pago
SET "monedaPago" = factura."moneda"
FROM "facturas" AS factura
WHERE factura."id" = pago."facturaId";

ALTER TABLE "pagos" ALTER COLUMN "monedaPago" SET DEFAULT 'USD';
ALTER TABLE "pagos" ALTER COLUMN "monedaPago" SET NOT NULL;
