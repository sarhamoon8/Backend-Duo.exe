import { ListarMisReservasUseCase } from './listar-mis-reservas.use-case';
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
  id = 'reserva-1',
): Reserva {
  return new Reserva(
    id,
    'usuario-1',
    'punto-1',
    'medicamento-1',
    'inv-1',
    2,
    estado,
    new Date('2026-01-01'),
    fechaExpiracion,
  );
}

describe('ListarMisReservasUseCase', () => {
  it('no toca una reserva ACTIVA que todavía no vence', async () => {
    const vigente = crearReserva(
      EstadoReserva.ACTIVA,
      new Date(Date.now() + 60 * 60 * 1000),
    );
    const reservaRepo = crearReservaRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([vigente]),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new ListarMisReservasUseCase(reservaRepo, inventarioRepo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(resultado).toEqual([vigente]);
    expect(inventarioRepo.ajustarStock).not.toHaveBeenCalled();
    expect(reservaRepo.actualizarEstado).not.toHaveBeenCalled();
  });

  it('expira una reserva ACTIVA vencida y libera el stock reservado', async () => {
    const vencida = crearReserva(
      EstadoReserva.ACTIVA,
      new Date(Date.now() - 60 * 60 * 1000),
    );
    const expirada = crearReserva(
      EstadoReserva.EXPIRADA,
      vencida.fechaExpiracion,
    );
    const reservaRepo = crearReservaRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([vencida]),
      actualizarEstado: jest.fn().mockResolvedValue(expirada),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new ListarMisReservasUseCase(reservaRepo, inventarioRepo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(inventarioRepo.ajustarStock).toHaveBeenCalledWith('inv-1', {
      deltaStockReservado: -2,
    });
    expect(reservaRepo.actualizarEstado).toHaveBeenCalledWith(
      'reserva-1',
      EstadoReserva.EXPIRADA,
    );
    expect(resultado).toEqual([expirada]);
  });

  it('no vuelve a tocar una reserva que ya no está ACTIVA', async () => {
    const cancelada = crearReserva(
      EstadoReserva.CANCELADA,
      new Date(Date.now() - 60 * 60 * 1000),
    );
    const reservaRepo = crearReservaRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([cancelada]),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new ListarMisReservasUseCase(reservaRepo, inventarioRepo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(resultado).toEqual([cancelada]);
    expect(inventarioRepo.ajustarStock).not.toHaveBeenCalled();
  });
});
