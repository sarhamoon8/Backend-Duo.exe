import { Inject, Injectable } from '@nestjs/common';
import { EntidadMedica } from '../../domain/entidad-medica.entity';
import { ENTIDAD_MEDICA_REPOSITORY } from '../../domain/entidad-medica.repository';
import type { EntidadMedicaRepository } from '../../domain/entidad-medica.repository';
import { CrearEntidadMedicaDto } from '../dto/crear-entidad-medica.dto';

@Injectable()
export class CrearEntidadMedicaUseCase {
  constructor(
    @Inject(ENTIDAD_MEDICA_REPOSITORY)
    private readonly entidadMedicaRepository: EntidadMedicaRepository,
  ) {}

  ejecutar(dto: CrearEntidadMedicaDto): Promise<EntidadMedica> {
    return this.entidadMedicaRepository.crear({ nombre: dto.nombre });
  }
}
