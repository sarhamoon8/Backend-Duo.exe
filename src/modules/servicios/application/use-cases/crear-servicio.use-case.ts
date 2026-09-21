import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Servicio } from '../../domain/servicio.entity';
import { SERVICIO_REPOSITORY } from '../../domain/servicio.repository';
import type { ServicioRepository } from '../../domain/servicio.repository';
import { ENTIDAD_MEDICA_REPOSITORY } from '../../../entidades-medicas/domain/entidad-medica.repository';
import type { EntidadMedicaRepository } from '../../../entidades-medicas/domain/entidad-medica.repository';
import { CrearServicioDto } from '../dto/crear-servicio.dto';

@Injectable()
export class CrearServicioUseCase {
  constructor(
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
    @Inject(ENTIDAD_MEDICA_REPOSITORY)
    private readonly entidadMedicaRepository: EntidadMedicaRepository,
  ) {}

  async ejecutar(dto: CrearServicioDto): Promise<Servicio> {
    const entidad = await this.entidadMedicaRepository.buscarPorId(
      dto.entidadId,
    );
    if (!entidad) {
      throw new NotFoundException('Entidad médica no encontrada');
    }

    return this.servicioRepository.crear({
      nombre: dto.nombre,
      entidadId: dto.entidadId,
    });
  }
}
