import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CrearReservaUseCase } from './crear-reserva.use-case';
import { ReservaRepository } from '../../domain/reserva.repository';
import { Reserva } from '../../domain/reserva.entity';
import { EstadoReserva } from '../../domain/estado-reserva.enum';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../../puntos-dispensacion/domain/punto-dispensacion.entity';
import { MedicamentoRepository } from '../../../medicamentos/domain/medicamento.repository';
import { Medicamento } from '../../../medicamentos/domain/medicamento.entity';
import { InventarioRepository } from '../../../inventario/domain/inventario.repository';
import { Inventario } from '../../../inventario/domain/inventario.entity';
import { CrearReservaDto } from '../dto/crear-reserva.dto';

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

function crearMedicamentoRepoFalso(
  overrides: Partial<MedicamentoRepository> = {},
): jest.Mocked<MedicamentoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCodigoNacional: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<MedicamentoRepository>;
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

const dto: CrearReservaDto = {
  puntoId: 'punto-1',
  medicamentoId: 'medicamento-1',
  cantidad: 2,
};

const punto = new PuntoDispensacion(
  'punto-1',
  'entidad-1',
  'Sede Centro',
  'Calle 1',
  'Bogotá',
  null,
  10,
);

const medicamento = new Medicamento(
  'medicamento-1',
  'CUM-1',
  'Acetaminofén',
  '500mg',
  'Tableta',
  'Lab',
  false,
);

function crearLote(
  id: string,
  stockActual: number,
  stockReservado: number,
  fechaVencimiento: Date,
): Inventario {
  return new Inventario(
    id,
    'punto-1',
    'medicamento-1',
    `L-${id}`,
    stockActual,
    stockReservado,
    fechaVencimiento,
  );
}

function construir(
  overrides: {
    reservaRepo?: Partial<ReservaRepository>;
    puntoRepo?: Partial<PuntoDispensacionRepository>;
    medicamentoRepo?: Partial<MedicamentoRepository>;
    inventarioRepo?: Partial<InventarioRepository>;
  } = {},
) {
  const reservaRepo = crearReservaRepoFalso(overrides.reservaRepo);
  const puntoRepo = crearPuntoRepoFalso({
    buscarPorId: jest.fn().mockResolvedValue(punto),
    ...overrides.puntoRepo,
  });
  const medicamentoRepo = crearMedicamentoRepoFalso({
    buscarPorId: jest.fn().mockResolvedValue(medicamento),
    ...overrides.medicamentoRepo,
  });
  const inventarioRepo = crearInventarioRepoFalso(overrides.inventarioRepo);
  const useCase = new CrearReservaUseCase(
    reservaRepo,
    puntoRepo,
    medicamentoRepo,
    inventarioRepo,
  );
  return { useCase, reservaRepo, puntoRepo, medicamentoRepo, inventarioRepo };
}

describe('CrearReservaUseCase', () => {
  it('rechaza si el punto no existe', async () => {
    const { useCase } = construir({
      puntoRepo: { buscarPorId: jest.fn().mockResolvedValue(null) },
    });

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rechaza si el medicamento no existe', async () => {
    const { useCase } = construir({
      medicamentoRepo: { buscarPorId: jest.fn().mockResolvedValue(null) },
    });

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rechaza si no hay stock disponible suficiente', async () => {
    const { useCase, inventarioRepo } = construir({
      inventarioRepo: {
        listarPorPunto: jest
          .fn()
          .mockResolvedValue([
            crearLote('inv-1', 2, 1, new Date('2027-01-01')),
          ]),
      },
    });

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(inventarioRepo.ajustarStock).not.toHaveBeenCalled();
  });

  it('elige el lote con disponible que vence más pronto (FEFO) y aparta el stock', async () => {
    const loteLejano = crearLote('inv-lejano', 10, 0, new Date('2027-06-01'));
    const loteCercano = crearLote('inv-cercano', 10, 0, new Date('2027-01-01'));
    const reservaCreada = new Reserva(
      'reserva-1',
      'usuario-1',
      'punto-1',
      'medicamento-1',
      'inv-cercano',
      2,
      EstadoReserva.ACTIVA,
      new Date(),
      new Date(),
    );
    const { useCase, inventarioRepo, reservaRepo } = construir({
      inventarioRepo: {
        listarPorPunto: jest
          .fn()
          .mockResolvedValue([loteLejano, loteCercano]),
      },
      reservaRepo: { crear: jest.fn().mockResolvedValue(reservaCreada) },
    });

    const resultado = await useCase.ejecutar(dto, 'usuario-1');

    expect(inventarioRepo.ajustarStock).toHaveBeenCalledWith('inv-cercano', {
      deltaStockReservado: 2,
    });
    expect(reservaRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 'usuario-1',
        inventarioId: 'inv-cercano',
        cantidadReservada: 2,
      }),
    );
    expect(resultado).toBe(reservaCreada);
  });
});
