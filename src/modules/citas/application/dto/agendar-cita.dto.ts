import { IsISO8601, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AgendarCitaDto {
  @IsUUID()
  puntoId: string;

  @IsString()
  @IsNotEmpty()
  especialidad: string;

  // Hora elegida de las que devuelve la consulta de disponibilidad.
  @IsISO8601()
  fechaHora: string;
}
