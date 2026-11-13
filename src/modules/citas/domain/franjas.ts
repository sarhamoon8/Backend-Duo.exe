import { HorarioProfesional } from './horario-profesional.entity';

// Colombia es UTC-5 todo el año (no tiene horario de verano).
const OFFSET_COLOMBIA_HORAS = 5;
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function esFechaValida(fecha: string): boolean {
  if (!REGEX_FECHA.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    d.getUTCFullYear() === anio &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia
  );
}

/** Día de la semana ISO de una fecha YYYY-MM-DD: 1 = lunes ... 7 = domingo. */
export function diaSemanaIso(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const dow = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

/** Instante UTC que corresponde a `hora` (HH:mm) de `fecha` en Colombia. */
export function instanteColombia(fecha: string, hora: string): Date {
  const [anio, mes, dia] = fecha.split('-').map(Number) as [
    number,
    number,
    number,
  ];
  const [h, m] = hora.split(':').map(Number) as [number, number];
  return new Date(Date.UTC(anio, mes - 1, dia, h + OFFSET_COLOMBIA_HORAS, m));
}

/** Inicio (inclusive) y fin (exclusive) de un día colombiano. */
export function rangoDelDia(fecha: string): { desde: Date; hasta: Date } {
  const desde = instanteColombia(fecha, '00:00');
  return { desde, hasta: new Date(desde.getTime() + 24 * 3600_000) };
}

/** Fecha (YYYY-MM-DD) y hora (HH:mm) en Colombia de un instante. */
export function aFechaYHoraColombia(instante: Date): {
  fecha: string;
  hora: string;
} {
  const local = new Date(instante.getTime() - OFFSET_COLOMBIA_HORAS * 3600_000);
  const iso = local.toISOString();
  return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

/** Horas de inicio (HH:mm) de las citas posibles de un día de la semana. */
export function franjasDelDia(
  horarios: readonly HorarioProfesional[],
  diaSemana: number,
): string[] {
  const franjas: string[] = [];
  for (const horario of horarios.filter((h) => h.diaSemana === diaSemana)) {
    const [hi, mi] = horario.horaInicio.split(':').map(Number) as [
      number,
      number,
    ];
    const [hf, mf] = horario.horaFin.split(':').map(Number) as [number, number];
    for (
      let t = hi * 60 + mi;
      t + horario.duracionMin <= hf * 60 + mf;
      t += horario.duracionMin
    ) {
      franjas.push(
        `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
      );
    }
  }
  return franjas.sort();
}
