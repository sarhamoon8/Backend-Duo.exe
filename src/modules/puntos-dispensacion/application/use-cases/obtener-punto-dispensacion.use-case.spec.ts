import { NotFoundException } from '@nestjs/common';
import { ObtenerPuntoDispensacionUseCase } from './obtener-punto-dispensacion.use-case';
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

describe('ObtenerPuntoDispensacionUseCase', () => {
  it('devuelve el punto cuando existe', async () => {
    const punto = new PuntoDispensacion('punto-1', 'entidad-1', 'Sede', 'Calle', 'Bogotá', null, 10);
    const repo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(punto),
    });
    const useCase = new ObtenerPuntoDispensacionUseCase(repo);

    await expect(useCase.ejecutar('punto-1')).resolves.toBe(punto);
  });

  it('lanza NotFoundException cuando no existe', async () => {
    const repo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerPuntoDispensacionUseCase(repo);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
