import { ConflictException, NotFoundException } from '@nestjs/common';
import { CrearServicioUseCase } from './crear-servicio.use-case';
import { ServicioRepository } from '../../domain/servicio.repository';
import { Servicio } from '../../domain/servicio.entity';
import { EntidadMedicaRepository } from '../../../entidades-medicas/domain/entidad-medica.repository';
import { EntidadMedica } from '../../../entidades-medicas/domain/entidad-medica.entity';
import { CrearServicioDto } from '../dto/crear-servicio.dto';

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

function crearEntidadRepoFalso(
  overrides: Partial<EntidadMedicaRepository> = {},
): jest.Mocked<EntidadMedicaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<EntidadMedicaRepository>;
}

const dto: CrearServicioDto = {
  codigoServicio: 'COD-1',
  nombre: 'Servicio de prueba',
  tiempoPromedioMin: 10,
  entidadId: 'entidad-1',
};

const entidad = new EntidadMedica('entidad-1', 'Sanitas EPS');

describe('CrearServicioUseCase', () => {
  it('rechaza si la entidad médica no existe', async () => {
    const servicioRepo = crearServicioRepoFalso();
    const entidadRepo = crearEntidadRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearServicioUseCase(servicioRepo, entidadRepo);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(servicioRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el código de servicio ya está registrado', async () => {
    const servicioRepo = crearServicioRepoFalso({
      buscarPorCodigo: jest
        .fn()
        .mockResolvedValue(
          new Servicio('servicio-1', dto.codigoServicio, 'Otro', 5, true, 'entidad-1'),
        ),
    });
    const entidadRepo = crearEntidadRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(entidad),
    });
    const useCase = new CrearServicioUseCase(servicioRepo, entidadRepo);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(servicioRepo.crear).not.toHaveBeenCalled();
  });

  it('crea el servicio cuando la entidad existe y el código es único', async () => {
    const servicioCreado = new Servicio(
      'servicio-1',
      dto.codigoServicio,
      dto.nombre,
      dto.tiempoPromedioMin,
      true,
      dto.entidadId,
    );
    const servicioRepo = crearServicioRepoFalso({
      buscarPorCodigo: jest.fn().mockResolvedValue(null),
      crear: jest.fn().mockResolvedValue(servicioCreado),
    });
    const entidadRepo = crearEntidadRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(entidad),
    });
    const useCase = new CrearServicioUseCase(servicioRepo, entidadRepo);

    const resultado = await useCase.ejecutar(dto);

    expect(servicioRepo.crear).toHaveBeenCalledWith({
      codigoServicio: dto.codigoServicio,
      nombre: dto.nombre,
      tiempoPromedioMin: dto.tiempoPromedioMin,
      activo: dto.activo,
      entidadId: dto.entidadId,
    });
    expect(resultado).toBe(servicioCreado);
  });
});
