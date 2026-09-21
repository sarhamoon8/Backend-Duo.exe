import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';
import { USUARIO_REPOSITORY } from '../../../usuarios/domain/usuario.repository';
import type { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { SERVICIO_REPOSITORY } from '../../../servicios/domain/servicio.repository';
import type { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { CrearTurnoDto } from '../dto/crear-turno.dto';
import { generarCodigoTurno } from '../../domain/generar-codigo-turno';

@Injectable()
export class CrearTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
  ) {}

  async ejecutar(dto: CrearTurnoDto, usuarioId: string): Promise<Turno> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const servicio = await this.servicioRepository.buscarPorId(
      dto.servicioId,
    );
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (!servicio.activo) {
      throw new BadRequestException(
        'El servicio no está activo actualmente',
      );
    }

    const punto = await this.puntoDispensacionRepository.buscarPorId(
      dto.puntoId,
    );
    if (!punto) {
      throw new NotFoundException('Punto de dispensación no encontrado');
    }

    if (punto.entidadId !== servicio.entidadId) {
      throw new BadRequestException(
        'El servicio no pertenece a la entidad médica de este punto de dispensación',
      );
    }

    return this.turnoRepository.crear({
      usuarioId,
      servicioId: dto.servicioId,
      puntoId: dto.puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });
  }
}
