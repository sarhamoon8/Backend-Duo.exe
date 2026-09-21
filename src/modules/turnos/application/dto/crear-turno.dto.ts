import { IsUUID } from 'class-validator';

// usuarioId no viaja en el body: se toma del token del usuario
// autenticado (ver TurnoController.crear), para que nadie pueda crear
// turnos a nombre de otra persona. codigoAlfanumerico tampoco: lo genera
// el servidor (ver generarCodigoTurno).
export class CrearTurnoDto {
  @IsUUID()
  servicioId: string;

  @IsUUID()
  puntoId: string;
}
