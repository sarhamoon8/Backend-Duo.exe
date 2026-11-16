import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Rol } from '../../usuarios/domain/rol.enum';
import { Cita } from './cita.entity';

// Una cita no se puede pedir con menos de este margen de anticipación.
export const MINUTOS_MINIMOS_ANTICIPACION = 30;
// No se agenda con más de este número de días de anticipación.
export const DIAS_MAXIMOS_ANTICIPACION = 60;

/** Valida que la hora pedida esté dentro de la ventana permitida para agendar. */
export function validarVentanaDeAgenda(fechaHora: Date, ahora: Date): void {
  if (Number.isNaN(fechaHora.getTime())) {
    throw new BadRequestException('La fecha y hora no son válidas');
  }
  const antelacionMin = (fechaHora.getTime() - ahora.getTime()) / 60_000;
  if (antelacionMin < MINUTOS_MINIMOS_ANTICIPACION) {
    throw new BadRequestException(
      `La cita debe pedirse con al menos ${MINUTOS_MINIMOS_ANTICIPACION} minutos de anticipación`,
    );
  }
  if (antelacionMin > DIAS_MAXIMOS_ANTICIPACION * 24 * 60) {
    throw new BadRequestException(
      `Solo se puede agendar hasta con ${DIAS_MAXIMOS_ANTICIPACION} días de anticipación`,
    );
  }
}

/**
 * El paciente gestiona (cancela o reprograma) solo sus citas; el personal y
 * el ADMIN, las de cualquiera.
 */
export function validarPermisoSobreCita(
  cita: Cita,
  usuario: { id: string; rol: Rol },
  accion: string,
): void {
  const esDelPaciente = cita.pacienteId === usuario.id;
  const esPersonal =
    usuario.rol === Rol.FUNCIONARIO || usuario.rol === Rol.ADMIN;
  if (!esDelPaciente && !esPersonal) {
    throw new ForbiddenException(
      `No puedes ${accion} la cita de otra persona`,
    );
  }
}
