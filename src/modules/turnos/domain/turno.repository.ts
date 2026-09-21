import { EstadoTurno } from './estado-turno.enum';
import { Turno } from './turno.entity';

export interface NuevoTurno {
  usuarioId: string;
  servicioId: string;
  posicion: number | null;
}

export interface TurnoRepository {
  crear(turno: NuevoTurno): Promise<Turno>;
  buscarPorId(id: string): Promise<Turno | null>;
  listarPorServicio(servicioId: string): Promise<Turno[]>;
  actualizarEstado(id: string, estado: EstadoTurno): Promise<Turno>;
  contarPendientesPorServicio(servicioId: string): Promise<number>;
}

export const TURNO_REPOSITORY = Symbol('TURNO_REPOSITORY');
