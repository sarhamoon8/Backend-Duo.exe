-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('TURNO_CREADO', 'TURNO_CANCELADO', 'TURNO_EN_CURSO', 'TURNO_REASIGNADO');

-- CreateEnum
CREATE TYPE "EstadoEnvioNotificacion" AS ENUM ('ENVIADA', 'FALLIDA');

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estadoEnvio" "EstadoEnvioNotificacion" NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_idx" ON "Notificacion"("usuarioId");

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
