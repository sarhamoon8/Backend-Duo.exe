import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CrearPuntoDispensacionDto {
  @IsUUID()
  entidadId: string;

  @IsString()
  nombreSede: string;

  @IsString()
  direccion: string;

  @IsString()
  ciudad: string;

  @IsOptional()
  @IsString()
  telefonoContacto?: string;

  @IsInt()
  @Min(1)
  capacidadAtencion: number;
}
