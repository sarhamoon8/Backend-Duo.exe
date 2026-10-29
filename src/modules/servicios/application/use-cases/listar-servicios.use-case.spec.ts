import { ListarServiciosUseCase } from './listar-servicios.use-case';
import { ServicioRepository } from '../../domain/servicio.repository';
import { Servicio } from '../../domain/servicio.entity';

function crearServicioRepoFalso(
  overrides: Partial<ServicioRepository> = {},
): jest.Mocked<ServicioRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCodigo: jest.fn(),
    listarPorEntidad: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ServicioRepository>;
}

const servicio = new Servicio('servicio-1', 'COD-1', 'Servicio', 10, true, 'entidad-1');

describe('ListarServiciosUseCase', () => {
  it('lista todos los servicios cuando no se pasa entidadId', async () => {
    const repo = crearServicioRepoFalso({
      listar: jest.fn().mockResolvedValue([servicio]),
    });
    const useCase = new ListarServiciosUseCase(repo);

    const resultado = await useCase.ejecutar();

    expect(repo.listar).toHaveBeenCalledTimes(1);
    expect(repo.listarPorEntidad).not.toHaveBeenCalled();
    expect(resultado).toEqual([servicio]);
  });

  it('filtra por entidadId cuando se pasa', async () => {
    const repo = crearServicioRepoFalso({
      listarPorEntidad: jest.fn().mockResolvedValue([servicio]),
    });
    const useCase = new ListarServiciosUseCase(repo);

    await useCase.ejecutar('entidad-1');

    expect(repo.listarPorEntidad).toHaveBeenCalledWith('entidad-1');
    expect(repo.listar).not.toHaveBeenCalled();
  });
});
