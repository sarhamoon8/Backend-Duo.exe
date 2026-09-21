import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../domain/punto-dispensacion.repository';
import { ENTIDAD_MEDICA_REPOSITORY } from '../../../entidades-medicas/domain/entidad-medica.repository';
import type { EntidadMedicaRepository } from '../../../entidades-medicas/domain/entidad-medica.repository';
import { CrearPuntoDispensacionDto } from '../dto/crear-punto-dispensacion.dto';

@Injectable()
export class CrearPuntoDispensacionUseCase {
  constructor(
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
    @Inject(ENTIDAD_MEDICA_REPOSITORY)
    private readonly entidadMedicaRepository: EntidadMedicaRepository,
  ) {}

  async ejecutar(dto: CrearPuntoDispensacionDto): Promise<PuntoDispensacion> {
    const entidad = await this.entidadMedicaRepository.buscarPorId(
      dto.entidadId,
    );
    if (!entidad) {
      throw new NotFoundException('Entidad médica no encontrada');
    }

    return this.puntoDispensacionRepository.crear({
      entidadId: dto.entidadId,
      nombreSede: dto.nombreSede,
      direccion: dto.direccion,
      ciudad: dto.ciudad,
      telefonoContacto: dto.telefonoContacto,
      capacidadAtencion: dto.capacidadAtencion,
    });
  }
}
