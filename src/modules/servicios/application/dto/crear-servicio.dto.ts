import { IsString, IsUUID } from 'class-validator';

export class CrearServicioDto {
  @IsString()
  nombre: string;

  @IsUUID()
  entidadId: string;
}
