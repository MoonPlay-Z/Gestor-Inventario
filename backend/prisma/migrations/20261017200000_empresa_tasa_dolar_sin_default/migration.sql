-- La tasa por defecto (36.5) era un placeholder histórico: toda empresa creada
-- sin una tasa explícita quedaba con 36.5 y el sistema convertía VES→USD con
-- esa tasa (bug reportado: "CxC usa una tasa de 36 Bs").
--
-- Se elimina el default y se limpian los valores heredados para que la
-- resolución de tasa use siempre un valor real: la tasa del BCV en modo AUTO
-- (la escribe el job diario) o la guardada a mano por el usuario en modo
-- MANUAL. Una empresa sin tasa queda en NULL y el resolver cae a la tasa global
-- del sistema / BCV (ver backend/src/utils/paymentCurrency.js).
ALTER TABLE "empresas" ALTER COLUMN "tasaDolar" DROP DEFAULT;
UPDATE "empresas" SET "tasaDolar" = NULL WHERE "tasaDolar" = 36.5;
