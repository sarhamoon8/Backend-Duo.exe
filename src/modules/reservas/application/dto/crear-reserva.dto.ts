import { IsInt, IsUUID, Min } from 'class-validator';

export class CrearReservaDto {
  @IsUUID()
  puntoId: string;

  @IsUUID()
  medicamentoId: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}
