import { Turno as TurnoPrisma } from '@prisma/client';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';

export class TurnoMapper {
  static toDomain(turnoPrisma: TurnoPrisma): Turno {
    return new Turno(
      turnoPrisma.id,
      turnoPrisma.usuarioId,
      turnoPrisma.servicioId,
      turnoPrisma.puntoId,
      turnoPrisma.ventanillaId,
      turnoPrisma.codigoAlfanumerico,
      turnoPrisma.estado as unknown as EstadoTurno,
      turnoPrisma.prioridad,
      turnoPrisma.horaLlamado,
      turnoPrisma.horaFinalizacion,
      turnoPrisma.creadoEn,
    );
  }
}
