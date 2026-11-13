import { Inject, Injectable } from '@nestjs/common';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { HORARIO_REPOSITORY } from '../../domain/horario.repository';
import type { HorarioRepository } from '../../domain/horario.repository';
import { PROFESIONAL_REPOSITORY } from '../../../profesionales/domain/profesional.repository';
import type { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { candidatosParaFranja } from '../../domain/asignador-de-doctor';
import { aFechaYHoraColombia, rangoDelDia } from '../../domain/franjas';

export interface CandidatosDeCita {
  // Si la sede no tiene ningún doctor activo de esa especialidad.
  hayDoctores: boolean;
  // Doctores que atienden a esa hora y no tienen otra cita, del más
  // recomendable al menos.
  candidatos: Profesional[];
}

/**
 * Busca qué doctores pueden atender una cita en una sede, especialidad y
 * hora. Lo comparten agendar y reprogramar.
 */
@Injectable()
export class AsignadorDeDoctorService {
  constructor(
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
    @Inject(HORARIO_REPOSITORY)
    private readonly horarioRepository: HorarioRepository,
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
  ) {}

  async candidatos(
    puntoId: string,
    especialidad: string,
    fechaHora: Date,
  ): Promise<CandidatosDeCita> {
    const profesionales = await this.profesionalRepository.listar({
      puntoId,
      especialidad,
    });
    if (profesionales.length === 0) {
      return { hayDoctores: false, candidatos: [] };
    }

    const { fecha, hora } = aFechaYHoraColombia(fechaHora);
    const ids = profesionales.map((p) => p.id);
    const horarios = await this.horarioRepository.listarPorProfesionales(ids);
    const { desde, hasta } = rangoDelDia(fecha);
    const ocupadas = await this.citaRepository.ocupadasEntre(ids, desde, hasta);

    return {
      hayDoctores: true,
      candidatos: candidatosParaFranja({
        profesionales,
        horarios,
        ocupadas,
        fecha,
        hora,
      }),
    };
  }
}
