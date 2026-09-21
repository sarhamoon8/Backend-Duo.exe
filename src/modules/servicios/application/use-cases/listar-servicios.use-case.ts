import { Inject, Injectable } from '@nestjs/common';
import { Servicio } from '../../domain/servicio.entity';
import { SERVICIO_REPOSITORY } from '../../domain/servicio.repository';
import type { ServicioRepository } from '../../domain/servicio.repository';

@Injectable()
export class ListarServiciosUseCase {
  constructor(
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
  ) {}

  ejecutar(entidadId?: string): Promise<Servicio[]> {
    return entidadId
      ? this.servicioRepository.listarPorEntidad(entidadId)
      : this.servicioRepository.listar();
  }
}
