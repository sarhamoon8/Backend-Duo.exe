-- CreateTable
CREATE TABLE "Profesional" (
    "id" TEXT NOT NULL,
    "registroMedico" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "puntoId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_registroMedico_key" ON "Profesional"("registroMedico");

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
