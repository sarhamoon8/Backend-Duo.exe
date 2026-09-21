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

const SIGUIENTE_ESTADO: Record<EstadoTurno, EstadoTurno | null> = {
  [EstadoTurno.PENDIENTE]: EstadoTurno.EN_CURSO,
  [EstadoTurno.EN_CURSO]: EstadoTurno.ATENDIDO,
  [EstadoTurno.ATENDIDO]: null,
  [EstadoTurno.CANCELADO]: null,
};

@Injectable()
export class AvanzarTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
  ) {}

  async ejecutar(id: string): Promise<Turno> {
    const turno = await this.turnoRepository.buscarPorId(id);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    const siguienteEstado = SIGUIENTE_ESTADO[turno.estado];
    if (!siguienteEstado) {
      throw new BadRequestException(
        `El turno en estado ${turno.estado} no puede avanzar`,
      );
    }

    return this.turnoRepository.actualizarEstado(id, siguienteEstado);
  }
}
