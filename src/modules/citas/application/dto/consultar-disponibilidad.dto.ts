import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class ConsultarDisponibilidadDto {
  @IsUUID()
  puntoId: string;

  @IsString()
  @IsNotEmpty()
  especialidad: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener formato YYYY-MM-DD',
  })
  fecha: string;
}
