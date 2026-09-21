import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EntidadMedica } from '../../domain/entidad-medica.entity';
import { ENTIDAD_MEDICA_REPOSITORY } from '../../domain/entidad-medica.repository';
import type { EntidadMedicaRepository } from '../../domain/entidad-medica.repository';

@Injectable()
export class ObtenerEntidadMedicaUseCase {
  constructor(
    @Inject(ENTIDAD_MEDICA_REPOSITORY)
    private readonly entidadMedicaRepository: EntidadMedicaRepository,
  ) {}

  async ejecutar(id: string): Promise<EntidadMedica> {
    const entidad = await this.entidadMedicaRepository.buscarPorId(id);
    if (!entidad) {
      throw new NotFoundException('Entidad médica no encontrada');
    }
    return entidad;
  }
}
