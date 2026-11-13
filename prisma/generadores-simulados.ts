/**
 * Generadores deterministas de datos SIMULADOS (horarios, citas, turnos,
 * lista de espera y notificaciones). Son funciones puras: reciben la fecha
 * actual y los ids ya existentes en la base y devuelven filas listas para
 * insertar, de modo que el seed las pueda reproducir siempre igual.
 */

export const DIAS_HISTORIAL = 28;
const OFFSET_COLOMBIA_H = 5; // Colombia es UTC-5 y no tiene horario de verano.

/** Generador pseudoaleatorio determinista (mulberry32). */
export function crearAleatorio(semilla: number) {
  let a = semilla >>> 0;
  const siguiente = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    siguiente,
    entero: (min: number, max: number) => min + Math.floor(siguiente() * (max - min + 1)),
    elegir: <T>(lista: readonly T[]): T => lista[Math.floor(siguiente() * lista.length)]!,
  };
}

// ── Fechas en hora de Colombia ───────────────────────────────────────────────

/** Fecha (año, mes, día) de hoy en Colombia, como medianoche UTC ficticia. */
function hoyColombia(ahora: Date): Date {
  const local = new Date(ahora.getTime() - OFFSET_COLOMBIA_H * 3600_000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

/** Día de la semana ISO: 1 = lunes ... 7 = domingo, para `ahora + dias`. */
export function diaSemanaIso(ahora: Date, dias: number): number {
  const dia = new Date(hoyColombia(ahora).getTime() + dias * 86_400_000).getUTCDay();
  return dia === 0 ? 7 : dia;
}

/** Instante UTC que corresponde a `HH:mm` en Colombia, `dias` días desde hoy. */
export function fechaColombia(ahora: Date, dias: number, hora: string): Date {
  const [h, m] = hora.split(':').map(Number) as [number, number];
  const base = hoyColombia(ahora).getTime() + dias * 86_400_000;
  return new Date(base + (h + OFFSET_COLOMBIA_H) * 3600_000 + m * 60_000);
}

function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60_000);
}

// ── Horarios de los doctores ─────────────────────────────────────────────────

export interface HorarioSimulado {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionMin: number;
}

const PATRONES_HORARIO: HorarioSimulado[][] = [
  // Lunes a viernes, jornada partida.
  [1, 2, 3, 4, 5].flatMap((d) => [
    { diaSemana: d, horaInicio: '08:00', horaFin: '12:00', duracionMin: 30 },
    { diaSemana: d, horaInicio: '14:00', horaFin: '17:00', duracionMin: 30 },
  ]),
  // Lunes, miércoles y viernes, solo mañana.
  [1, 3, 5].map((d) => ({ diaSemana: d, horaInicio: '07:00', horaFin: '13:00', duracionMin: 30 })),
  // Martes y jueves todo el día, sábado en la mañana.
  [
    ...[2, 4].flatMap((d) => [
      { diaSemana: d, horaInicio: '08:00', horaFin: '12:00', duracionMin: 30 },
      { diaSemana: d, horaInicio: '14:00', horaFin: '18:00', duracionMin: 30 },
    ]),
    { diaSemana: 6, horaInicio: '08:00', horaFin: '12:00', duracionMin: 30 },
  ],
  // Lunes a viernes, solo tarde.
  [1, 2, 3, 4, 5].map((d) => ({ diaSemana: d, horaInicio: '13:00', horaFin: '18:00', duracionMin: 30 })),
];

/** Horario semanal del doctor número `indice` (se reparten cuatro patrones). */
export function horariosDelProfesional(indice: number): HorarioSimulado[] {
  return PATRONES_HORARIO[indice % PATRONES_HORARIO.length]!;
}

/** Horas de inicio (`HH:mm`) de cada cita posible un día dado de la semana. */
export function franjasDelDia(horarios: readonly HorarioSimulado[], diaSemana: number): string[] {
  const franjas: string[] = [];
  for (const h of horarios.filter((x) => x.diaSemana === diaSemana)) {
    const [hi, mi] = h.horaInicio.split(':').map(Number) as [number, number];
    const [hf, mf] = h.horaFin.split(':').map(Number) as [number, number];
    for (let t = hi * 60 + mi; t + h.duracionMin <= hf * 60 + mf; t += h.duracionMin) {
      franjas.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
    }
  }
  return franjas;
}

// ── Citas ────────────────────────────────────────────────────────────────────

export interface ProfesionalConId {
  id: string;
  puntoId: string;
  especialidad: string;
  indice: number;
}

export interface CitaSimulada {
  pacienteId: string;
  profesionalId: string;
  puntoId: string;
  especialidad: string;
  fechaHora: Date;
  estado: 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA';
}

/**
 * Citas pasadas (completadas o canceladas) y próximas (programadas). El primer
 * paciente de la lista es el de la demo: siempre tiene una cita pasada y una
 * próxima. El doctor con `indice` 1 queda con TODA su agenda llena el próximo
 * día que atiende, para poder mostrar el caso «sin disponibilidad».
 */
export function generarCitas(ahora: Date, profesionales: readonly ProfesionalConId[], pacienteIds: readonly string[]): CitaSimulada[] {
  const azar = crearAleatorio(2026);
  const citas: CitaSimulada[] = [];
  const ocupadas = new Set<string>();

  const agregar = (p: ProfesionalConId, pacienteId: string, dias: number, hora: string, estado: CitaSimulada['estado']) => {
    const fechaHora = fechaColombia(ahora, dias, hora);
    const clave = `${p.id}|${fechaHora.toISOString()}`;
    if (ocupadas.has(clave)) return;
    ocupadas.add(clave);
    citas.push({ pacienteId, profesionalId: p.id, puntoId: p.puntoId, especialidad: p.especialidad, fechaHora, estado });
  };

  for (const p of profesionales) {
    const horarios = horariosDelProfesional(p.indice);
    for (let dias = -21; dias <= 10; dias++) {
      if (dias === 0) continue;
      const franjas = franjasDelDia(horarios, diaSemanaIso(ahora, dias));
      if (franjas.length === 0 || azar.siguiente() < 0.4) continue;
      const cuantas = azar.entero(1, Math.min(3, franjas.length));
      for (let k = 0; k < cuantas; k++) {
        const estado = dias < 0 ? (azar.siguiente() < 0.85 ? 'COMPLETADA' : 'CANCELADA') : 'PROGRAMADA';
        agregar(p, azar.elegir(pacienteIds), dias, azar.elegir(franjas), estado);
      }
    }
  }

  // Agenda completa de un doctor el próximo día que atiende.
  const lleno = profesionales.find((p) => p.indice === 1);
  if (lleno) {
    const horarios = horariosDelProfesional(lleno.indice);
    const dias = Array.from({ length: 10 }, (_, i) => i + 1).find((d) => franjasDelDia(horarios, diaSemanaIso(ahora, d)).length > 0);
    if (dias !== undefined) {
      for (const hora of franjasDelDia(horarios, diaSemanaIso(ahora, dias))) {
        agregar(lleno, azar.elegir(pacienteIds), dias, hora, 'PROGRAMADA');
      }
    }
  }

  // Citas fijas del paciente de la demo (medicina general, primer doctor).
  const demo = pacienteIds[0];
  const general = profesionales.find((p) => p.indice === 0);
  if (demo && general) {
    const horarios = horariosDelProfesional(general.indice);
    const buscar = (desde: number, paso: number) => {
      for (let d = desde; Math.abs(d) <= 30; d += paso) {
        const franjas = franjasDelDia(horarios, diaSemanaIso(ahora, d));
        if (franjas.length > 0) return { dias: d, hora: franjas[0]! };
      }
      return undefined;
    };
    const pasada = buscar(-5, -1);
    const proxima = buscar(3, 1);
    if (pasada) agregar(general, demo, pasada.dias, pasada.hora, 'COMPLETADA');
    if (proxima) agregar(general, demo, proxima.dias, proxima.hora, 'PROGRAMADA');
  }

  return citas;
}

// ── Turnos ───────────────────────────────────────────────────────────────────

export interface PuntoConVentanillas {
  id: string;
  ventanillaIds: string[];
}

export interface ServicioConId {
  id: string;
  tiempoPromedioMin: number;
}

export interface TurnoSimulado {
  codigoAlfanumerico: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  ventanillaId: string | null;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'ATENDIDO' | 'CANCELADO';
  prioridad: boolean;
  creadoEn: Date;
  horaLlamado: Date | null;
  horaFinalizacion: Date | null;
}

/** Hora de llegada con picos a media mañana y a primera hora de la tarde. */
function horaDeLlegada(azar: ReturnType<typeof crearAleatorio>): string {
  const hora = azar.siguiente() < 0.55 ? azar.entero(7, 11) : azar.entero(13, 16);
  return `${String(hora).padStart(2, '0')}:${String(azar.entero(0, 59)).padStart(2, '0')}`;
}

/** Turnos atendidos y cancelados de las últimas semanas (alimentan los reportes). */
export function generarHistorialTurnos(
  ahora: Date,
  puntos: readonly PuntoConVentanillas[],
  servicios: readonly ServicioConId[],
  pacienteIds: readonly string[],
): TurnoSimulado[] {
  const azar = crearAleatorio(77);
  const turnos: TurnoSimulado[] = [];
  for (let atras = DIAS_HISTORIAL; atras >= 1; atras--) {
    if (diaSemanaIso(ahora, -atras) === 7) continue;
    puntos.forEach((punto, p) => {
      const cantidad = azar.entero(5, 9) + (p === 0 ? 4 : 0);
      for (let k = 1; k <= cantidad; k++) {
        const servicio = azar.elegir(servicios);
        const creadoEn = fechaColombia(ahora, -atras, horaDeLlegada(azar));
        const cancelado = azar.siguiente() < 0.12;
        const llamado = sumarMinutos(creadoEn, azar.entero(4, 45));
        turnos.push({
          codigoAlfanumerico: `HIS-${atras}-${p + 1}-${k}`,
          usuarioId: azar.elegir(pacienteIds),
          servicioId: servicio.id,
          puntoId: punto.id,
          ventanillaId: cancelado ? null : azar.elegir(punto.ventanillaIds),
          estado: cancelado ? 'CANCELADO' : 'ATENDIDO',
          prioridad: azar.siguiente() < 0.1,
          creadoEn,
          horaLlamado: cancelado ? null : llamado,
          horaFinalizacion: cancelado ? null : sumarMinutos(llamado, Math.max(3, servicio.tiempoPromedioMin + azar.entero(-3, 5))),
        });
      }
    });
  }
  return turnos;
}

/** Fila de hoy: atendidos, en atención, pendientes y algún cancelado por sede. */
export function generarTurnosDeHoy(
  ahora: Date,
  puntos: readonly PuntoConVentanillas[],
  servicios: readonly ServicioConId[],
  pacienteIds: readonly string[],
): TurnoSimulado[] {
  const azar = crearAleatorio(5);
  const turnos: TurnoSimulado[] = [];
  // Cada paciente activo (en curso o pendiente) aparece una sola vez.
  const activos = [...pacienteIds].slice(1);
  const pedirActivo = () => activos.shift() ?? azar.elegir(pacienteIds);
  const enCursoPorSede = [2, 1, 1];
  const pendientesPorSede = [3, 3, 2];

  puntos.forEach((punto, p) => {
    const antes = (min: number) => sumarMinutos(ahora, -min);
    const nuevo = (
      k: string,
      usuarioId: string,
      estado: TurnoSimulado['estado'],
      creadoEn: Date,
      llamado: Date | null,
      fin: Date | null,
      ventanillaId: string | null,
      prioridad = false,
    ) => {
      const servicio = azar.elegir(servicios);
      turnos.push({
        codigoAlfanumerico: `HOY-${p + 1}-${k}`,
        usuarioId,
        servicioId: servicio.id,
        puntoId: punto.id,
        ventanillaId,
        estado,
        prioridad,
        creadoEn,
        horaLlamado: llamado,
        horaFinalizacion: fin,
      });
    };

    for (let k = 1; k <= 3; k++) {
      nuevo(`A${k}`, azar.elegir(pacienteIds), 'ATENDIDO', antes(150 - k * 12), antes(120 - k * 12), antes(105 - k * 12), azar.elegir(punto.ventanillaIds));
    }
    nuevo('X1', azar.elegir(pacienteIds), 'CANCELADO', antes(95), null, null, null);
    for (let k = 1; k <= (enCursoPorSede[p] ?? 1); k++) {
      nuevo(`E${k}`, pedirActivo(), 'EN_CURSO', antes(30 - k * 3), antes(4 * k), null, punto.ventanillaIds[k - 1] ?? punto.ventanillaIds[0]!);
    }
    for (let k = 1; k <= (pendientesPorSede[p] ?? 2); k++) {
      nuevo(`P${k}`, pedirActivo(), 'PENDIENTE', antes(24 - k * 5), null, null, null, k === 2);
    }
  });
  return turnos;
}

// ── Lista de espera y notificaciones ─────────────────────────────────────────

export interface InscripcionEsperaSimulada {
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  creadoEn: Date;
}

/** Inscripciones en el servicio de citas de la primera sede (agenda llena). */
export function generarListaEspera(
  ahora: Date,
  puntoId: string,
  servicioCitasId: string,
  servicioAutorizacionesId: string,
  pacienteIds: readonly string[],
): InscripcionEsperaSimulada[] {
  const inscripciones: InscripcionEsperaSimulada[] = [];
  pacienteIds.slice(8, 12).forEach((usuarioId, i) => {
    inscripciones.push({ usuarioId, servicioId: servicioCitasId, puntoId, creadoEn: sumarMinutos(ahora, -(240 - i * 45)) });
  });
  pacienteIds.slice(6, 8).forEach((usuarioId, i) => {
    inscripciones.push({ usuarioId, servicioId: servicioAutorizacionesId, puntoId, creadoEn: sumarMinutos(ahora, -(90 - i * 30)) });
  });
  return inscripciones;
}

export interface NotificacionSimulada {
  usuarioId: string;
  tipo: 'TURNO_CREADO' | 'TURNO_CANCELADO' | 'TURNO_EN_CURSO' | 'TURNO_REASIGNADO';
  titulo: string;
  mensaje: string;
  estadoEnvio: 'ENVIADA' | 'FALLIDA';
  leida: boolean;
  creadoEn: Date;
}

/** Historial de avisos del paciente de la demo y de los primeros pacientes. */
export function generarNotificaciones(ahora: Date, pacienteIds: readonly string[]): NotificacionSimulada[] {
  const plantillas: Omit<NotificacionSimulada, 'usuarioId' | 'creadoEn'>[] = [
    { tipo: 'TURNO_CREADO', titulo: 'Turno creado', mensaje: 'Tu turno quedó registrado. Te avisaremos cuando se acerque tu atención.', estadoEnvio: 'ENVIADA', leida: true },
    { tipo: 'TURNO_EN_CURSO', titulo: 'Es tu turno', mensaje: 'Acércate a la ventanilla indicada: ya te están llamando.', estadoEnvio: 'ENVIADA', leida: true },
    { tipo: 'TURNO_CANCELADO', titulo: 'Turno cancelado', mensaje: 'Tu turno fue cancelado. Puedes solicitar uno nuevo cuando quieras.', estadoEnvio: 'ENVIADA', leida: false },
    { tipo: 'TURNO_REASIGNADO', titulo: 'Tu turno fue reasignado', mensaje: 'Cambiamos tu turno a otra ventanilla para atenderte más rápido.', estadoEnvio: 'ENVIADA', leida: false },
    { tipo: 'TURNO_CREADO', titulo: 'Turno creado', mensaje: 'Tu turno quedó registrado en la sede elegida.', estadoEnvio: 'FALLIDA', leida: false },
  ];
  const notificaciones: NotificacionSimulada[] = [];
  pacienteIds.slice(0, 4).forEach((usuarioId, u) => {
    plantillas.slice(0, u === 0 ? 5 : 2 + (u % 2)).forEach((plantilla, i) => {
      notificaciones.push({ ...plantilla, usuarioId, creadoEn: sumarMinutos(ahora, -(60 * 24 * (i + 1)) - u * 37) });
    });
  });
  return notificaciones;
}
