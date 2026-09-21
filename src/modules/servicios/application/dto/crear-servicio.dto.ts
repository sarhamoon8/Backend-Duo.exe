import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CrearServicioDto {
  @IsString()
  codigoServicio: string;

  @IsString()
  nombre: string;

  @IsInt()
  @Min(1)
  tiempoPromedioMin: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsUUID()
  entidadId: string;
}
