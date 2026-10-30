import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profesional } from '../../domain/profesional.entity';
import { PROFESIONAL_REPOSITORY } from '../../domain/profesional.repository';
import type { ProfesionalRepository } from '../../domain/profesional.repository';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { CrearProfesionalDto } from '../dto/crear-profesional.dto';

@Injectable()
export class CrearProfesionalUseCase {
  constructor(
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
  ) {}

  async ejecutar(dto: CrearProfesionalDto): Promise<Profesional> {
    const punto = await this.puntoDispensacionRepository.buscarPorId(
      dto.puntoId,
    );
    if (!punto) {
      throw new NotFoundException('Punto de dispensación no encontrado');
    }

    const existente = await this.profesionalRepository.buscarPorRegistroMedico(
      dto.registroMedico,
    );
    if (existente) {
      throw new ConflictException(
        'Ya existe un profesional con ese registro médico',
      );
    }

    return this.profesionalRepository.crear({
      registroMedico: dto.registroMedico,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      especialidad: dto.especialidad,
      puntoId: dto.puntoId,
    });
  }
}
