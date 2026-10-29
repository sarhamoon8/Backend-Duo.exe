import { NotFoundException } from '@nestjs/common';
import { ObtenerEntidadMedicaUseCase } from './obtener-entidad-medica.use-case';
import { EntidadMedicaRepository } from '../../domain/entidad-medica.repository';
import { EntidadMedica } from '../../domain/entidad-medica.entity';

function crearRepoFalso(
  overrides: Partial<EntidadMedicaRepository> = {},
): jest.Mocked<EntidadMedicaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<EntidadMedicaRepository>;
}

describe('ObtenerEntidadMedicaUseCase', () => {
  it('devuelve la entidad médica cuando existe', async () => {
    const entidad = new EntidadMedica('entidad-1', 'Sanitas EPS');
    const repo = crearRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(entidad),
    });
    const useCase = new ObtenerEntidadMedicaUseCase(repo);

    await expect(useCase.ejecutar('entidad-1')).resolves.toBe(entidad);
  });

  it('lanza NotFoundException cuando no existe', async () => {
    const repo = crearRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerEntidadMedicaUseCase(repo);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
