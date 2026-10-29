import { ListarEntidadesMedicasUseCase } from './listar-entidades-medicas.use-case';
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

describe('ListarEntidadesMedicasUseCase', () => {
  it('delega en entidadMedicaRepository.listar', async () => {
    const entidad = new EntidadMedica('entidad-1', 'Sanitas EPS');
    const repo = crearRepoFalso({
      listar: jest.fn().mockResolvedValue([entidad]),
    });
    const useCase = new ListarEntidadesMedicasUseCase(repo);

    await expect(useCase.ejecutar()).resolves.toEqual([entidad]);
  });
});
