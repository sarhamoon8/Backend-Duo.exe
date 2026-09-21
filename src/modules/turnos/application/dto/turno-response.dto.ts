import { Turno } from '../../domain/turno.entity';

export class TurnoResponseDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  estado: string;
  posicion: number | null;
  creadoEn: Date;

  static fromEntity(turno: Turno): TurnoResponseDto {
    const dto = new TurnoResponseDto();
    dto.id = turno.id;
    dto.usuarioId = turno.usuarioId;
    dto.servicioId = turno.servicioId;
    dto.estado = turno.estado;
    dto.posicion = turno.posicion;
    dto.creadoEn = turno.creadoEn;
    return dto;
  }
}
