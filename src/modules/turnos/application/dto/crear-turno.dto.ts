import { IsUUID } from 'class-validator';

// usuarioId ya no viaja en el body: se toma del token del usuario
// autenticado (ver TurnoController.crear), para que nadie pueda crear
// turnos a nombre de otra persona.
export class CrearTurnoDto {
  @IsUUID()
  servicioId: string;
}
