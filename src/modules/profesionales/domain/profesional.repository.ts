import { Profesional } from './profesional.entity';

export interface NuevoProfesional {
  registroMedico: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  puntoId: string;
}

export interface FiltroProfesionales {
  puntoId?: string;
  especialidad?: string;
}

export interface ProfesionalRepository {
  crear(profesional: NuevoProfesional): Promise<Profesional>;
  buscarPorId(id: string): Promise<Profesional | null>;
  buscarPorRegistroMedico(registroMedico: string): Promise<Profesional | null>;
  // Solo profesionales activos, ordenados por apellidos.
  listar(filtro?: FiltroProfesionales): Promise<Profesional[]>;
}

export const PROFESIONAL_REPOSITORY = Symbol('PROFESIONAL_REPOSITORY');
