import { HorarioProfesional } from './horario-profesional.entity';

export interface HorarioRepository {
  listarPorProfesionales(
    profesionalIds: string[],
  ): Promise<HorarioProfesional[]>;
}

export const HORARIO_REPOSITORY = Symbol('HORARIO_REPOSITORY');
