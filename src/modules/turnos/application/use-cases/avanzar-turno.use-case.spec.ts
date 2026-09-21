import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AvanzarTurnoUseCase } from './avanzar-turno.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';

function crearRepositorioFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorServicio: jest.fn(),
    actualizarEstado: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

function crearTurno(estado: EstadoTurno): Turno {
  return new Turno('turno-1', 'usuario-1', 'servicio-1', estado, new Date());
}

describe('AvanzarTurnoUseCase', () => {
  it('lanza NotFoundException si el turno no existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new AvanzarTurnoUseCase(repositorio);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('avanza de PENDIENTE a EN_CURSO', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE);
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      actualizarEstado: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.EN_CURSO)),
    });
    const useCase = new AvanzarTurnoUseCase(repositorio);

    await useCase.ejecutar(turno.id);

    expect(repositorio.actualizarEstado).toHaveBeenCalledWith(
      turno.id,
      EstadoTurno.EN_CURSO,
    );
  });

  it('avanza de EN_CURSO a ATENDIDO', async () => {
    const turno = crearTurno(EstadoTurno.EN_CURSO);
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      actualizarEstado: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.ATENDIDO)),
    });
    const useCase = new AvanzarTurnoUseCase(repositorio);

    await useCase.ejecutar(turno.id);

    expect(repositorio.actualizarEstado).toHaveBeenCalledWith(
      turno.id,
      EstadoTurno.ATENDIDO,
    );
  });

  it.each([EstadoTurno.ATENDIDO, EstadoTurno.CANCELADO])(
    'rechaza avanzar un turno en estado terminal (%s)',
    async (estado) => {
      const turno = crearTurno(estado);
      const repositorio = crearRepositorioFalso({
        buscarPorId: jest.fn().mockResolvedValue(turno),
      });
      const useCase = new AvanzarTurnoUseCase(repositorio);

      await expect(useCase.ejecutar(turno.id)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repositorio.actualizarEstado).not.toHaveBeenCalled();
    },
  );
});
