import { ListarListaEsperaPorPuntoUseCase } from './listar-lista-espera-por-punto.use-case';
import { ListaEsperaRepository } from '../../domain/lista-espera.repository';
import { ListaEspera } from '../../domain/lista-espera.entity';

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

const entrada = new ListaEspera('espera-1', 'usuario-1', 'servicio-1', 'punto-1', new Date());

describe('ListarListaEsperaPorPuntoUseCase', () => {
  it('delega en listaEsperaRepository.listarPorServicioYPunto', async () => {
    const repo = crearListaEsperaRepoFalso({
      listarPorServicioYPunto: jest.fn().mockResolvedValue([entrada]),
    });
    const useCase = new ListarListaEsperaPorPuntoUseCase(repo);

    const resultado = await useCase.ejecutar('servicio-1', 'punto-1');

    expect(repo.listarPorServicioYPunto).toHaveBeenCalledWith('servicio-1', 'punto-1');
    expect(resultado).toEqual([entrada]);
  });
});
