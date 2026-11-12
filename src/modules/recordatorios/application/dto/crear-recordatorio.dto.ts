import { IsString, IsUUID, Matches } from 'class-validator';

export class CrearRecordatorioDto {
  @IsUUID()
  medicamentoId: string;

  @IsString()
  mensaje: string;

  // Formato 24h "HH:mm", p. ej. "08:00" o "20:30".
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'horaRecordatorio debe tener el formato HH:mm',
  })
  horaRecordatorio: string;
}
