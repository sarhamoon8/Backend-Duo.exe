-- CreateEnum
CREATE TYPE "EstadoOperativoVentanilla" AS ENUM ('ACTIVA', 'INACTIVA');

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "codigoServicio" TEXT NOT NULL,
ADD COLUMN     "tiempoPromedioMin" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "codigoAlfanumerico" TEXT NOT NULL,
ADD COLUMN     "horaFinalizacion" TIMESTAMP(3),
ADD COLUMN     "horaLlamado" TIMESTAMP(3),
ADD COLUMN     "prioridad" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "puntoId" TEXT NOT NULL,
ADD COLUMN     "ventanillaId" TEXT;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "nombre",
ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "nombres" TEXT NOT NULL,
ADD COLUMN     "numeroDocumento" TEXT NOT NULL,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "tipoDocumento" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PuntoDispensacion" (
    "id" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "nombreSede" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "capacidadAtencion" INTEGER NOT NULL,

    CONSTRAINT "PuntoDispensacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ventanilla" (
    "id" TEXT NOT NULL,
    "puntoId" TEXT NOT NULL,
    "numeroModulo" TEXT NOT NULL,
    "estadoOperativo" "EstadoOperativoVentanilla" NOT NULL DEFAULT 'ACTIVA',

    CONSTRAINT "Ventanilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ventanilla_puntoId_numeroModulo_key" ON "Ventanilla"("puntoId", "numeroModulo");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_codigoServicio_key" ON "Servicio"("codigoServicio");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_codigoAlfanumerico_key" ON "Turno"("codigoAlfanumerico");

-- CreateIndex
CREATE INDEX "Turno_puntoId_estado_idx" ON "Turno"("puntoId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_numeroDocumento_key" ON "Usuario"("numeroDocumento");

-- AddForeignKey
ALTER TABLE "PuntoDispensacion" ADD CONSTRAINT "PuntoDispensacion_entidadId_fkey" FOREIGN KEY ("entidadId") REFERENCES "EntidadMedica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ventanilla" ADD CONSTRAINT "Ventanilla_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_ventanillaId_fkey" FOREIGN KEY ("ventanillaId") REFERENCES "Ventanilla"("id") ON DELETE SET NULL ON UPDATE CASCADE;

