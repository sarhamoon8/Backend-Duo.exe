import { IsString, IsUUID } from 'class-validator';

export class CrearVentanillaDto {
  @IsUUID()
  puntoId: string;

  @IsString()
  numeroModulo: string;
}
