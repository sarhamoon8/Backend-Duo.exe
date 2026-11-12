import { ConflictException, NotFoundException } from '@nestjs/common';
import { CrearProfesionalUseCase } from './crear-profesional.use-case';
import { Profesional } from '../../domain/profesional.entity';
import { ProfesionalRepository } from '../../domain/profesional.repository';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { CrearProfesionalDto } from '../dto/crear-profesional.dto';

const dto: CrearProfesionalDto = {
  registroMedico: 'RM-1',
  nombres: 'Ana',
  apellidos: 'Pérez',
  especialidad: 'Medicina general',
  puntoId: 'punto-1',
};

function repositorios(opciones: { punto: boolean; existente: boolean }) {
  const profesionales = {
    crear: jest
      .fn()
      .mockImplementation((p: CrearProfesionalDto) =>
        Promise.resolve(
          new Profesional(
            'id-1',
            p.registroMedico,
            p.nombres,
            p.apellidos,
            p.especialidad,
            true,
            p.puntoId,
          ),
        ),
      ),
    buscarPorId: jest.fn(),
    buscarPorRegistroMedico: jest
      .fn()
      .mockResolvedValue(
        opciones.existente
          ? new Profesional('id-0', dto.registroMedico, 'x', 'x', 'x', true, 'punto-1')
          : null,
      ),
    listar: jest.fn(),
  } as jest.Mocked<ProfesionalRepository>;
  const puntos = {
    buscarPorId: jest
      .fn()
      .mockResolvedValue(opciones.punto ? { id: 'punto-1' } : null),
  } as unknown as jest.Mocked<PuntoDispensacionRepository>;
  return { profesionales, puntos };
}

describe('CrearProfesionalUseCase', () => {
  it('rechaza el registro si el punto de dispensación no existe', async () => {
    const { profesionales, puntos } = repositorios({ punto: false, existente: false });
    const useCase = new CrearProfesionalUseCase(profesionales, puntos);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(profesionales.crear).not.toHaveBeenCalled();
  });

  it('rechaza el registro si el registro médico ya existe', async () => {
    const { profesionales, puntos } = repositorios({ punto: true, existente: true });
    const useCase = new CrearProfesionalUseCase(profesionales, puntos);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(profesionales.crear).not.toHaveBeenCalled();
  });

  it('crea el profesional cuando los datos son válidos', async () => {
    const { profesionales, puntos } = repositorios({ punto: true, existente: false });
    const useCase = new CrearProfesionalUseCase(profesionales, puntos);

    const resultado = await useCase.ejecutar(dto);

    expect(profesionales.crear).toHaveBeenCalledTimes(1);
    expect(resultado.registroMedico).toBe(dto.registroMedico);
  });
});
