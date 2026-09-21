import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Servicio } from '../../domain/servicio.entity';
import { SERVICIO_REPOSITORY } from '../../domain/servicio.repository';
import type { ServicioRepository } from '../../domain/servicio.repository';

@Injectable()
export class ObtenerServicioUseCase {
  constructor(
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
  ) {}

  async ejecutar(id: string): Promise<Servicio> {
    const servicio = await this.servicioRepository.buscarPorId(id);
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return servicio;
  }
}
