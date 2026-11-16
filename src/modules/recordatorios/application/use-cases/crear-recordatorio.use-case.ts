import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Recordatorio } from '../../domain/recordatorio.entity';
import { RECORDATORIO_REPOSITORY } from '../../domain/recordatorio.repository';
import type { RecordatorioRepository } from '../../domain/recordatorio.repository';
import { MEDICAMENTO_REPOSITORY } from '../../../medicamentos/domain/medicamento.repository';
import type { MedicamentoRepository } from '../../../medicamentos/domain/medicamento.repository';
import { CrearRecordatorioDto } from '../dto/crear-recordatorio.dto';

@Injectable()
export class CrearRecordatorioUseCase {
  constructor(
    @Inject(RECORDATORIO_REPOSITORY)
    private readonly recordatorioRepository: RecordatorioRepository,
    @Inject(MEDICAMENTO_REPOSITORY)
    private readonly medicamentoRepository: MedicamentoRepository,
  ) {}

  async ejecutar(
    dto: CrearRecordatorioDto,
    usuarioId: string,
  ): Promise<Recordatorio> {
    const medicamento = await this.medicamentoRepository.buscarPorId(
      dto.medicamentoId,
    );
    if (!medicamento) {
      throw new NotFoundException('Medicamento no encontrado');
    }

    return this.recordatorioRepository.crear({
      usuarioId,
      medicamentoId: dto.medicamentoId,
      mensaje: dto.mensaje,
      horaRecordatorio: dto.horaRecordatorio,
    });
  }
}
