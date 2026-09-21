import { Inject, Injectable } from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';

@Injectable()
export class ListarMisTurnosUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
  ) {}

  ejecutar(usuarioId: string): Promise<Turno[]> {
    return this.turnoRepository.listarPorUsuario(usuarioId);
  }
}
