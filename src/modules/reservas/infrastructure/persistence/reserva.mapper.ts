import { Reserva as ReservaPrisma } from '@prisma/client';
import { EstadoReserva } from '../../domain/estado-reserva.enum';
import { Reserva } from '../../domain/reserva.entity';

export class ReservaMapper {
  static toDomain(reservaPrisma: ReservaPrisma): Reserva {
    return new Reserva(
      reservaPrisma.id,
      reservaPrisma.usuarioId,
      reservaPrisma.puntoId,
      reservaPrisma.medicamentoId,
      reservaPrisma.inventarioId,
      reservaPrisma.cantidadReservada,
      reservaPrisma.estado as unknown as EstadoReserva,
      reservaPrisma.fechaSolicitud,
      reservaPrisma.fechaExpiracion,
    );
  }
}
