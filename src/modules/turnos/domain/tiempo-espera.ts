// Margen que se le da a quien saca un turno para llegar a la sede: el turno
// no se puede llamar antes de que pase este tiempo desde que se pidió, aunque
// la fila esté vacía. Evita llamar a alguien que todavía va en camino.
export const MINUTOS_MINIMOS_ANTES_DE_LLAMADO = 15;

export interface EstimacionLlamado {
  // Minutos que faltan (desde ahora) para que lo llamen, redondeados hacia arriba.
  minutosEstimados: number;
  horaEstimadaLlamado: Date;
  // Momento más temprano en que el personal puede llamar este turno.
  llamableDesde: Date;
}

export function llamableDesde(creadoEn: Date): Date {
  return new Date(
    creadoEn.getTime() + MINUTOS_MINIMOS_ANTES_DE_LLAMADO * 60_000,
  );
}

/**
 * Estima cuándo llamarán un turno PENDIENTE: lo que tarden en atenderse las
 * personas que van adelante (repartidas entre las ventanillas activas), pero
 * nunca menos que el margen mínimo de llegada.
 */
export function estimarLlamado(params: {
  creadoEn: Date;
  personasAdelante: number;
  tiempoPromedioMin: number;
  ventanillasActivas: number;
  ahora?: Date;
}): EstimacionLlamado {
  const ahora = params.ahora ?? new Date();
  const ventanillas = Math.max(1, params.ventanillasActivas);
  const esperaPorFila = Math.ceil(
    (Math.max(0, params.personasAdelante) *
      Math.max(0, params.tiempoPromedioMin)) /
      ventanillas,
  );
  const esperaMin = Math.max(MINUTOS_MINIMOS_ANTES_DE_LLAMADO, esperaPorFila);
  const horaEstimadaLlamado = new Date(
    params.creadoEn.getTime() + esperaMin * 60_000,
  );
  return {
    minutosEstimados: Math.max(
      0,
      Math.ceil((horaEstimadaLlamado.getTime() - ahora.getTime()) / 60_000),
    ),
    horaEstimadaLlamado,
    llamableDesde: llamableDesde(params.creadoEn),
  };
}
