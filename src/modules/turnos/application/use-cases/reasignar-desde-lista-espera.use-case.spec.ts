import { ReasignarDesdeListaEsperaUseCase } from './reasignar-desde-lista-espera.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { ListaEsperaRepository } from '../../../lista-espera/domain/lista-espera.repository';
import { ListaEspera } from '../../../lista-espera/domain/lista-espera.entity';

function crearTurnoRepoFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    listarPorUsuario: jest.fn(),
    actualizarEstado: jest.fn(),
    iniciarAtencion: jest.fn(),
    finalizarAtencion: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

function crearListaEsperaRepoFalso(
  overrides: Partial<ListaEsperaRepository> = {},
): jest.Mocked<ListaEsperaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    listarPorServicioYPunto: jest.fn(),
    obtenerPrimero: jest.fn(),
    contarAntes: jest.fn(),
    eliminar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ListaEsperaRepository>;
}

describe('ReasignarDesdeListaEsperaUseCase', () => {
  it('no hace nada si no hay nadie en la lista de espera', async () => {
    const turnoRepo = crearTurnoRepoFalso();
    const listaEsperaRepo = crearListaEsperaRepoFalso({
      obtenerPrimero: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ReasignarDesdeListaEsperaUseCase(
      turnoRepo,
      listaEsperaRepo,
    );

    const resultado = await useCase.ejecutar('servicio-1', 'punto-1');

    expect(resultado).toBeNull();
    expect(turnoRepo.crear).not.toHaveBeenCalled();
    expect(listaEsperaRepo.eliminar).not.toHaveBeenCalled();
  });

  it('crea un turno para el primero de la lista y lo saca de la lista de espera', async () => {
    const entrada = new ListaEspera(
      'espera-1',
      'usuario-9',
      'servicio-1',
      'punto-1',
      new Date(),
    );
    const turnoCreado = new Turno(
      'turno-nuevo',
      'usuario-9',
      'servicio-1',
      'punto-1',
      null,
      'T-XYZ789',
      EstadoTurno.PENDIENTE,
      false,
      null,
      null,
      new Date(),
    );
    const turnoRepo = crearTurnoRepoFalso({
      crear: jest.fn().mockResolvedValue(turnoCreado),
    });
    const listaEsperaRepo = crearListaEsperaRepoFalso({
      obtenerPrimero: jest.fn().mockResolvedValue(entrada),
    });
    const useCase = new ReasignarDesdeListaEsperaUseCase(
      turnoRepo,
      listaEsperaRepo,
    );

    const resultado = await useCase.ejecutar('servicio-1', 'punto-1');

    expect(turnoRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 'usuario-9',
        servicioId: 'servicio-1',
        puntoId: 'punto-1',
      }),
    );
    expect(listaEsperaRepo.eliminar).toHaveBeenCalledWith('espera-1');
    expect(resultado).toBe(turnoCreado);
  });
});
