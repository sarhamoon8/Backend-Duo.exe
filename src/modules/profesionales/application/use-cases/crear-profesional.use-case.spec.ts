import { ConflictException, NotFoundException } from '@nestjs/common';
import { CrearProfesionalUseCase } from './crear-profesional.use-case';
import { ProfesionalRepository } from '../../domain/profesional.repository';
import { Profesional } from '../../domain/profesional.entity';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../../puntos-dispensacion/domain/punto-dispensacion.entity';
import { CrearProfesionalDto } from '../dto/crear-profesional.dto';

function crearProfesionalRepoFalso(
  overrides: Partial<ProfesionalRepository> = {},
): jest.Mocked<ProfesionalRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorRegistroMedico: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ProfesionalRepository>;
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

const dto: CrearProfesionalDto = {
  registroMedico: 'RM-001',
  nombres: 'Ana',
  apellidos: 'Pérez',
  especialidad: 'Medicina General',
  puntoId: 'punto-1',
};

const puntoExistente = new PuntoDispensacion(
  'punto-1',
  'entidad-1',
  'Sede Centro',
  'Calle 1',
  'Bogotá',
  null,
  10,
);

describe('CrearProfesionalUseCase', () => {
  it('rechaza si el punto de dispensación no existe', async () => {
    const profesionalRepo = crearProfesionalRepoFalso();
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearProfesionalUseCase(profesionalRepo, puntoRepo);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(profesionalRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si ya existe un profesional con ese registro médico', async () => {
    const profesionalRepo = crearProfesionalRepoFalso({
      buscarPorRegistroMedico: jest.fn().mockResolvedValue(
        new Profesional(
          'prof-1',
          dto.registroMedico,
          'Otro',
          'Nombre',
          'Pediatría',
          true,
          'punto-1',
        ),
      ),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoExistente),
    });
    const useCase = new CrearProfesionalUseCase(profesionalRepo, puntoRepo);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(profesionalRepo.crear).not.toHaveBeenCalled();
  });

  it('crea el profesional cuando el punto existe y el registro médico es único', async () => {
    const profesionalRepo = crearProfesionalRepoFalso({
      buscarPorRegistroMedico: jest.fn().mockResolvedValue(null),
      crear: jest.fn().mockResolvedValue(
        new Profesional(
          'prof-1',
          dto.registroMedico,
          dto.nombres,
          dto.apellidos,
          dto.especialidad,
          true,
          dto.puntoId,
        ),
      ),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoExistente),
    });
    const useCase = new CrearProfesionalUseCase(profesionalRepo, puntoRepo);

    const resultado = await useCase.ejecutar(dto);

    expect(profesionalRepo.crear).toHaveBeenCalledTimes(1);
    expect(resultado.registroMedico).toBe(dto.registroMedico);
  });
});
