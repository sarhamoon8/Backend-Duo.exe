import { NotFoundException } from '@nestjs/common';
import { ObtenerTurnoUseCase } from './obtener-turno.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';

function crearRepositorioFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    listarPorUsuario: jest.fn(),
    actualizarEstado: jest.fn(),
    iniciarAtencion: jest.fn(),
    finalizarAtencion: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

describe('ObtenerTurnoUseCase', () => {
  it('lanza NotFoundException si el turno no existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerTurnoUseCase(repositorio);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('devuelve el turno cuando existe', async () => {
    const turno = new Turno(
      'turno-1',
      'usuario-1',
      'servicio-1',
      'punto-1',
      null,
      'T-ABC123',
      EstadoTurno.PENDIENTE,
      false,
      null,
      null,
      new Date(),
    );
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
    });
    const useCase = new ObtenerTurnoUseCase(repositorio);

    await expect(useCase.ejecutar(turno.id)).resolves.toBe(turno);
  });
});
