import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';

@Injectable()
export class CancelarTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
  ) {}

  async ejecutar(id: string): Promise<Turno> {
    const turno = await this.turnoRepository.buscarPorId(id);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (
      turno.estado === EstadoTurno.ATENDIDO ||
      turno.estado === EstadoTurno.CANCELADO
    ) {
      throw new BadRequestException(
        `El turno en estado ${turno.estado} no puede cancelarse`,
      );
    }

    return this.turnoRepository.actualizarEstado(id, EstadoTurno.CANCELADO);
  }
}
