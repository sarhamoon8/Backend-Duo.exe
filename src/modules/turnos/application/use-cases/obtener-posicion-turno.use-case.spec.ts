import { ObtenerPosicionTurnoUseCase } from './obtener-posicion-turno.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';

function crearRepositorioFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    actualizarEstado: jest.fn(),
    iniciarAtencion: jest.fn(),
    finalizarAtencion: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

function crearTurno(estado: EstadoTurno, creadoEn = new Date()): Turno {
  return new Turno(
    'turno-1',
    'usuario-1',
    'servicio-1',
    'punto-1',
    null,
    'T-ABC123',
    estado,
    false,
    null,
    null,
    creadoEn,
  );
}

describe('ObtenerPosicionTurnoUseCase', () => {
  it('devuelve null para turnos que no están PENDIENTE', async () => {
    const repositorio = crearRepositorioFalso();
    const useCase = new ObtenerPosicionTurnoUseCase(repositorio);
    const turno = crearTurno(EstadoTurno.ATENDIDO);

    const posicion = await useCase.ejecutar(turno);

    expect(posicion).toBeNull();
    expect(repositorio.contarPendientesAntes).not.toHaveBeenCalled();
  });

  it('calcula la posición como el número de pendientes anteriores + 1', async () => {
    const repositorio = crearRepositorioFalso({
      contarPendientesAntes: jest.fn().mockResolvedValue(2),
    });
    const useCase = new ObtenerPosicionTurnoUseCase(repositorio);
    const creadoEn = new Date('2026-09-21T10:00:00Z');
    const turno = crearTurno(EstadoTurno.PENDIENTE, creadoEn);

    const posicion = await useCase.ejecutar(turno);

    expect(posicion).toBe(3);
    expect(repositorio.contarPendientesAntes).toHaveBeenCalledWith(
      'punto-1',
      'servicio-1',
      creadoEn,
    );
  });

  it('es el primero de la fila cuando no hay pendientes anteriores', async () => {
    const repositorio = crearRepositorioFalso({
      contarPendientesAntes: jest.fn().mockResolvedValue(0),
    });
    const useCase = new ObtenerPosicionTurnoUseCase(repositorio);
    const turno = crearTurno(EstadoTurno.PENDIENTE);

    expect(await useCase.ejecutar(turno)).toBe(1);
  });
});
