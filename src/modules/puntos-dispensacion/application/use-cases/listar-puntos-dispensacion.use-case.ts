import { Inject, Injectable } from '@nestjs/common';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../domain/punto-dispensacion.repository';

@Injectable()
export class ListarPuntosDispensacionUseCase {
  constructor(
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
  ) {}

  ejecutar(entidadId?: string): Promise<PuntoDispensacion[]> {
    return entidadId
      ? this.puntoDispensacionRepository.listarPorEntidad(entidadId)
      : this.puntoDispensacionRepository.listar();
  }
}
