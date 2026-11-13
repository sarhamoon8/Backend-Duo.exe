import { Cita } from './cita.entity';

export interface NuevaCita {
  pacienteId: string;
  profesionalId: string;
  puntoId: string;
  especialidad: string;
  fechaHora: Date;
}

// Hora ya tomada de un profesional (citas no canceladas).
export interface OcupacionCita {
  profesionalId: string;
  fechaHora: Date;
}

export interface CitaRepository {
  // Devuelve null si el profesional ya tiene una cita activa a esa hora
  // (otro paciente la tomó entre la consulta y el guardado).
  crear(cita: NuevaCita): Promise<Cita | null>;
  buscarPorId(id: string): Promise<Cita | null>;
  // Más recientes primero.
  listarPorPaciente(pacienteId: string): Promise<Cita[]>;
  ocupadasEntre(
    profesionalIds: string[],
    desde: Date,
    hasta: Date,
  ): Promise<OcupacionCita[]>;
  pacienteTieneCitaEn(pacienteId: string, fechaHora: Date): Promise<boolean>;
  cancelar(id: string): Promise<Cita>;
}

export const CITA_REPOSITORY = Symbol('CITA_REPOSITORY');
