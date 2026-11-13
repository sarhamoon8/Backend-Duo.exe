import {
  aFechaYHoraColombia,
  diaSemanaIso,
  esFechaValida,
  franjasDelDia,
  instanteColombia,
  rangoDelDia,
} from './franjas';
import { HorarioProfesional } from './horario-profesional.entity';

describe('franjas', () => {
  it('valida fechas YYYY-MM-DD reales', () => {
    expect(esFechaValida('2026-11-17')).toBe(true);
    expect(esFechaValida('2026-02-30')).toBe(false);
    expect(esFechaValida('17/11/2026')).toBe(false);
  });

  it('calcula el día de la semana ISO (lunes = 1, domingo = 7)', () => {
    expect(diaSemanaIso('2026-11-16')).toBe(1); // lunes
    expect(diaSemanaIso('2026-11-17')).toBe(2); // martes
    expect(diaSemanaIso('2026-11-22')).toBe(7); // domingo
  });

  it('convierte hora de Colombia (UTC-5) a instante y de vuelta', () => {
    const instante = instanteColombia('2026-11-17', '08:30');
    expect(instante.toISOString()).toBe('2026-11-17T13:30:00.000Z');
    expect(aFechaYHoraColombia(instante)).toEqual({
      fecha: '2026-11-17',
      hora: '08:30',
    });
  });

  it('una hora de la noche en Colombia sigue siendo el mismo día local', () => {
    const instante = instanteColombia('2026-11-17', '21:00'); // 02:00Z del 18
    expect(aFechaYHoraColombia(instante).fecha).toBe('2026-11-17');
  });

  it('el rango de un día dura 24 horas desde la medianoche colombiana', () => {
    const { desde, hasta } = rangoDelDia('2026-11-17');
    expect(desde.toISOString()).toBe('2026-11-17T05:00:00.000Z');
    expect(hasta.getTime() - desde.getTime()).toBe(24 * 3600_000);
  });

  it('genera las franjas de cada horario según la duración de la cita', () => {
    const horarios = [
      new HorarioProfesional('d1', 2, '08:00', '10:00', 30),
      new HorarioProfesional('d1', 2, '14:00', '15:00', 30),
      new HorarioProfesional('d1', 3, '08:00', '09:00', 30),
    ];
    expect(franjasDelDia(horarios, 2)).toEqual([
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '14:00',
      '14:30',
    ]);
    expect(franjasDelDia(horarios, 5)).toEqual([]);
  });

  it('no genera una franja que se pase del fin del horario', () => {
    const horarios = [new HorarioProfesional('d1', 1, '08:00', '08:45', 30)];
    expect(franjasDelDia(horarios, 1)).toEqual(['08:00']);
  });
});
