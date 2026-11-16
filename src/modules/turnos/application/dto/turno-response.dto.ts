import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';
import { EstimacionLlamado, llamableDesde } from '../../domain/tiempo-espera';

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
  // Solo para turnos PENDIENTE: en cuánto tiempo lo van a llamar. La hora
  // estimada nunca es anterior a `llamableDesde`, el margen que se le da a
  // la persona para llegar a la sede.
  minutosEstimadosLlamado: number | null;
  horaEstimadaLlamado: Date | null;
  llamableDesde: Date | null;
  horaLlamado: Date | null;
  horaFinalizacion: Date | null;
  creadoEn: Date;

  static fromEntity(
    turno: Turno,
    posicion: number | null,
    estimacion: EstimacionLlamado | null = null,
  ): TurnoResponseDto {
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
    dto.minutosEstimadosLlamado = estimacion?.minutosEstimados ?? null;
    dto.horaEstimadaLlamado = estimacion?.horaEstimadaLlamado ?? null;
    dto.llamableDesde =
      estimacion?.llamableDesde ??
      (turno.estado === EstadoTurno.PENDIENTE
        ? llamableDesde(turno.creadoEn)
        : null);
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
  // del mismo punto). Cada turno PENDIENTE trae `llamableDesde` para que el
  // personal sepa a quién ya puede llamar.
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
