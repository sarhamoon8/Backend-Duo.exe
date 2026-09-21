import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';

export class TurnoResponseDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  ventanillaId: string | null;
  codigoAlfanumerico: string;
  estado: string;
  prioridad: boolean;
  posicion: number | null;
  horaLlamado: Date | null;
  horaFinalizacion: Date | null;
  creadoEn: Date;

  static fromEntity(turno: Turno, posicion: number | null): TurnoResponseDto {
    const dto = new TurnoResponseDto();
    dto.id = turno.id;
    dto.usuarioId = turno.usuarioId;
    dto.servicioId = turno.servicioId;
    dto.puntoId = turno.puntoId;
    dto.ventanillaId = turno.ventanillaId;
    dto.codigoAlfanumerico = turno.codigoAlfanumerico;
    dto.estado = turno.estado;
    dto.prioridad = turno.prioridad;
    dto.posicion = posicion;
    dto.horaLlamado = turno.horaLlamado;
    dto.horaFinalizacion = turno.horaFinalizacion;
    dto.creadoEn = turno.creadoEn;
    return dto;
  }

  // Para listas ya ordenadas por creadoEn ascendente (ver
  // TurnoRepository.listarPorPunto): calcula la posición de cada turno
  // PENDIENTE en memoria, sin una consulta adicional por turno. La fila
  // es por (puntoId, servicioId), así que el contador se lleva por
  // separado para cada servicio (la lista puede mezclar varios servicios
  // del mismo punto).
  static fromEntities(turnos: Turno[]): TurnoResponseDto[] {
    const contadoresPorServicio = new Map<string, number>();
    return turnos.map((turno) => {
      let posicion: number | null = null;
      if (turno.estado === EstadoTurno.PENDIENTE) {
        const anterior = contadoresPorServicio.get(turno.servicioId) ?? 0;
        posicion = anterior + 1;
        contadoresPorServicio.set(turno.servicioId, posicion);
      }
      return TurnoResponseDto.fromEntity(turno, posicion);
    });
  }
}
