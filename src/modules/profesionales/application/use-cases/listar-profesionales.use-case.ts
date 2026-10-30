import { Inject, Injectable } from '@nestjs/common';
import { Profesional } from '../../domain/profesional.entity';
import { PROFESIONAL_REPOSITORY } from '../../domain/profesional.repository';
import type {
  FiltroProfesionales,
  ProfesionalRepository,
} from '../../domain/profesional.repository';

@Injectable()
export class ListarProfesionalesUseCase {
  constructor(
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
  ) {}

  ejecutar(filtro?: FiltroProfesionales): Promise<Profesional[]> {
    return this.profesionalRepository.listar(filtro);
  }
}
