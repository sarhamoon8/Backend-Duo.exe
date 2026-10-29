import { LogPeticion as LogPeticionPrisma } from '@prisma/client';
import { LogPeticion } from '../../domain/log-peticion.entity';

export class LogPeticionMapper {
  static toDomain(logPrisma: LogPeticionPrisma): LogPeticion {
    return new LogPeticion(
      logPrisma.id,
      logPrisma.metodo,
      logPrisma.ruta,
      logPrisma.codigoEstado,
      logPrisma.duracionMs,
      logPrisma.usuarioId,
      logPrisma.ip,
      logPrisma.mensaje,
      logPrisma.creadoEn,
    );
  }
}
