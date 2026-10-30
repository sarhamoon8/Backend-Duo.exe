import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Profesional } from '../../domain/profesional.entity';
import { PROFESIONAL_REPOSITORY } from '../../domain/profesional.repository';
import type { ProfesionalRepository } from '../../domain/profesional.repository';

@Injectable()
export class ObtenerProfesionalUseCase {
  constructor(
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
  ) {}

  async ejecutar(id: string): Promise<Profesional> {
    const profesional = await this.profesionalRepository.buscarPorId(id);
    if (!profesional) {
      throw new NotFoundException('Profesional no encontrado');
    }
    return profesional;
  }
}
