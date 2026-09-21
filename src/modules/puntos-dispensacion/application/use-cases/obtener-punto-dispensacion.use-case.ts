import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../domain/punto-dispensacion.repository';

@Injectable()
export class ObtenerPuntoDispensacionUseCase {
  constructor(
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
  ) {}

  async ejecutar(id: string): Promise<PuntoDispensacion> {
    const punto = await this.puntoDispensacionRepository.buscarPorId(id);
    if (!punto) {
      throw new NotFoundException('Punto de dispensación no encontrado');
    }
    return punto;
  }
}
