import { EstadoCita } from './estado-cita.enum';

export class Cita {
  constructor(
    public readonly id: string,
    public readonly pacienteId: string,
    public readonly profesionalId: string,
    public readonly puntoId: string,
    public readonly especialidad: string,
    public readonly fechaHora: Date,
    public readonly estado: EstadoCita,
    public readonly creadoEn: Date,
  ) {}
}
