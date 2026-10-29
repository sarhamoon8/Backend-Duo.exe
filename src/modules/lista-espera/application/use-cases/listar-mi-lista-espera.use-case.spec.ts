import { ListarMiListaEsperaUseCase } from './listar-mi-lista-espera.use-case';
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

describe('ListarMiListaEsperaUseCase', () => {
  it('delega en listaEsperaRepository.listarPorUsuario', async () => {
    const repo = crearListaEsperaRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([entrada]),
    });
    const useCase = new ListarMiListaEsperaUseCase(repo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(repo.listarPorUsuario).toHaveBeenCalledWith('usuario-1');
    expect(resultado).toEqual([entrada]);
  });
});
