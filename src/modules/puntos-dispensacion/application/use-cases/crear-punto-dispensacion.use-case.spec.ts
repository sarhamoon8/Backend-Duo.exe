import { NotFoundException } from '@nestjs/common';
import { CrearPuntoDispensacionUseCase } from './crear-punto-dispensacion.use-case';
import { PuntoDispensacionRepository } from '../../domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';
import { EntidadMedicaRepository } from '../../../entidades-medicas/domain/entidad-medica.repository';
import { EntidadMedica } from '../../../entidades-medicas/domain/entidad-medica.entity';
import { CrearPuntoDispensacionDto } from '../dto/crear-punto-dispensacion.dto';

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

const dto: CrearPuntoDispensacionDto = {
  entidadId: 'entidad-1',
  nombreSede: 'Sede Norte',
  direccion: 'Calle 1',
  ciudad: 'Bogotá',
  capacidadAtencion: 10,
};

describe('CrearPuntoDispensacionUseCase', () => {
  it('rechaza si la entidad médica no existe', async () => {
    const puntoRepo = crearPuntoRepoFalso();
    const entidadRepo = crearEntidadRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearPuntoDispensacionUseCase(puntoRepo, entidadRepo);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(puntoRepo.crear).not.toHaveBeenCalled();
  });

  it('crea el punto de dispensación cuando la entidad existe', async () => {
    const puntoCreado = new PuntoDispensacion(
      'punto-1',
      dto.entidadId,
      dto.nombreSede,
      dto.direccion,
      dto.ciudad,
      null,
      dto.capacidadAtencion,
    );
    const puntoRepo = crearPuntoRepoFalso({
      crear: jest.fn().mockResolvedValue(puntoCreado),
    });
    const entidadRepo = crearEntidadRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(new EntidadMedica('entidad-1', 'Sanitas EPS')),
    });
    const useCase = new CrearPuntoDispensacionUseCase(puntoRepo, entidadRepo);

    const resultado = await useCase.ejecutar(dto);

    expect(puntoRepo.crear).toHaveBeenCalledWith({
      entidadId: dto.entidadId,
      nombreSede: dto.nombreSede,
      direccion: dto.direccion,
      ciudad: dto.ciudad,
      telefonoContacto: dto.telefonoContacto,
      capacidadAtencion: dto.capacidadAtencion,
    });
    expect(resultado).toBe(puntoCreado);
  });
});
