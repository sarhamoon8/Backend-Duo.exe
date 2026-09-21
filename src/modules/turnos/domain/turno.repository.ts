import { EstadoTurno } from './estado-turno.enum';
import { Turno } from './turno.entity';

export interface NuevoTurno {
  usuarioId: string;
  servicioId: string;
}

export interface TurnoRepository {
  crear(turno: NuevoTurno): Promise<Turno>;
  buscarPorId(id: string): Promise<Turno | null>;
  listarPorServicio(servicioId: string): Promise<Turno[]>;
  actualizarEstado(id: string, estado: EstadoTurno): Promise<Turno>;
  // Cuenta los turnos PENDIENTE de un servicio creados antes de `creadoEn`;
  // es la base para calcular la posición de un turno en la fila sin
  // persistirla (ver Turno, en domain/turno.entity.ts).
  contarPendientesAntes(servicioId: string, creadoEn: Date): Promise<number>;
}

export const TURNO_REPOSITORY = Symbol('TURNO_REPOSITORY');
