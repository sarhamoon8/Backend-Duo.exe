import { ListarVentanillasPorPuntoUseCase } from './listar-ventanillas-por-punto.use-case';
import { VentanillaRepository } from '../../domain/ventanilla.repository';
import { Ventanilla } from '../../domain/ventanilla.entity';
import { EstadoOperativoVentanilla } from '../../domain/estado-operativo-ventanilla.enum';

function crearVentanillaRepoFalso(
  overrides: Partial<VentanillaRepository> = {},
): jest.Mocked<VentanillaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    ...overrides,
  } as jest.Mocked<VentanillaRepository>;
}

describe('ListarVentanillasPorPuntoUseCase', () => {
  it('delega en ventanillaRepository.listarPorPunto', async () => {
    const ventanilla = new Ventanilla('ventanilla-1', 'punto-1', 'M-1', EstadoOperativoVentanilla.ACTIVA);
    const repo = crearVentanillaRepoFalso({
      listarPorPunto: jest.fn().mockResolvedValue([ventanilla]),
    });
    const useCase = new ListarVentanillasPorPuntoUseCase(repo);

    const resultado = await useCase.ejecutar('punto-1');

    expect(repo.listarPorPunto).toHaveBeenCalledWith('punto-1');
    expect(resultado).toEqual([ventanilla]);
  });
});
