import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Medicamento } from '../../domain/medicamento.entity';
import { MEDICAMENTO_REPOSITORY } from '../../domain/medicamento.repository';
import type { MedicamentoRepository } from '../../domain/medicamento.repository';

@Injectable()
export class ObtenerMedicamentoUseCase {
  constructor(
    @Inject(MEDICAMENTO_REPOSITORY)
    private readonly medicamentoRepository: MedicamentoRepository,
  ) {}

  async ejecutar(id: string): Promise<Medicamento> {
    const medicamento = await this.medicamentoRepository.buscarPorId(id);
    if (!medicamento) {
      throw new NotFoundException('Medicamento no encontrado');
    }
    return medicamento;
  }
}
