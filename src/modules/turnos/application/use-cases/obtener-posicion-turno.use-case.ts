import { Inject, Injectable } from '@nestjs/common';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';

// Calcula la posición de un turno en su fila (punto + servicio) en el
// momento de la consulta. Solo tiene sentido para turnos PENDIENTE; los
// demás no tienen posición.
@Injectable()
export class ObtenerPosicionTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
  ) {}

  async ejecutar(turno: Turno): Promise<number | null> {
    if (turno.estado !== EstadoTurno.PENDIENTE) {
      return null;
    }

    const anteriores = await this.turnoRepository.contarPendientesAntes(
      turno.puntoId,
      turno.servicioId,
      turno.creadoEn,
    );
    return anteriores + 1;
  }
}
