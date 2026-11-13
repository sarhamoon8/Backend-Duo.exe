import { Inject, Injectable } from '@nestjs/common';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { PROFESIONAL_REPOSITORY } from '../../../profesionales/domain/profesional.repository';
import type { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { Cita } from '../../domain/cita.entity';

export interface CitaConProfesional {
  cita: Cita;
  profesional: Profesional | null;
}

@Injectable()
export class ListarMisCitasUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
  ) {}

  async ejecutar(pacienteId: string): Promise<CitaConProfesional[]> {
    const citas = await this.citaRepository.listarPorPaciente(pacienteId);
    const idsUnicos = [...new Set(citas.map((c) => c.profesionalId))];
    const profesionales = new Map<string, Profesional | null>();
    await Promise.all(
      idsUnicos.map(async (id) => {
        profesionales.set(id, await this.profesionalRepository.buscarPorId(id));
      }),
    );
    return citas.map((cita) => ({
      cita,
      profesional: profesionales.get(cita.profesionalId) ?? null,
    }));
  }
}
