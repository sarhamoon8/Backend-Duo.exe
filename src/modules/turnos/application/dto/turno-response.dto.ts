import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';

export class TurnoResponseDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  estado: string;
  posicion: number | null;
  creadoEn: Date;

  static fromEntity(turno: Turno, posicion: number | null): TurnoResponseDto {
    const dto = new TurnoResponseDto();
    dto.id = turno.id;
    dto.usuarioId = turno.usuarioId;
    dto.servicioId = turno.servicioId;
    dto.estado = turno.estado;
    dto.posicion = posicion;
    dto.creadoEn = turno.creadoEn;
    return dto;
  }

  // Para listas ya ordenadas por creadoEn ascendente (ver
  // TurnoRepository.listarPorServicio): calcula la posición de cada
  // turno PENDIENTE en memoria, sin una consulta adicional por turno.
  static fromEntities(turnos: Turno[]): TurnoResponseDto[] {
    let contadorPendientes = 0;
    return turnos.map((turno) => {
      const posicion =
        turno.estado === EstadoTurno.PENDIENTE
          ? ++contadorPendientes
          : null;
      return TurnoResponseDto.fromEntity(turno, posicion);
    });
  }
}
