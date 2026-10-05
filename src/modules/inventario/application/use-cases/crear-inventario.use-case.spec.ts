import { NotFoundException } from '@nestjs/common';
import { CrearInventarioUseCase } from './crear-inventario.use-case';
import { InventarioRepository } from '../../domain/inventario.repository';
import { Inventario } from '../../domain/inventario.entity';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../../puntos-dispensacion/domain/punto-dispensacion.entity';
import { MedicamentoRepository } from '../../../medicamentos/domain/medicamento.repository';
import { Medicamento } from '../../../medicamentos/domain/medicamento.entity';
import { CrearInventarioDto } from '../dto/crear-inventario.dto';

function crearInventarioRepoFalso(
  overrides: Partial<InventarioRepository> = {},
): jest.Mocked<InventarioRepository> {
  return {
    crear: jest.fn(),
    listarPorPunto: jest.fn(),
    ...overrides,
  } as jest.Mocked<InventarioRepository>;
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

const dto: CrearInventarioDto = {
  puntoId: 'punto-1',
  medicamentoId: 'medicamento-1',
  lote: 'L-001',
  stockActual: 10,
  fechaVencimiento: '2027-01-01',
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

const medicamentoExistente = new Medicamento(
  'medicamento-1',
  'CUM-1',
  'Acetaminofén',
  '500mg',
  'Tableta',
  'Lab',
  false,
);

describe('CrearInventarioUseCase', () => {
  it('rechaza si el punto de dispensación no existe', async () => {
    const inventarioRepo = crearInventarioRepoFalso();
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const medicamentoRepo = crearMedicamentoRepoFalso();
    const useCase = new CrearInventarioUseCase(
      inventarioRepo,
      puntoRepo,
      medicamentoRepo,
    );

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(inventarioRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el medicamento no existe', async () => {
    const inventarioRepo = crearInventarioRepoFalso();
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoExistente),
    });
    const medicamentoRepo = crearMedicamentoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearInventarioUseCase(
      inventarioRepo,
      puntoRepo,
      medicamentoRepo,
    );

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(inventarioRepo.crear).not.toHaveBeenCalled();
  });

  it('crea el inventario cuando el punto y el medicamento existen', async () => {
    const inventarioRepo = crearInventarioRepoFalso({
      crear: jest.fn().mockResolvedValue(
        new Inventario(
          'inv-1',
          dto.puntoId,
          dto.medicamentoId,
          dto.lote,
          dto.stockActual,
          0,
          new Date(dto.fechaVencimiento),
        ),
      ),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoExistente),
    });
    const medicamentoRepo = crearMedicamentoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(medicamentoExistente),
    });
    const useCase = new CrearInventarioUseCase(
      inventarioRepo,
      puntoRepo,
      medicamentoRepo,
    );

    const resultado = await useCase.ejecutar(dto);

    expect(inventarioRepo.crear).toHaveBeenCalledTimes(1);
    expect(resultado.stockActual).toBe(dto.stockActual);
  });
});
