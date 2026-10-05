import { IsUUID } from 'class-validator';

export class UnirseListaEsperaDto {
  @IsUUID()
  servicioId: string;

  @IsUUID()
  puntoId: string;
}
