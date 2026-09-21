import { EstadoTurno } from './estado-turno.enum';

// La posición en la fila NO se persiste: se calcula en tiempo de consulta
// a partir del orden de creadoEn entre los turnos PENDIENTE del mismo
// servicio (ver ObtenerPosicionTurnoUseCase y TurnoResponseDto). Guardarla
// como columna producía posiciones desincronizadas tras cancelaciones y
// duplicadas bajo creación concurrente.
export class Turno {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly servicioId: string,
    public readonly estado: EstadoTurno,
    public readonly creadoEn: Date,
  ) {}
}
