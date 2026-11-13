-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "HorarioProfesional" (
    "id" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "HorarioProfesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "puntoId" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PROGRAMADA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HorarioProfesional_profesionalId_diaSemana_horaInicio_key" ON "HorarioProfesional"("profesionalId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "Cita_pacienteId_idx" ON "Cita"("pacienteId");

-- CreateIndex
CREATE INDEX "Cita_puntoId_especialidad_fechaHora_idx" ON "Cita"("puntoId", "especialidad", "fechaHora");

-- CreateIndex
CREATE UNIQUE INDEX "Cita_profesionalId_fechaHora_key" ON "Cita"("profesionalId", "fechaHora");

-- AddForeignKey
ALTER TABLE "HorarioProfesional" ADD CONSTRAINT "HorarioProfesional_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
