-- CreateTable
CREATE TABLE "LogPeticion" (
    "id" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "codigoEstado" INTEGER NOT NULL,
    "duracionMs" INTEGER NOT NULL,
    "usuarioId" TEXT,
    "ip" TEXT,
    "mensaje" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogPeticion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogPeticion_creadoEn_idx" ON "LogPeticion"("creadoEn");

-- CreateIndex
CREATE INDEX "LogPeticion_codigoEstado_idx" ON "LogPeticion"("codigoEstado");
