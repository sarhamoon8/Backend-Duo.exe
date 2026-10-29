import { RegistrarLogPeticionUseCase } from './registrar-log-peticion.use-case';
import { LogPeticionRepository } from '../../domain/log-peticion.repository';
import { LogPeticion } from '../../domain/log-peticion.entity';

function crearRepoFalso(
  overrides: Partial<LogPeticionRepository> = {},
): jest.Mocked<LogPeticionRepository> {
  return {
    registrar: jest.fn(),
    listarRecientes: jest.fn(),
    ...overrides,
  } as jest.Mocked<LogPeticionRepository>;
}

describe('RegistrarLogPeticionUseCase', () => {
  it('delega en logPeticionRepository.registrar con los datos recibidos', async () => {
    const repo = crearRepoFalso({
      registrar: jest.fn().mockResolvedValue(
        new LogPeticion('log-1', 'GET', '/turnos', 200, 12, 'usuario-1', '127.0.0.1', null, new Date()),
      ),
    });
    const useCase = new RegistrarLogPeticionUseCase(repo);

    await useCase.ejecutar({
      metodo: 'GET',
      ruta: '/turnos',
      codigoEstado: 200,
      duracionMs: 12,
      usuarioId: 'usuario-1',
      ip: '127.0.0.1',
      mensaje: null,
    });

    expect(repo.registrar).toHaveBeenCalledWith({
      metodo: 'GET',
      ruta: '/turnos',
      codigoEstado: 200,
      duracionMs: 12,
      usuarioId: 'usuario-1',
      ip: '127.0.0.1',
      mensaje: null,
    });
  });

  it('no lanza si el repositorio falla con un Error (nunca debe tumbar la petición que lo originó)', async () => {
    const repo = crearRepoFalso({
      registrar: jest.fn().mockRejectedValue(new Error('base de datos caída')),
    });
    const useCase = new RegistrarLogPeticionUseCase(repo);

    await expect(
      useCase.ejecutar({
        metodo: 'POST',
        ruta: '/turnos',
        codigoEstado: 500,
        duracionMs: 5,
      }),
    ).resolves.toBeUndefined();
  });

  it('no lanza si el repositorio falla con algo que no es un Error', async () => {
    const repo = crearRepoFalso({
      registrar: jest.fn().mockRejectedValue('fallo sin instancia de Error'),
    });
    const useCase = new RegistrarLogPeticionUseCase(repo);

    await expect(
      useCase.ejecutar({
        metodo: 'POST',
        ruta: '/turnos',
        codigoEstado: 500,
        duracionMs: 5,
      }),
    ).resolves.toBeUndefined();
  });
});
