import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { mensajeCitaReprogramada } from '../../domain/mensajes-cita';
import {
  validarPermisoSobreCita,
  validarVentanaDeAgenda,
} from '../../domain/reglas-cita';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { TipoNotificacion } from '../../../notificaciones/domain/tipo-notificacion.enum';
import { EnviarNotificacionUseCase } from '../../../notificaciones/application/use-cases/enviar-notificacion.use-case';
import { AsignadorDeDoctorService } from '../services/asignador-de-doctor.service';
import { ReprogramarCitaDto } from '../dto/reprogramar-cita.dto';
import type { CitaAgendada } from './agendar-cita.use-case';

@Injectable()
export class ReprogramarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
    private readonly asignador: AsignadorDeDoctorService,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  /**
   * Cambia la hora de una cita programada. Se conserva el mismo doctor si
   * está libre a la nueva hora (continuidad de la atención); si no, el
   * sistema asigna otro de la misma sede y especialidad. Avisa al paciente.
   */
  async ejecutar(
    id: string,
    dto: ReprogramarCitaDto,
    usuario: { id: string; rol: Rol },
    ahora: Date = new Date(),
  ): Promise<CitaAgendada> {
    const cita = await this.citaRepository.buscarPorId(id);
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }
    validarPermisoSobreCita(cita, usuario, 'reprogramar');
    if (cita.estado !== EstadoCita.PROGRAMADA) {
      throw new BadRequestException(
        'Solo se pueden reprogramar citas programadas',
      );
    }
    if (cita.fechaHora.getTime() <= ahora.getTime()) {
      throw new BadRequestException(
        'La cita ya pasó y no se puede reprogramar',
      );
    }

    const nuevaFechaHora = new Date(dto.fechaHora);
    validarVentanaDeAgenda(nuevaFechaHora, ahora);
    if (nuevaFechaHora.getTime() === cita.fechaHora.getTime()) {
      throw new BadRequestException('Elige una hora diferente a la actual');
    }

    if (
      await this.citaRepository.pacienteTieneCitaEn(
        cita.pacienteId,
        nuevaFechaHora,
      )
    ) {
      throw new ConflictException('Ya tienes una cita programada a esa hora');
    }

    const { candidatos } = await this.asignador.candidatos(
      cita.puntoId,
      cita.especialidad,
      nuevaFechaHora,
    );
    // El mismo doctor primero; después los demás en el orden recomendado.
    const ordenados = [
      ...candidatos.filter((p) => p.id === cita.profesionalId),
      ...candidatos.filter((p) => p.id !== cita.profesionalId),
    ];

    for (const profesional of ordenados) {
      const actualizada = await this.citaRepository.reprogramar(
        cita.id,
        profesional.id,
        nuevaFechaHora,
      );
      if (actualizada) {
        await this.enviarNotificacionUseCase.ejecutar(
          cita.pacienteId,
          TipoNotificacion.CITA_REPROGRAMADA,
          'Cita reprogramada',
          mensajeCitaReprogramada(
            actualizada.especialidad,
            actualizada.fechaHora,
            profesional,
          ),
        );
        return { cita: actualizada, profesional };
      }
    }

    throw new ConflictException(
      'No hay doctores disponibles a esa hora. Elige otra hora u otro día.',
    );
  }
}
