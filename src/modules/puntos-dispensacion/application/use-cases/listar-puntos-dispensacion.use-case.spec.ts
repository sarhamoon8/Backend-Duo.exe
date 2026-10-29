import { ListarPuntosDispensacionUseCase } from './listar-puntos-dispensacion.use-case';
import { PuntoDispensacionRepository } from '../../domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';

function crearPuntoRepoFalso(
  overrides: Partial<PuntoDispensacionRepository> = {},
): jest.Mocked<PuntoDispensacionRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorEntidad: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<PuntoDispensacionRepository>;
}

const punto = new PuntoDispensacion('punto-1', 'entidad-1', 'Sede', 'Calle', 'Bogotá', null, 10);

describe('ListarPuntosDispensacionUseCase', () => {
  it('lista todos los puntos cuando no se pasa entidadId', async () => {
    const repo = crearPuntoRepoFalso({
      listar: jest.fn().mockResolvedValue([punto]),
    });
    const useCase = new ListarPuntosDispensacionUseCase(repo);

    const resultado = await useCase.ejecutar();

    expect(repo.listar).toHaveBeenCalledTimes(1);
    expect(repo.listarPorEntidad).not.toHaveBeenCalled();
    expect(resultado).toEqual([punto]);
  });

  it('filtra por entidadId cuando se pasa', async () => {
    const repo = crearPuntoRepoFalso({
      listarPorEntidad: jest.fn().mockResolvedValue([punto]),
    });
    const useCase = new ListarPuntosDispensacionUseCase(repo);

    await useCase.ejecutar('entidad-1');

    expect(repo.listarPorEntidad).toHaveBeenCalledWith('entidad-1');
    expect(repo.listar).not.toHaveBeenCalled();
  });
});
