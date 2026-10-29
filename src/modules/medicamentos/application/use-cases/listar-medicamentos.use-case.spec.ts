import { ListarMedicamentosUseCase } from './listar-medicamentos.use-case';
import { MedicamentoRepository } from '../../domain/medicamento.repository';
import { Medicamento } from '../../domain/medicamento.entity';

function crearMedicamentoRepoFalso(
  overrides: Partial<MedicamentoRepository> = {},
): jest.Mocked<MedicamentoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCodigoNacional: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<MedicamentoRepository>;
}

const medicamento = new Medicamento(
  'medicamento-1',
  'CN-1',
  'Acetaminofén',
  '500mg',
  'Tableta',
  'Lab X',
  false,
);

describe('ListarMedicamentosUseCase', () => {
  it('delega en medicamentoRepository.listar', async () => {
    const repo = crearMedicamentoRepoFalso({
      listar: jest.fn().mockResolvedValue([medicamento]),
    });
    const useCase = new ListarMedicamentosUseCase(repo);

    await expect(useCase.ejecutar()).resolves.toEqual([medicamento]);
  });
});
