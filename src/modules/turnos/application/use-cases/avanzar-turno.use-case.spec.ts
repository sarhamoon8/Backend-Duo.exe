import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AvanzarTurnoUseCase } from './avanzar-turno.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { VentanillaRepository } from '../../../ventanillas/domain/ventanilla.repository';
import { Ventanilla } from '../../../ventanillas/domain/ventanilla.entity';
import { EstadoOperativoVentanilla } from '../../../ventanillas/domain/estado-operativo-ventanilla.enum';

function crearRepositorioTurnoFalso(
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

function crearRepositorioVentanillaFalso(
  overrides: Partial<VentanillaRepository> = {},
): jest.Mocked<VentanillaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    ...overrides,
  } as jest.Mocked<VentanillaRepository>;
}

function crearTurno(estado: EstadoTurno, puntoId = 'punto-1'): Turno {
  return new Turno(
    'turno-1',
    'usuario-1',
    'servicio-1',
    puntoId,
    null,
    'T-ABC123',
    estado,
    false,
    null,
    null,
    new Date(),
  );
}

function crearVentanilla(
  overrides: Partial<{
    id: string;
    puntoId: string;
    estadoOperativo: EstadoOperativoVentanilla;
  }> = {},
): Ventanilla {
  return new Ventanilla(
    overrides.id ?? 'ventanilla-1',
    overrides.puntoId ?? 'punto-1',
    'M1',
    overrides.estadoOperativo ?? EstadoOperativoVentanilla.ACTIVA,
  );
}

describe('AvanzarTurnoUseCase', () => {
  it('lanza NotFoundException si el turno no existe', async () => {
    const turnos = crearRepositorioTurnoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const ventanillas = crearRepositorioVentanillaFalso();
    const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

    await expect(
      useCase.ejecutar('inexistente', 'ventanilla-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('exige ventanillaId para llamar un turno PENDIENTE', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE);
    const turnos = crearRepositorioTurnoFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
    });
    const ventanillas = crearRepositorioVentanillaFalso();
    const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

    await expect(useCase.ejecutar(turno.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(turnos.iniciarAtencion).not.toHaveBeenCalled();
  });

  it('rechaza una ventanilla de otro punto de dispensación', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'punto-1');
    const turnos = crearRepositorioTurnoFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
    });
    const ventanillas = crearRepositorioVentanillaFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(crearVentanilla({ puntoId: 'punto-2' })),
    });
    const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

    await expect(
      useCase.ejecutar(turno.id, 'ventanilla-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(turnos.iniciarAtencion).not.toHaveBeenCalled();
  });

  it('rechaza una ventanilla inactiva', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'punto-1');
    const turnos = crearRepositorioTurnoFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
    });
    const ventanillas = crearRepositorioVentanillaFalso({
      buscarPorId: jest.fn().mockResolvedValue(
        crearVentanilla({
          puntoId: 'punto-1',
          estadoOperativo: EstadoOperativoVentanilla.INACTIVA,
        }),
      ),
    });
    const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

    await expect(
      useCase.ejecutar(turno.id, 'ventanilla-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('inicia la atención (PENDIENTE -> EN_CURSO) con una ventanilla válida', async () => {
    const turno = crearTurno(EstadoTurno.PENDIENTE, 'punto-1');
    const turnos = crearRepositorioTurnoFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      iniciarAtencion: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.EN_CURSO, 'punto-1')),
    });
    const ventanillas = crearRepositorioVentanillaFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(crearVentanilla({ puntoId: 'punto-1' })),
    });
    const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

    await useCase.ejecutar(turno.id, 'ventanilla-1');

    expect(turnos.iniciarAtencion).toHaveBeenCalledWith(
      turno.id,
      'ventanilla-1',
    );
  });

  it('finaliza la atención (EN_CURSO -> ATENDIDO) sin requerir ventanillaId', async () => {
    const turno = crearTurno(EstadoTurno.EN_CURSO);
    const turnos = crearRepositorioTurnoFalso({
      buscarPorId: jest.fn().mockResolvedValue(turno),
      finalizarAtencion: jest
        .fn()
        .mockResolvedValue(crearTurno(EstadoTurno.ATENDIDO)),
    });
    const ventanillas = crearRepositorioVentanillaFalso();
    const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

    await useCase.ejecutar(turno.id);

    expect(turnos.finalizarAtencion).toHaveBeenCalledWith(turno.id);
  });

  it.each([EstadoTurno.ATENDIDO, EstadoTurno.CANCELADO])(
    'rechaza avanzar un turno en estado terminal (%s)',
    async (estado) => {
      const turno = crearTurno(estado);
      const turnos = crearRepositorioTurnoFalso({
        buscarPorId: jest.fn().mockResolvedValue(turno),
      });
      const ventanillas = crearRepositorioVentanillaFalso();
      const useCase = new AvanzarTurnoUseCase(turnos, ventanillas);

      await expect(useCase.ejecutar(turno.id)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
});
