import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Ventanilla } from '../../domain/ventanilla.entity';
import { VENTANILLA_REPOSITORY } from '../../domain/ventanilla.repository';
import type { VentanillaRepository } from '../../domain/ventanilla.repository';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { CrearVentanillaDto } from '../dto/crear-ventanilla.dto';

@Injectable()
export class CrearVentanillaUseCase {
  constructor(
    @Inject(VENTANILLA_REPOSITORY)
    private readonly ventanillaRepository: VentanillaRepository,
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
  ) {}

  async ejecutar(dto: CrearVentanillaDto): Promise<Ventanilla> {
    const punto = await this.puntoDispensacionRepository.buscarPorId(
      dto.puntoId,
    );
    if (!punto) {
      throw new NotFoundException('Punto de dispensación no encontrado');
    }

    return this.ventanillaRepository.crear({
      puntoId: dto.puntoId,
      numeroModulo: dto.numeroModulo,
    });
  }
}
