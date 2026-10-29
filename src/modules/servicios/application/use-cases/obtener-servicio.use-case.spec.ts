import { NotFoundException } from '@nestjs/common';
import { ObtenerServicioUseCase } from './obtener-servicio.use-case';
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

describe('ObtenerServicioUseCase', () => {
  it('devuelve el servicio cuando existe', async () => {
    const servicio = new Servicio('servicio-1', 'COD-1', 'Servicio', 10, true, 'entidad-1');
    const repo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicio),
    });
    const useCase = new ObtenerServicioUseCase(repo);

    await expect(useCase.ejecutar('servicio-1')).resolves.toBe(servicio);
  });

  it('lanza NotFoundException cuando no existe', async () => {
    const repo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerServicioUseCase(repo);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
