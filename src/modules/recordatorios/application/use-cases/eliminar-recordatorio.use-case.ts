import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RECORDATORIO_REPOSITORY } from '../../domain/recordatorio.repository';
import type { RecordatorioRepository } from '../../domain/recordatorio.repository';

@Injectable()
export class EliminarRecordatorioUseCase {
  constructor(
    @Inject(RECORDATORIO_REPOSITORY)
    private readonly recordatorioRepository: RecordatorioRepository,
  ) {}

  async ejecutar(id: string, usuarioId: string): Promise<void> {
    const recordatorio = await this.recordatorioRepository.buscarPorId(id);
    if (!recordatorio) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    if (recordatorio.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes eliminar el recordatorio de otro usuario');
    }

    await this.recordatorioRepository.eliminar(id);
  }
}
