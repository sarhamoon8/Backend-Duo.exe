import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';

export class PuntoDispensacionResponseDto {
  id: string;
  entidadId: string;
  nombreSede: string;
  direccion: string;
  ciudad: string;
  zona: string | null;
  telefonoContacto: string | null;
  capacidadAtencion: number;

  static fromEntity(
    punto: PuntoDispensacion,
  ): PuntoDispensacionResponseDto {
    const dto = new PuntoDispensacionResponseDto();
    dto.id = punto.id;
    dto.entidadId = punto.entidadId;
    dto.nombreSede = punto.nombreSede;
    dto.direccion = punto.direccion;
    dto.ciudad = punto.ciudad;
    dto.zona = punto.zona;
    dto.telefonoContacto = punto.telefonoContacto;
    dto.capacidadAtencion = punto.capacidadAtencion;
    return dto;
  }
}
