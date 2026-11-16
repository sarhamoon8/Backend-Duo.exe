import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cita } from '../../domain/cita.entity';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { mensajeCitaAgendada } from '../../domain/mensajes-cita';
import { validarVentanaDeAgenda } from '../../domain/reglas-cita';
import { TipoNotificacion } from '../../../notificaciones/domain/tipo-notificacion.enum';
import { EnviarNotificacionUseCase } from '../../../notificaciones/application/use-cases/enviar-notificacion.use-case';
import { AsignadorDeDoctorService } from '../services/asignador-de-doctor.service';
import { AgendarCitaDto } from '../dto/agendar-cita.dto';

export interface CitaAgendada {
  cita: Cita;
  profesional: Profesional;
}

@Injectable()
export class AgendarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
    private readonly asignador: AsignadorDeDoctorService,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  /**
   * Agenda la cita y le asigna AUTOMÁTICAMENTE un doctor: de la especialidad
   * y la sede pedidas, que atienda a esa hora según su horario y no tenga
   * otra cita. Entre varios, el de menos carga ese día. Avisa al paciente.
   */
  async ejecutar(
    dto: AgendarCitaDto,
    pacienteId: string,
    ahora: Date = new Date(),
  ): Promise<CitaAgendada> {
    const fechaHora = new Date(dto.fechaHora);
    validarVentanaDeAgenda(fechaHora, ahora);

    const { hayDoctores, candidatos } = await this.asignador.candidatos(
      dto.puntoId,
      dto.especialidad,
      fechaHora,
    );
    if (!hayDoctores) {
      throw new NotFoundException(
        'No hay doctores de esa especialidad en la sede elegida',
      );
    }

    if (await this.citaRepository.pacienteTieneCitaEn(pacienteId, fechaHora)) {
      throw new ConflictException('Ya tienes una cita programada a esa hora');
    }

    // Si otro paciente toma la hora al mismo tiempo, se prueba con el siguiente.
    for (const profesional of candidatos) {
      const cita = await this.citaRepository.crear({
        pacienteId,
        profesionalId: profesional.id,
        puntoId: dto.puntoId,
        especialidad: profesional.especialidad,
        fechaHora,
      });
      if (cita) {
        await this.enviarNotificacionUseCase.ejecutar(
          pacienteId,
          TipoNotificacion.CITA_AGENDADA,
          'Cita confirmada',
          mensajeCitaAgendada(cita.especialidad, cita.fechaHora, profesional),
        );
        return { cita, profesional };
      }
    }

    throw new ConflictException(
      'No hay doctores disponibles a esa hora. Elige otra hora u otro día, o únete a la lista de espera.',
    );
  }
}
