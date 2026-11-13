import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cita } from '../../domain/cita.entity';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { mensajeCitaCancelada } from '../../domain/mensajes-cita';
import { validarPermisoSobreCita } from '../../domain/reglas-cita';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { TipoNotificacion } from '../../../notificaciones/domain/tipo-notificacion.enum';
import { EnviarNotificacionUseCase } from '../../../notificaciones/application/use-cases/enviar-notificacion.use-case';

@Injectable()
export class CancelarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  // El paciente cancela solo las suyas; el personal y el ADMIN, cualquiera.
  // Siempre se avisa al dueño de la cita.
  async ejecutar(
    id: string,
    usuario: { id: string; rol: Rol },
    ahora: Date = new Date(),
  ): Promise<Cita> {
    const cita = await this.citaRepository.buscarPorId(id);
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }
    validarPermisoSobreCita(cita, usuario, 'cancelar');
    if (cita.estado !== EstadoCita.PROGRAMADA) {
      throw new BadRequestException(
        'Solo se pueden cancelar citas programadas',
      );
    }
    if (cita.fechaHora.getTime() <= ahora.getTime()) {
      throw new BadRequestException('La cita ya pasó y no se puede cancelar');
    }

    const cancelada = await this.citaRepository.cancelar(id);
    await this.enviarNotificacionUseCase.ejecutar(
      cita.pacienteId,
      TipoNotificacion.CITA_CANCELADA,
      'Cita cancelada',
      mensajeCitaCancelada(cita.especialidad, cita.fechaHora),
    );
    return cancelada;
  }
}
