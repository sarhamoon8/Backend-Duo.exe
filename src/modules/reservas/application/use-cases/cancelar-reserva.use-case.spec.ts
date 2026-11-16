import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CancelarReservaUseCase } from './cancelar-reserva.use-case';
import { ReservaRepository } from '../../domain/reserva.repository';
import { Reserva } from '../../domain/reserva.entity';
import { EstadoReserva } from '../../domain/estado-reserva.enum';
import { InventarioRepository } from '../../../inventario/domain/inventario.repository';

function crearReservaRepoFalso(
  overrides: Partial<ReservaRepository> = {},
): jest.Mocked<ReservaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    actualizarEstado: jest.fn(),
    ...overrides,
  } as jest.Mocked<ReservaRepository>;
}

function crearInventarioRepoFalso(
  overrides: Partial<InventarioRepository> = {},
): jest.Mocked<InventarioRepository> {
  return {
    crear: jest.fn(),
    listarPorPunto: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorMedicamento: jest.fn(),
    ajustarStock: jest.fn(),
    ...overrides,
  } as jest.Mocked<InventarioRepository>;
}

function crearReserva(estado: EstadoReserva, usuarioId = 'usuario-1'): Reserva {
  return new Reserva(
    'reserva-1',
    usuarioId,
    'punto-1',
    'medicamento-1',
    'inv-1',
    2,
    estado,
    new Date(),
    new Date(Date.now() + 60 * 60 * 1000),
  );
}

describe('CancelarReservaUseCase', () => {
  it('lanza NotFoundException si la reserva no existe', async () => {
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CancelarReservaUseCase(
      reservaRepo,
      crearInventarioRepoFalso(),
    );

    await expect(
      useCase.ejecutar('inexistente', 'usuario-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza cancelar la reserva de otro usuario', async () => {
    const reserva = crearReserva(EstadoReserva.ACTIVA, 'usuario-1');
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(reserva),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new CancelarReservaUseCase(reservaRepo, inventarioRepo);

    await expect(
      useCase.ejecutar(reserva.id, 'usuario-2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(inventarioRepo.ajustarStock).not.toHaveBeenCalled();
  });

  it.each([EstadoReserva.CANCELADA, EstadoReserva.RECLAMADA, EstadoReserva.EXPIRADA])(
    'rechaza cancelar una reserva en estado terminal (%s)',
    async (estado) => {
      const reserva = crearReserva(estado, 'usuario-1');
      const reservaRepo = crearReservaRepoFalso({
        buscarPorId: jest.fn().mockResolvedValue(reserva),
      });
      const useCase = new CancelarReservaUseCase(
        reservaRepo,
        crearInventarioRepoFalso(),
      );

      await expect(
        useCase.ejecutar(reserva.id, 'usuario-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );

  it('cancela una reserva propia ACTIVA y libera el stock reservado', async () => {
    const reserva = crearReserva(EstadoReserva.ACTIVA, 'usuario-1');
    const cancelada = crearReserva(EstadoReserva.CANCELADA, 'usuario-1');
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(reserva),
      actualizarEstado: jest.fn().mockResolvedValue(cancelada),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new CancelarReservaUseCase(reservaRepo, inventarioRepo);

    const resultado = await useCase.ejecutar(reserva.id, 'usuario-1');

    expect(inventarioRepo.ajustarStock).toHaveBeenCalledWith('inv-1', {
      deltaStockReservado: -2,
    });
    expect(reservaRepo.actualizarEstado).toHaveBeenCalledWith(
      reserva.id,
      EstadoReserva.CANCELADA,
    );
    expect(resultado).toBe(cancelada);
  });
});
