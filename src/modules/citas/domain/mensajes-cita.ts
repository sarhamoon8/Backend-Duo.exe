const ZONA_COLOMBIA = 'America/Bogota';

/** «martes, 17 de noviembre de 2026, a las 9:30 a. m.» en hora de Colombia. */
export function describirFechaHora(fechaHora: Date): string {
  const fecha = new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA_COLOMBIA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fechaHora);
  const hora = new Intl.DateTimeFormat('es-CO', {
    timeZone: ZONA_COLOMBIA,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(fechaHora);
  return `${fecha}, a las ${hora}`;
}

export function nombreDoctor(profesional: {
  nombres: string;
  apellidos: string;
}): string {
  return `Dr(a). ${profesional.nombres} ${profesional.apellidos}`;
}

export function mensajeCitaAgendada(
  especialidad: string,
  fechaHora: Date,
  profesional: { nombres: string; apellidos: string },
): string {
  return `Tu cita de ${especialidad} quedó confirmada para el ${describirFechaHora(fechaHora)} con ${nombreDoctor(profesional)}.`;
}

export function mensajeCitaCancelada(
  especialidad: string,
  fechaHora: Date,
): string {
  return `Tu cita de ${especialidad} del ${describirFechaHora(fechaHora)} fue cancelada. Puedes pedir una nueva cuando quieras.`;
}

export function mensajeCitaReprogramada(
  especialidad: string,
  nuevaFechaHora: Date,
  profesional: { nombres: string; apellidos: string },
): string {
  return `Tu cita de ${especialidad} fue reprogramada para el ${describirFechaHora(nuevaFechaHora)} con ${nombreDoctor(profesional)}.`;
}
