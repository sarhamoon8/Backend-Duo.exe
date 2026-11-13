import { EstimarLlamadoTurnoUseCase } from './estimar-llamado-turno.use-case';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Servicio } from '../../../servicios/domain/servicio.entity';
import { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { Ventanilla } from '../../../ventanillas/domain/ventanilla.entity';
import { VentanillaRepository } from '../../../ventanillas/domain/ventanilla.repository';
import { EstadoOperativoVentanilla } from '../../../ventanillas/domain/estado-operativo-ventanilla.enum';

const CREADO = new Date('2026-11-16T14:00:00.000Z');
const turno = new Turno('t1', 'u1', 's1', 'p1', null, 'T-1', EstadoTurno.PENDIENTE, false, null, null, CREADO);

describe('EstimarLlamadoTurnoUseCase', () => {
  const servicios = {
    buscarPorId: jest.fn().mockResolvedValue(new Servicio('s1', 'DISP', 'Dispensación', 10, true, 'e1')),
  } as unknown as jest.Mocked<ServicioRepository>;
  const ventanillas = {
    listarPorPunto: jest.fn().mockResolvedValue([
      new Ventanilla('v1', 'p1', 'M1', EstadoOperativoVentanilla.ACTIVA),
      new Ventanilla('v2', 'p1', 'M2', EstadoOperativoVentanilla.ACTIVA),
      new Ventanilla('v3', 'p1', 'M3', EstadoOperativoVentanilla.INACTIVA),
    ]),
  } as unknown as jest.Mocked<VentanillaRepository>;
  const useCase = new EstimarLlamadoTurnoUseCase(servicios, ventanillas);

  it('no estima si el turno no está en la fila (sin posición)', async () => {
    expect(await useCase.ejecutar(turno, null, CREADO)).toBeNull();
  });

  it('usa la posición, el tiempo del servicio y solo las ventanillas activas', async () => {
    // 7 personas adelante × 10 min / 2 ventanillas activas = 35 min.
    const estimacion = await useCase.ejecutar(turno, 8, CREADO);

    expect(estimacion?.minutosEstimados).toBe(35);
    expect(estimacion?.horaEstimadaLlamado.toISOString()).toBe('2026-11-16T14:35:00.000Z');
  });

  it('respeta el margen mínimo de llegada con la fila vacía', async () => {
    const estimacion = await useCase.ejecutar(turno, 1, CREADO);

    expect(estimacion?.minutosEstimados).toBe(15);
  });
});
