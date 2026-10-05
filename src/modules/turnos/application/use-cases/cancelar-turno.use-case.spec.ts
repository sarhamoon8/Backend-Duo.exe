import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CancelarTurnoUseCase } from './cancelar-turno.use-case';
import { ReasignarDesdeListaEsperaUseCase } from './reasignar-desde-lista-espera.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Rol } from '../../../usuarios/domain/rol.enum';

function crearRepositorioFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    actualizarEstado: jest.fn(),
    iniciarAtencion: jest.fn(),
    finalizarAtencion: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

function crearReasignarFalso(): jest.Mocked<ReasignarDesdeListaEsperaUseCase> {
  return {
    ejecutar: jest.fn().mockResolvedValue(null),
  } as unknown as jest.Mocked<ReasignarDesdeListaEsperaUseCase>;
}

function crearTurno(estado: EstadoTurno, usuarioId = 'usuario-1'): Turno {
  return new Turno(
    'turno-1',
    usuarioId,
    'servicio-1',
    'punto-1',
    null,
    'T-ABC123',
    estado,
    false,
    null,
    null,
    new Date(),
  );
}

describe('CancelarTurnoUseCase', () => {
  it('lanza NotFoundException si el turno no existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CancelarTurnoUseCase(repositorio, crearReasignarFalso());

    await expect(
      useCase.ejecutar('inexistente', { id: 'usuario-1', rol: Rol.PACIENTE }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('permite al dueño del turno cancelarlo', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'usuario-1');
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      actualizarEstado: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.CANCELADO, 'usuario-1')),
    });
    const useCase = new CancelarTurnoUseCase(repositorio, crearReasignarFalso());

    await useCase.ejecutar(turno.id, { id: 'usuario-1', rol: Rol.PACIENTE });

    expect(repositorio.actualizarEstado).toHaveBeenCalledWith(
      turno.id,
      EstadoTurno.CANCELADO,
    );
  });

  it('rechaza que un paciente cancele el turno de otro usuario', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'usuario-1');
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
    });
    const useCase = new CancelarTurnoUseCase(repositorio, crearReasignarFalso());

    await expect(
      useCase.ejecutar(turno.id, { id: 'usuario-2', rol: Rol.PACIENTE }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repositorio.actualizarEstado).not.toHaveBeenCalled();
  });

  it('permite a un funcionario cancelar el turno de otro usuario', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'usuario-1');
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      actualizarEstado: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.CANCELADO, 'usuario-1')),
    });
    const useCase = new CancelarTurnoUseCase(repositorio, crearReasignarFalso());

    await useCase.ejecutar(turno.id, {
      id: 'funcionario-9',
      rol: Rol.FUNCIONARIO,
    });

    expect(repositorio.actualizarEstado).toHaveBeenCalledWith(
      turno.id,
      EstadoTurno.CANCELADO,
    );
  });

  it.each([EstadoTurno.ATENDIDO, EstadoTurno.CANCELADO])(
    'rechaza cancelar un turno en estado terminal (%s)',
    async (estado) => {
      const turno = crearTurno(estado, 'usuario-1');
      const repositorio = crearRepositorioFalso({
        buscarPorId: jest.fn().mockResolvedValue(turno),
      });
      const useCase = new CancelarTurnoUseCase(repositorio, crearReasignarFalso());

      await expect(
        useCase.ejecutar(turno.id, { id: 'usuario-1', rol: Rol.PACIENTE }),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('dispara la reasignación desde lista de espera al cancelar un turno PENDIENTE', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'usuario-1');
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      actualizarEstado: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.CANCELADO, 'usuario-1')),
    });
    const reasignar = crearReasignarFalso();
    const useCase = new CancelarTurnoUseCase(repositorio, reasignar);

    await useCase.ejecutar(turno.id, { id: 'usuario-1', rol: Rol.PACIENTE });

    expect(reasignar.ejecutar).toHaveBeenCalledWith(
      turno.servicioId,
      turno.puntoId,
    );
  });

  it('NO dispara la reasignación al cancelar un turno EN_CURSO', async () => {
    const turno = crearTurno(EstadoTurno.EN_CURSO, 'usuario-1');
    const repositorio = crearRepositorioFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      actualizarEstado: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.CANCELADO, 'usuario-1')),
    });
    const reasignar = crearReasignarFalso();
    const useCase = new CancelarTurnoUseCase(repositorio, reasignar);

    await useCase.ejecutar(turno.id, { id: 'usuario-1', rol: Rol.PACIENTE });

    expect(reasignar.ejecutar).not.toHaveBeenCalled();
  });
});
