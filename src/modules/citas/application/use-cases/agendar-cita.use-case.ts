import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cita } from '../../domain/cita.entity';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { HORARIO_REPOSITORY } from '../../domain/horario.repository';
import type { HorarioRepository } from '../../domain/horario.repository';
import { PROFESIONAL_REPOSITORY } from '../../../profesionales/domain/profesional.repository';
import type { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { candidatosParaFranja } from '../../domain/asignador-de-doctor';
import { aFechaYHoraColombia, rangoDelDia } from '../../domain/franjas';
import { AgendarCitaDto } from '../dto/agendar-cita.dto';
import { MINUTOS_MINIMOS_ANTICIPACION } from './consultar-disponibilidad.use-case';

// No se agenda con más de este número de días de anticipación.
export const DIAS_MAXIMOS_ANTICIPACION = 60;

export interface CitaAgendada {
  cita: Cita;
  profesional: Profesional;
}

@Injectable()
export class AgendarCitaUseCase {
  constructor(
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
    @Inject(HORARIO_REPOSITORY)
    private readonly horarioRepository: HorarioRepository,
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
  ) {}

  /**
   * Agenda la cita y le asigna AUTOMÁTICAMENTE un doctor: de la especialidad
   * y la sede pedidas, que atienda a esa hora según su horario y no tenga
   * otra cita. Entre varios, el de menos carga ese día.
   */
  async ejecutar(
    dto: AgendarCitaDto,
    pacienteId: string,
    ahora: Date = new Date(),
  ): Promise<CitaAgendada> {
    const fechaHora = new Date(dto.fechaHora);
    if (Number.isNaN(fechaHora.getTime())) {
      throw new BadRequestException('La fecha y hora no son válidas');
    }
    const antelacionMin = (fechaHora.getTime() - ahora.getTime()) / 60_000;
    if (antelacionMin < MINUTOS_MINIMOS_ANTICIPACION) {
      throw new BadRequestException(
        `La cita debe pedirse con al menos ${MINUTOS_MINIMOS_ANTICIPACION} minutos de anticipación`,
      );
    }
    if (antelacionMin > DIAS_MAXIMOS_ANTICIPACION * 24 * 60) {
      throw new BadRequestException(
        `Solo se puede agendar hasta con ${DIAS_MAXIMOS_ANTICIPACION} días de anticipación`,
      );
    }

    const profesionales = await this.profesionalRepository.listar({
      puntoId: dto.puntoId,
      especialidad: dto.especialidad,
    });
    if (profesionales.length === 0) {
      throw new NotFoundException(
        'No hay doctores de esa especialidad en la sede elegida',
      );
    }

    if (await this.citaRepository.pacienteTieneCitaEn(pacienteId, fechaHora)) {
      throw new ConflictException('Ya tienes una cita programada a esa hora');
    }

    const { fecha, hora } = aFechaYHoraColombia(fechaHora);
    const ids = profesionales.map((p) => p.id);
    const horarios = await this.horarioRepository.listarPorProfesionales(ids);
    const { desde, hasta } = rangoDelDia(fecha);
    const ocupadas = await this.citaRepository.ocupadasEntre(ids, desde, hasta);

    const candidatos = candidatosParaFranja({
      profesionales,
      horarios,
      ocupadas,
      fecha,
      hora,
    });

    // Si otro paciente toma la hora al mismo tiempo, se prueba con el siguiente.
    for (const profesional of candidatos) {
      const cita = await this.citaRepository.crear({
        pacienteId,
        profesionalId: profesional.id,
        puntoId: dto.puntoId,
        especialidad: profesional.especialidad,
        fechaHora,
      });
      if (cita) return { cita, profesional };
    }

    throw new ConflictException(
      'No hay doctores disponibles a esa hora. Elige otra hora u otro día, o únete a la lista de espera.',
    );
  }
}
