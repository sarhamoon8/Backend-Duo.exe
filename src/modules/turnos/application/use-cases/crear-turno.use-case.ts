import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';
import { USUARIO_REPOSITORY } from '../../../usuarios/domain/usuario.repository';
import type { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { SERVICIO_REPOSITORY } from '../../../servicios/domain/servicio.repository';
import type { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { CrearTurnoDto } from '../dto/crear-turno.dto';

@Injectable()
export class CrearTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
  ) {}

  async ejecutar(dto: CrearTurnoDto): Promise<Turno> {
    const usuario = await this.usuarioRepository.buscarPorId(dto.usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const servicio = await this.servicioRepository.buscarPorId(
      dto.servicioId,
    );
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const pendientes = await this.turnoRepository.contarPendientesPorServicio(
      dto.servicioId,
    );

    return this.turnoRepository.crear({
      usuarioId: dto.usuarioId,
      servicioId: dto.servicioId,
      posicion: pendientes + 1,
    });
  }
}
