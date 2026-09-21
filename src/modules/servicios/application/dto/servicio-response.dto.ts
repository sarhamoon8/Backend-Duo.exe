import { Servicio } from '../../domain/servicio.entity';

export class ServicioResponseDto {
  id: string;
  codigoServicio: string;
  nombre: string;
  tiempoPromedioMin: number;
  activo: boolean;
  entidadId: string;

  static fromEntity(servicio: Servicio): ServicioResponseDto {
    const dto = new ServicioResponseDto();
    dto.id = servicio.id;
    dto.codigoServicio = servicio.codigoServicio;
    dto.nombre = servicio.nombre;
    dto.tiempoPromedioMin = servicio.tiempoPromedioMin;
    dto.activo = servicio.activo;
    dto.entidadId = servicio.entidadId;
    return dto;
  }
}
