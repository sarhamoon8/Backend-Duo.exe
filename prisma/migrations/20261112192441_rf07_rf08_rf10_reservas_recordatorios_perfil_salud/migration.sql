-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('ACTIVA', 'RECLAMADA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "puntoId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "cantidadReservada" INTEGER NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'ACTIVA',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "horaRecordatorio" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recordatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilSalud" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "grupoSanguineo" TEXT,
    "alergias" TEXT,
    "condicionesCronicas" TEXT,
    "contactoEmergenciaNombre" TEXT,
    "contactoEmergenciaTelefono" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilSalud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reserva_usuarioId_idx" ON "Reserva"("usuarioId");

-- CreateIndex
CREATE INDEX "Reserva_medicamentoId_puntoId_estado_idx" ON "Reserva"("medicamentoId", "puntoId", "estado");

-- CreateIndex
CREATE INDEX "Recordatorio_usuarioId_idx" ON "Recordatorio"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "PerfilSalud_usuarioId_key" ON "PerfilSalud"("usuarioId");

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilSalud" ADD CONSTRAINT "PerfilSalud_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
