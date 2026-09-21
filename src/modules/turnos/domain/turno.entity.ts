import { EstadoTurno } from './estado-turno.enum';

export class Turno {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly servicioId: string,
    public readonly estado: EstadoTurno,
    public readonly posicion: number | null,
    public readonly creadoEn: Date,
  ) {}
}
