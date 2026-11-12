import { IsBoolean } from 'class-validator';

export class ActualizarRecordatorioDto {
  @IsBoolean()
  activo: boolean;
}
