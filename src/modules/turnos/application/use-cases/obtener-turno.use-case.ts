import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';

@Injectable()
export class ObtenerTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
  ) {}

  async ejecutar(id: string): Promise<Turno> {
    const turno = await this.turnoRepository.buscarPorId(id);
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }
    return turno;
  }
}
