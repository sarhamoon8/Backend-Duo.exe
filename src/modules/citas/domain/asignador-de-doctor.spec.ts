import { Profesional } from '../../profesionales/domain/profesional.entity';
import { candidatosParaFranja } from './asignador-de-doctor';
import { HorarioProfesional } from './horario-profesional.entity';

const doctor = (id: string, apellidos: string) =>
  new Profesional(id, `RM-${id}`, 'Nombre', apellidos, 'Cardiología', true, 'p1');

// 2026-11-17 es martes (diaSemana 2).
const FECHA = '2026-11-17';
const mananaMartes = (id: string) =>
  new HorarioProfesional(id, 2, '08:00', '12:00', 30);

describe('candidatosParaFranja', () => {
  const ana = doctor('d1', 'Álvarez');
  const beto = doctor('d2', 'Benítez');

  it('devuelve los doctores que atienden a esa hora', () => {
    const resultado = candidatosParaFranja({
      profesionales: [ana, beto],
      horarios: [mananaMartes('d1'), mananaMartes('d2')],
      ocupadas: [],
      fecha: FECHA,
      hora: '09:00',
    });
    expect(resultado.map((p) => p.id)).toEqual(['d1', 'd2']);
  });

  it('excluye al doctor que no trabaja ese día u hora', () => {
    const resultado = candidatosParaFranja({
      profesionales: [ana, beto],
      horarios: [
        mananaMartes('d1'),
        new HorarioProfesional('d2', 3, '08:00', '12:00', 30), // solo miércoles
      ],
      ocupadas: [],
      fecha: FECHA,
      hora: '09:00',
    });
    expect(resultado.map((p) => p.id)).toEqual(['d1']);
    expect(
      candidatosParaFranja({
        profesionales: [ana],
        horarios: [mananaMartes('d1')],
        ocupadas: [],
        fecha: FECHA,
        hora: '15:00', // fuera de su horario
      }),
    ).toEqual([]);
  });

  it('excluye al doctor que ya tiene cita a esa hora', () => {
    const resultado = candidatosParaFranja({
      profesionales: [ana, beto],
      horarios: [mananaMartes('d1'), mananaMartes('d2')],
      ocupadas: [
        { profesionalId: 'd1', fechaHora: new Date('2026-11-17T14:00:00.000Z') }, // 09:00 Colombia
      ],
      fecha: FECHA,
      hora: '09:00',
    });
    expect(resultado.map((p) => p.id)).toEqual(['d2']);
  });

  it('prefiere al doctor con menos citas ese día', () => {
    const resultado = candidatosParaFranja({
      profesionales: [ana, beto],
      horarios: [mananaMartes('d1'), mananaMartes('d2')],
      ocupadas: [
        { profesionalId: 'd1', fechaHora: new Date('2026-11-17T13:00:00.000Z') },
        { profesionalId: 'd1', fechaHora: new Date('2026-11-17T13:30:00.000Z') },
        { profesionalId: 'd2', fechaHora: new Date('2026-11-17T13:00:00.000Z') },
      ],
      fecha: FECHA,
      hora: '09:00',
    });
    expect(resultado.map((p) => p.id)).toEqual(['d2', 'd1']);
  });

  it('desempata por apellido para que el resultado sea estable', () => {
    const resultado = candidatosParaFranja({
      profesionales: [beto, ana],
      horarios: [mananaMartes('d1'), mananaMartes('d2')],
      ocupadas: [],
      fecha: FECHA,
      hora: '10:00',
    });
    expect(resultado.map((p) => p.id)).toEqual(['d1', 'd2']);
  });
});
