import { Profesional } from '../../profesionales/domain/profesional.entity';
import { instanteColombia, diaSemanaIso, franjasDelDia } from './franjas';
import { HorarioProfesional } from './horario-profesional.entity';
import { OcupacionCita } from './cita.repository';

export interface ParametrosAsignacion {
  profesionales: readonly Profesional[];
  horarios: readonly HorarioProfesional[];
  // Citas activas de esos profesionales en la fecha consultada.
  ocupadas: readonly OcupacionCita[];
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
}

/**
 * Profesionales que pueden atender en esa fecha y hora (la tienen en su
 * horario y no tienen otra cita), del más recomendable al menos: primero el
 * que lleva menos citas ese día, para repartir la carga, y a igualdad por
 * apellido para que el resultado sea estable.
 */
export function candidatosParaFranja(
  params: ParametrosAsignacion,
): Profesional[] {
  const dia = diaSemanaIso(params.fecha);
  const instante = instanteColombia(params.fecha, params.hora).getTime();

  const carga = (profesionalId: string) =>
    params.ocupadas.filter((o) => o.profesionalId === profesionalId).length;

  return params.profesionales
    .filter((profesional) => {
      const trabaja = franjasDelDia(
        params.horarios.filter((h) => h.profesionalId === profesional.id),
        dia,
      ).includes(params.hora);
      const ocupado = params.ocupadas.some(
        (o) =>
          o.profesionalId === profesional.id &&
          o.fechaHora.getTime() === instante,
      );
      return trabaja && !ocupado;
    })
    .sort(
      (a, b) =>
        carga(a.id) - carga(b.id) || a.apellidos.localeCompare(b.apellidos),
    );
}
