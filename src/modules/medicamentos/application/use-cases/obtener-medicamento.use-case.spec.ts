import { NotFoundException } from '@nestjs/common';
import { ObtenerMedicamentoUseCase } from './obtener-medicamento.use-case';
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

describe('ObtenerMedicamentoUseCase', () => {
  it('devuelve el medicamento cuando existe', async () => {
    const medicamento = new Medicamento('medicamento-1', 'CN-1', 'Acetaminofén', '500mg', 'Tableta', 'Lab X', false);
    const repo = crearMedicamentoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(medicamento),
    });
    const useCase = new ObtenerMedicamentoUseCase(repo);

    await expect(useCase.ejecutar('medicamento-1')).resolves.toBe(medicamento);
  });

  it('lanza NotFoundException cuando no existe', async () => {
    const repo = crearMedicamentoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerMedicamentoUseCase(repo);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
