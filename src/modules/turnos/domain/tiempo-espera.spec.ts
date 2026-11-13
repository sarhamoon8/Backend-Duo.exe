import {
  MINUTOS_MINIMOS_ANTES_DE_LLAMADO,
  estimarLlamado,
  llamableDesde,
} from './tiempo-espera';

const CREADO = new Date('2026-11-16T14:00:00.000Z');

describe('tiempo de espera de un turno', () => {
  it('llamableDesde suma el margen mínimo a la hora de creación', () => {
    expect(llamableDesde(CREADO).toISOString()).toBe('2026-11-16T14:15:00.000Z');
    expect(MINUTOS_MINIMOS_ANTES_DE_LLAMADO).toBe(15);
  });

  it('con la fila vacía igual da el margen mínimo para llegar', () => {
    const e = estimarLlamado({
      creadoEn: CREADO,
      personasAdelante: 0,
      tiempoPromedioMin: 8,
      ventanillasActivas: 2,
      ahora: CREADO,
    });
    expect(e.minutosEstimados).toBe(15);
    expect(e.horaEstimadaLlamado.toISOString()).toBe('2026-11-16T14:15:00.000Z');
    expect(e.llamableDesde.toISOString()).toBe('2026-11-16T14:15:00.000Z');
  });

  it('con fila larga, usa lo que tarden las personas de adelante entre las ventanillas', () => {
    const e = estimarLlamado({
      creadoEn: CREADO,
      personasAdelante: 10,
      tiempoPromedioMin: 8,
      ventanillasActivas: 2,
      ahora: CREADO,
    });
    expect(e.minutosEstimados).toBe(40); // 10 × 8 / 2
  });

  it('descuenta el tiempo que ya pasó y nunca baja de cero', () => {
    const base = {
      creadoEn: CREADO,
      personasAdelante: 10,
      tiempoPromedioMin: 8,
      ventanillasActivas: 2,
    };
    expect(
      estimarLlamado({ ...base, ahora: new Date('2026-11-16T14:30:00.000Z') }).minutosEstimados,
    ).toBe(10);
    expect(
      estimarLlamado({ ...base, ahora: new Date('2026-11-16T16:00:00.000Z') }).minutosEstimados,
    ).toBe(0);
  });

  it('trata como una ventanilla si no hay ninguna activa y redondea hacia arriba', () => {
    const e = estimarLlamado({
      creadoEn: CREADO,
      personasAdelante: 5,
      tiempoPromedioMin: 5,
      ventanillasActivas: 0,
      ahora: CREADO,
    });
    expect(e.minutosEstimados).toBe(25);
  });
});
