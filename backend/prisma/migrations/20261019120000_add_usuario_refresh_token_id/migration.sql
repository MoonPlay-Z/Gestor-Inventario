-- Rotación de refresh tokens con detección de reuso.
-- `refreshTokenId` guarda el jti vigente del refresh token. Al renovar se
-- emite un nuevo jti (el anterior queda inservible) y si un token viejo
-- vuelve a usarse (reuse) se revoca la sesión incrementando sessionVersion.
ALTER TABLE "usuarios" ADD COLUMN "refreshTokenId" TEXT;
