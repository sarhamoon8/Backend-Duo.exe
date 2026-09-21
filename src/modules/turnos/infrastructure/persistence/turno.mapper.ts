import { Turno as TurnoPrisma } from '@prisma/client';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';

export class TurnoMapper {
  static toDomain(turnoPrisma: TurnoPrisma): Turno {
    return new Turno(
      turnoPrisma.id,
      turnoPrisma.usuarioId,
      turnoPrisma.servicioId,
      turnoPrisma.estado as unknown as EstadoTurno,
      turnoPrisma.posicion,
      turnoPrisma.creadoEn,
    );
  }
}
