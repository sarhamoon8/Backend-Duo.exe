import { NotFoundException } from '@nestjs/common';
import { ObtenerProfesionalUseCase } from './obtener-profesional.use-case';
import { ProfesionalRepository } from '../../domain/profesional.repository';
import { Profesional } from '../../domain/profesional.entity';

function crearProfesionalRepoFalso(
  overrides: Partial<ProfesionalRepository> = {},
): jest.Mocked<ProfesionalRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorRegistroMedico: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ProfesionalRepository>;
}

describe('ObtenerProfesionalUseCase', () => {
  it('rechaza si el profesional no existe', async () => {
    const repo = crearProfesionalRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerProfesionalUseCase(repo);

    await expect(useCase.ejecutar('prof-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('retorna el profesional cuando existe', async () => {
    const profesional = new Profesional(
      'prof-1',
      'RM-001',
      'Ana',
      'Pérez',
      'Medicina General',
      true,
      'punto-1',
    );
    const repo = crearProfesionalRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(profesional),
    });
    const useCase = new ObtenerProfesionalUseCase(repo);

    const resultado = await useCase.ejecutar('prof-1');

    expect(resultado).toBe(profesional);
  });
});
