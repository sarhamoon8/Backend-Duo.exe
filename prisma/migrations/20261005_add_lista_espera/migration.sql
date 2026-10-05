-- CreateTable
CREATE TABLE "ListaEspera" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "puntoId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListaEspera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListaEspera_servicioId_puntoId_idx" ON "ListaEspera"("servicioId", "puntoId");

-- CreateIndex
CREATE UNIQUE INDEX "ListaEspera_usuarioId_servicioId_puntoId_key" ON "ListaEspera"("usuarioId", "servicioId", "puntoId");

-- AddForeignKey
ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListaEspera" ADD CONSTRAINT "ListaEspera_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

