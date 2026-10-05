-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL,
    "codigoNacional" TEXT NOT NULL,
    "nombreGenerico" TEXT NOT NULL,
    "concentracion" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "laboratorioFabricante" TEXT NOT NULL,
    "requiereAutorizacion" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventario" (
    "id" TEXT NOT NULL,
    "puntoId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "stockReservado" INTEGER NOT NULL DEFAULT 0,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medicamento_codigoNacional_key" ON "Medicamento"("codigoNacional");

-- CreateIndex
CREATE UNIQUE INDEX "Inventario_puntoId_medicamentoId_lote_key" ON "Inventario"("puntoId", "medicamentoId", "lote");

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_puntoId_fkey" FOREIGN KEY ("puntoId") REFERENCES "PuntoDispensacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventario" ADD CONSTRAINT "Inventario_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

