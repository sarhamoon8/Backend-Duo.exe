import { EstadoReserva } from './estado-reserva.enum';

export class Reserva {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly puntoId: string,
    public readonly medicamentoId: string,
    public readonly inventarioId: string,
    public readonly cantidadReservada: number,
    public readonly estado: EstadoReserva,
    public readonly fechaSolicitud: Date,
    public readonly fechaExpiracion: Date,
  ) {}
}
