import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recordatorio } from '../../domain/recordatorio.entity';
import { RECORDATORIO_REPOSITORY } from '../../domain/recordatorio.repository';
import type { RecordatorioRepository } from '../../domain/recordatorio.repository';

@Injectable()
export class ActualizarEstadoRecordatorioUseCase {
  constructor(
    @Inject(RECORDATORIO_REPOSITORY)
    private readonly recordatorioRepository: RecordatorioRepository,
  ) {}

  async ejecutar(
    id: string,
    activo: boolean,
    usuarioId: string,
  ): Promise<Recordatorio> {
    const recordatorio = await this.recordatorioRepository.buscarPorId(id);
    if (!recordatorio) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    if (recordatorio.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes modificar el recordatorio de otro usuario');
    }

    return this.recordatorioRepository.actualizarActivo(id, activo);
  }
}
