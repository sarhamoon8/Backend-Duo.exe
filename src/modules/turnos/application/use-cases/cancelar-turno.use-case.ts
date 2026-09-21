import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';
import { Rol } from '../../../usuarios/domain/rol.enum';

const ROLES_STAFF = [Rol.FUNCIONARIO, Rol.ADMIN];

export interface ActorCancelacion {
  id: string;
  rol: Rol;
}

@Injectable()
export class CancelarTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
  ) {}

  async ejecutar(id: string, actor: ActorCancelacion): Promise<Turno> {
    const turno = await this.turnoRepository.buscarPorId(id);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    const esStaff = ROLES_STAFF.includes(actor.rol);
    if (!esStaff && turno.usuarioId !== actor.id) {
      throw new ForbiddenException('No puedes cancelar el turno de otro usuario');
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
