import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReclamarReservaUseCase } from './reclamar-reserva.use-case';
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

function crearReserva(
  estado: EstadoReserva,
  fechaExpiracion: Date,
): Reserva {
  return new Reserva(
    'reserva-1',
    'usuario-1',
    'punto-1',
    'medicamento-1',
    'inv-1',
    2,
    estado,
    new Date(),
    fechaExpiracion,
  );
}

describe('ReclamarReservaUseCase', () => {
  it('lanza NotFoundException si la reserva no existe', async () => {
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ReclamarReservaUseCase(
      reservaRepo,
      crearInventarioRepoFalso(),
    );

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rechaza reclamar una reserva que no está ACTIVA', async () => {
    const reserva = crearReserva(
      EstadoReserva.CANCELADA,
      new Date(Date.now() + 60 * 60 * 1000),
    );
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(reserva),
    });
    const useCase = new ReclamarReservaUseCase(
      reservaRepo,
      crearInventarioRepoFalso(),
    );

    await expect(useCase.ejecutar(reserva.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('si ya venció, la expira, libera el stock y rechaza la entrega', async () => {
    const vencida = crearReserva(
      EstadoReserva.ACTIVA,
      new Date(Date.now() - 60 * 60 * 1000),
    );
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(vencida),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new ReclamarReservaUseCase(reservaRepo, inventarioRepo);

    await expect(useCase.ejecutar(vencida.id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(inventarioRepo.ajustarStock).toHaveBeenCalledWith('inv-1', {
      deltaStockReservado: -2,
    });
    expect(reservaRepo.actualizarEstado).toHaveBeenCalledWith(
      vencida.id,
      EstadoReserva.EXPIRADA,
    );
  });

  it('entrega una reserva ACTIVA vigente: descuenta stock actual y reservado', async () => {
    const vigente = crearReserva(
      EstadoReserva.ACTIVA,
      new Date(Date.now() + 60 * 60 * 1000),
    );
    const reclamada = crearReserva(
      EstadoReserva.RECLAMADA,
      vigente.fechaExpiracion,
    );
    const reservaRepo = crearReservaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(vigente),
      actualizarEstado: jest.fn().mockResolvedValue(reclamada),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new ReclamarReservaUseCase(reservaRepo, inventarioRepo);

    const resultado = await useCase.ejecutar(vigente.id);

    expect(inventarioRepo.ajustarStock).toHaveBeenCalledWith('inv-1', {
      deltaStockActual: -2,
      deltaStockReservado: -2,
    });
    expect(reservaRepo.actualizarEstado).toHaveBeenCalledWith(
      vigente.id,
      EstadoReserva.RECLAMADA,
    );
    expect(resultado).toBe(reclamada);
  });
});
