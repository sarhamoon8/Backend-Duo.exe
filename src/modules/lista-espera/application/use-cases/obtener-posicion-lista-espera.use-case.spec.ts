import { ObtenerPosicionListaEsperaUseCase } from './obtener-posicion-lista-espera.use-case';
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

describe('ObtenerPosicionListaEsperaUseCase', () => {
  it('devuelve 1 cuando no hay inscripciones anteriores', async () => {
    const entrada = new ListaEspera('espera-1', 'usuario-1', 'servicio-1', 'punto-1', new Date());
    const repo = crearListaEsperaRepoFalso({
      contarAntes: jest.fn().mockResolvedValue(0),
    });
    const useCase = new ObtenerPosicionListaEsperaUseCase(repo);

    await expect(useCase.ejecutar(entrada)).resolves.toBe(1);
    expect(repo.contarAntes).toHaveBeenCalledWith(
      entrada.servicioId,
      entrada.puntoId,
      entrada.creadoEn,
    );
  });

  it('suma 1 a la cantidad de inscripciones anteriores', async () => {
    const entrada = new ListaEspera('espera-4', 'usuario-1', 'servicio-1', 'punto-1', new Date());
    const repo = crearListaEsperaRepoFalso({
      contarAntes: jest.fn().mockResolvedValue(3),
    });
    const useCase = new ObtenerPosicionListaEsperaUseCase(repo);

    await expect(useCase.ejecutar(entrada)).resolves.toBe(4);
  });
});
