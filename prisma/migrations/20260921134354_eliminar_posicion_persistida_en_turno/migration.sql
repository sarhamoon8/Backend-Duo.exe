/*
  Warnings:

  - You are about to drop the column `posicion` on the `Turno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "posicion";

-- CreateIndex
CREATE INDEX "Turno_servicioId_estado_idx" ON "Turno"("servicioId", "estado");
