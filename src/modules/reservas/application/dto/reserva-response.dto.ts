import { EstadoReserva } from '../../domain/estado-reserva.enum';
import { Reserva } from '../../domain/reserva.entity';

export class ReservaResponseDto {
  id: string;
  usuarioId: string;
  puntoId: string;
  medicamentoId: string;
  cantidadReservada: number;
  estado: EstadoReserva;
  fechaSolicitud: Date;
  fechaExpiracion: Date;

  static fromEntity(reserva: Reserva): ReservaResponseDto {
    const dto = new ReservaResponseDto();
    dto.id = reserva.id;
    dto.usuarioId = reserva.usuarioId;
    dto.puntoId = reserva.puntoId;
    dto.medicamentoId = reserva.medicamentoId;
    dto.cantidadReservada = reserva.cantidadReservada;
    dto.estado = reserva.estado;
    dto.fechaSolicitud = reserva.fechaSolicitud;
    dto.fechaExpiracion = reserva.fechaExpiracion;
    return dto;
  }

  static fromEntities(reservas: Reserva[]): ReservaResponseDto[] {
    return reservas.map(ReservaResponseDto.fromEntity);
  }
}
