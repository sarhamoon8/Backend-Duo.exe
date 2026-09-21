import { Inject, Injectable } from '@nestjs/common';
import { EntidadMedica } from '../../domain/entidad-medica.entity';
import { ENTIDAD_MEDICA_REPOSITORY } from '../../domain/entidad-medica.repository';
import type { EntidadMedicaRepository } from '../../domain/entidad-medica.repository';

@Injectable()
export class ListarEntidadesMedicasUseCase {
  constructor(
    @Inject(ENTIDAD_MEDICA_REPOSITORY)
    private readonly entidadMedicaRepository: EntidadMedicaRepository,
  ) {}

  ejecutar(): Promise<EntidadMedica[]> {
    return this.entidadMedicaRepository.listar();
  }
}
