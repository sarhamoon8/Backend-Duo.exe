import { Inject, Injectable } from '@nestjs/common';
import { Recordatorio } from '../../domain/recordatorio.entity';
import { RECORDATORIO_REPOSITORY } from '../../domain/recordatorio.repository';
import type { RecordatorioRepository } from '../../domain/recordatorio.repository';

@Injectable()
export class ListarMisRecordatoriosUseCase {
  constructor(
    @Inject(RECORDATORIO_REPOSITORY)
    private readonly recordatorioRepository: RecordatorioRepository,
  ) {}

  async ejecutar(usuarioId: string): Promise<Recordatorio[]> {
    return this.recordatorioRepository.listarPorUsuario(usuarioId);
  }
}
