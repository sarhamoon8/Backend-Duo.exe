import { EstadoTurno } from './estado-turno.enum';
import { Turno } from './turno.entity';

export interface NuevoTurno {
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  codigoAlfanumerico: string;
  prioridad?: boolean;
}

export interface TurnoRepository {
  crear(turno: NuevoTurno): Promise<Turno>;
  buscarPorId(id: string): Promise<Turno | null>;
  listarPorPunto(puntoId: string, servicioId?: string): Promise<Turno[]>;
  // Cancelación: solo cambia el estado, sin tocar ventanilla ni horas.
  actualizarEstado(id: string, estado: EstadoTurno): Promise<Turno>;
  // PENDIENTE -> EN_CURSO: asigna la ventanilla que llama y registra
  // horaLlamado.
  iniciarAtencion(id: string, ventanillaId: string): Promise<Turno>;
  // EN_CURSO -> ATENDIDO: registra horaFinalizacion.
  finalizarAtencion(id: string): Promise<Turno>;
  // Cuenta los turnos PENDIENTE del mismo punto y servicio creados antes
  // de `creadoEn`; es la base para calcular la posición en la fila sin
  // persistirla (ver Turno, en domain/turno.entity.ts).
  contarPendientesAntes(
    puntoId: string,
    servicioId: string,
    creadoEn: Date,
  ): Promise<number>;
}

export const TURNO_REPOSITORY = Symbol('TURNO_REPOSITORY');
