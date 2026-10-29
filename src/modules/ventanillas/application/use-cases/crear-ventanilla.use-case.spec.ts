import { NotFoundException } from '@nestjs/common';
import { CrearVentanillaUseCase } from './crear-ventanilla.use-case';
import { VentanillaRepository } from '../../domain/ventanilla.repository';
import { Ventanilla } from '../../domain/ventanilla.entity';
import { EstadoOperativoVentanilla } from '../../domain/estado-operativo-ventanilla.enum';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../../puntos-dispensacion/domain/punto-dispensacion.entity';
import { CrearVentanillaDto } from '../dto/crear-ventanilla.dto';

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

function crearPuntoRepoFalso(
  overrides: Partial<PuntoDispensacionRepository> = {},
): jest.Mocked<PuntoDispensacionRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorEntidad: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<PuntoDispensacionRepository>;
}

const dto: CrearVentanillaDto = { puntoId: 'punto-1', numeroModulo: 'M-1' };

describe('CrearVentanillaUseCase', () => {
  it('rechaza si el punto de dispensación no existe', async () => {
    const ventanillaRepo = crearVentanillaRepoFalso();
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearVentanillaUseCase(ventanillaRepo, puntoRepo);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(ventanillaRepo.crear).not.toHaveBeenCalled();
  });

  it('crea la ventanilla cuando el punto existe', async () => {
    const ventanillaCreada = new Ventanilla(
      'ventanilla-1',
      dto.puntoId,
      dto.numeroModulo,
      EstadoOperativoVentanilla.ACTIVA,
    );
    const ventanillaRepo = crearVentanillaRepoFalso({
      crear: jest.fn().mockResolvedValue(ventanillaCreada),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(
          new PuntoDispensacion('punto-1', 'entidad-1', 'Sede', 'Calle', 'Bogotá', null, 10),
        ),
    });
    const useCase = new CrearVentanillaUseCase(ventanillaRepo, puntoRepo);

    const resultado = await useCase.ejecutar(dto);

    expect(ventanillaRepo.crear).toHaveBeenCalledWith({
      puntoId: dto.puntoId,
      numeroModulo: dto.numeroModulo,
    });
    expect(resultado).toBe(ventanillaCreada);
  });
});
