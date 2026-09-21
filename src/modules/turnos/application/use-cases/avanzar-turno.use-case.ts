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
import { VENTANILLA_REPOSITORY } from '../../../ventanillas/domain/ventanilla.repository';
import type { VentanillaRepository } from '../../../ventanillas/domain/ventanilla.repository';
import { EstadoOperativoVentanilla } from '../../../ventanillas/domain/estado-operativo-ventanilla.enum';

@Injectable()
export class AvanzarTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
    @Inject(VENTANILLA_REPOSITORY)
    private readonly ventanillaRepository: VentanillaRepository,
  ) {}

  async ejecutar(id: string, ventanillaId?: string): Promise<Turno> {
    const turno = await this.turnoRepository.buscarPorId(id);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (turno.estado === EstadoTurno.PENDIENTE) {
      return this.iniciarAtencion(turno, ventanillaId);
    }

    if (turno.estado === EstadoTurno.EN_CURSO) {
      return this.turnoRepository.finalizarAtencion(id);
    }

    throw new BadRequestException(
      `El turno en estado ${turno.estado} no puede avanzar`,
    );
  }

  private async iniciarAtencion(
    turno: Turno,
    ventanillaId?: string,
  ): Promise<Turno> {
    if (!ventanillaId) {
      throw new BadRequestException(
        'Se requiere ventanillaId para llamar a un turno PENDIENTE',
      );
    }

    const ventanilla = await this.ventanillaRepository.buscarPorId(
      ventanillaId,
    );
    if (!ventanilla) {
      throw new NotFoundException('Ventanilla no encontrada');
    }
    if (ventanilla.puntoId !== turno.puntoId) {
      throw new BadRequestException(
        'La ventanilla no pertenece al punto de dispensación de este turno',
      );
    }
    if (ventanilla.estadoOperativo !== EstadoOperativoVentanilla.ACTIVA) {
      throw new BadRequestException('La ventanilla no está activa');
    }

    return this.turnoRepository.iniciarAtencion(turno.id, ventanillaId);
  }
}
