import { randomInt } from 'crypto';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O, 1/I para evitar confusión visual
const LONGITUD = 6;

// Código corto que el usuario ve/dice en el punto de dispensación
// (p. ej. "T-8K3PQ2"). No es la clave primaria del turno: es un
// identificador legible con suficiente entropía (33^6 ≈ 1.3 mil millones
// de combinaciones) para que una colisión sea prácticamente imposible en
// el volumen de turnos de un solo día; el índice único en la base de
// datos actúa como respaldo si alguna vez ocurriera.
export function generarCodigoTurno(): string {
  let codigo = '';
  for (let i = 0; i < LONGITUD; i++) {
    codigo += ALFABETO[randomInt(ALFABETO.length)];
  }
  return `T-${codigo}`;
}
