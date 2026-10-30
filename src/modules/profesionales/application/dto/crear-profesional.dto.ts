import { IsString, IsUUID } from 'class-validator';

export class CrearProfesionalDto {
  @IsString()
  registroMedico: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  especialidad: string;

  @IsUUID()
  puntoId: string;
}
