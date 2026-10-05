import { IsDateString, IsInt, IsString, IsUUID, Min } from 'class-validator';

export class CrearInventarioDto {
  @IsUUID()
  puntoId: string;

  @IsUUID()
  medicamentoId: string;

  @IsString()
  lote: string;

  @IsInt()
  @Min(0)
  stockActual: number;

  @IsDateString()
  fechaVencimiento: string;
}
