import { Inject, Injectable } from '@nestjs/common';
import { Medicamento } from '../../domain/medicamento.entity';
import { MEDICAMENTO_REPOSITORY } from '../../domain/medicamento.repository';
import type { MedicamentoRepository } from '../../domain/medicamento.repository';

@Injectable()
export class ListarMedicamentosUseCase {
  constructor(
    @Inject(MEDICAMENTO_REPOSITORY)
    private readonly medicamentoRepository: MedicamentoRepository,
  ) {}

  ejecutar(): Promise<Medicamento[]> {
    return this.medicamentoRepository.listar();
  }
}
