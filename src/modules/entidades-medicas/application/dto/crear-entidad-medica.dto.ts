import { IsString } from 'class-validator';

export class CrearEntidadMedicaDto {
  @IsString()
  nombre: string;
}
