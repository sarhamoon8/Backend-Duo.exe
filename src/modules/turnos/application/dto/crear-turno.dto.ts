import { IsUUID } from 'class-validator';

export class CrearTurnoDto {
  @IsUUID()
  usuarioId: string;

  @IsUUID()
  servicioId: string;
}
