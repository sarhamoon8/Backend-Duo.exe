import { EstadoReserva } from './estado-reserva.enum';
import { Reserva } from './reserva.entity';

export interface NuevaReserva {
  usuarioId: string;
  puntoId: string;
  medicamentoId: string;
  inventarioId: string;
  cantidadReservada: number;
  fechaExpiracion: Date;
}

export interface ReservaRepository {
  crear(reserva: NuevaReserva): Promise<Reserva>;
  buscarPorId(id: string): Promise<Reserva | null>;
  // Todas las reservas del usuario, cualquier estado, más reciente primero.
  listarPorUsuario(usuarioId: string): Promise<Reserva[]>;
  actualizarEstado(id: string, estado: EstadoReserva): Promise<Reserva>;
}

export const RESERVA_REPOSITORY = Symbol('RESERVA_REPOSITORY');
