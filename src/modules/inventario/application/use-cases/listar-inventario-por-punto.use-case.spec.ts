import { ListarInventarioPorPuntoUseCase } from './listar-inventario-por-punto.use-case';
import { InventarioRepository } from '../../domain/inventario.repository';
import { Inventario } from '../../domain/inventario.entity';

function crearInventarioRepoFalso(
  overrides: Partial<InventarioRepository> = {},
): jest.Mocked<InventarioRepository> {
  return {
    crear: jest.fn(),
    listarPorPunto: jest.fn(),
    ...overrides,
  } as jest.Mocked<InventarioRepository>;
}

const inventario = new Inventario(
  'inventario-1',
  'punto-1',
  'medicamento-1',
  'LOTE-1',
  100,
  0,
  new Date('2027-01-01'),
);

describe('ListarInventarioPorPuntoUseCase', () => {
  it('lista el inventario del punto sin filtrar por medicamento', async () => {
    const repo = crearInventarioRepoFalso({
      listarPorPunto: jest.fn().mockResolvedValue([inventario]),
    });
    const useCase = new ListarInventarioPorPuntoUseCase(repo);

    const resultado = await useCase.ejecutar('punto-1');

    expect(repo.listarPorPunto).toHaveBeenCalledWith('punto-1', undefined);
    expect(resultado).toEqual([inventario]);
  });

  it('filtra por medicamentoId cuando se pasa', async () => {
    const repo = crearInventarioRepoFalso({
      listarPorPunto: jest.fn().mockResolvedValue([inventario]),
    });
    const useCase = new ListarInventarioPorPuntoUseCase(repo);

    await useCase.ejecutar('punto-1', 'medicamento-1');

    expect(repo.listarPorPunto).toHaveBeenCalledWith('punto-1', 'medicamento-1');
  });
});
