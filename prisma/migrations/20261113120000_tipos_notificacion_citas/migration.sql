-- AlterEnum: avisos de citas
ALTER TYPE "TipoNotificacion" ADD VALUE 'CITA_AGENDADA';
ALTER TYPE "TipoNotificacion" ADD VALUE 'CITA_CANCELADA';
ALTER TYPE "TipoNotificacion" ADD VALUE 'CITA_REPROGRAMADA';
