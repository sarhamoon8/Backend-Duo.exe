import { ListarLogsUseCase } from './listar-logs.use-case';
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

const log = new LogPeticion('log-1', 'GET', '/turnos', 200, 12, null, null, null, new Date());

describe('ListarLogsUseCase', () => {
  it('usa el límite por defecto (50) cuando no se especifica', async () => {
    const repo = crearRepoFalso({ listarRecientes: jest.fn().mockResolvedValue([log]) });
    const useCase = new ListarLogsUseCase(repo);

    await useCase.ejecutar();

    expect(repo.listarRecientes).toHaveBeenCalledWith(50);
  });

  it('respeta un límite explícito por debajo del máximo', async () => {
    const repo = crearRepoFalso({ listarRecientes: jest.fn().mockResolvedValue([log]) });
    const useCase = new ListarLogsUseCase(repo);

    await useCase.ejecutar(10);

    expect(repo.listarRecientes).toHaveBeenCalledWith(10);
  });

  it('nunca pide más del límite máximo (200), aunque se pida más', async () => {
    const repo = crearRepoFalso({ listarRecientes: jest.fn().mockResolvedValue([]) });
    const useCase = new ListarLogsUseCase(repo);

    await useCase.ejecutar(10000);

    expect(repo.listarRecientes).toHaveBeenCalledWith(200);
  });
});
