import { Servicio } from '../../domain/servicio.entity';

export class ServicioResponseDto {
  id: string;
  nombre: string;
  entidadId: string;

  static fromEntity(servicio: Servicio): ServicioResponseDto {
    const dto = new ServicioResponseDto();
    dto.id = servicio.id;
    dto.nombre = servicio.nombre;
    dto.entidadId = servicio.entidadId;
    return dto;
  }
}
