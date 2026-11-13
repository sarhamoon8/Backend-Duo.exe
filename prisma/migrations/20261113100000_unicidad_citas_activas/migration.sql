-- La unicidad [profesionalId, fechaHora] debe ignorar las citas canceladas:
-- si no, una hora cancelada no se podría volver a reservar.
DROP INDEX "Cita_profesionalId_fechaHora_key";

CREATE UNIQUE INDEX "Cita_profesionalId_fechaHora_activa_key"
  ON "Cita"("profesionalId", "fechaHora")
  WHERE "estado" <> 'CANCELADA';

CREATE INDEX "Cita_profesionalId_fechaHora_idx" ON "Cita"("profesionalId", "fechaHora");
