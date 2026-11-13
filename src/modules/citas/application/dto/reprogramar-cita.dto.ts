import { IsISO8601 } from 'class-validator';

export class ReprogramarCitaDto {
  // Nueva hora elegida de las que devuelve la consulta de disponibilidad.
  @IsISO8601()
  fechaHora: string;
}
