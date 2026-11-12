import { NotFoundException } from '@nestjs/common';
import { CrearRecordatorioUseCase } from './crear-recordatorio.use-case';
import { RecordatorioRepository } from '../../domain/recordatorio.repository';
import { Recordatorio } from '../../domain/recordatorio.entity';
import { MedicamentoRepository } from '../../../medicamentos/domain/medicamento.repository';
import { Medicamento } from '../../../medicamentos/domain/medicamento.entity';
import { CrearRecordatorioDto } from '../dto/crear-recordatorio.dto';

function crearRecordatorioRepoFalso(
  overrides: Partial<RecordatorioRepository> = {},
): jest.Mocked<RecordatorioRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    actualizarActivo: jest.fn(),
    eliminar: jest.fn(),
    ...overrides,
  } as jest.Mocked<RecordatorioRepository>;
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

const dto: CrearRecordatorioDto = {
  medicamentoId: 'medicamento-1',
  mensaje: 'Tomar acetaminofén',
  horaRecordatorio: '08:00',
};

const medicamento = new Medicamento(
  'medicamento-1',
  'CUM-1',
  'Acetaminofén',
  '500mg',
  'Tableta',
  'Lab',
  false,
);

describe('CrearRecordatorioUseCase', () => {
  it('rechaza si el medicamento no existe', async () => {
    const recordatorioRepo = crearRecordatorioRepoFalso();
    const medicamentoRepo = crearMedicamentoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearRecordatorioUseCase(
      recordatorioRepo,
      medicamentoRepo,
    );

    await expect(
      useCase.ejecutar(dto, 'usuario-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(recordatorioRepo.crear).not.toHaveBeenCalled();
  });

  it('crea el recordatorio cuando el medicamento existe', async () => {
    const creado = new Recordatorio(
      'recordatorio-1',
      'usuario-1',
      dto.medicamentoId,
      dto.mensaje,
      dto.horaRecordatorio,
      true,
      new Date(),
    );
    const recordatorioRepo = crearRecordatorioRepoFalso({
      crear: jest.fn().mockResolvedValue(creado),
    });
    const medicamentoRepo = crearMedicamentoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(medicamento),
    });
    const useCase = new CrearRecordatorioUseCase(
      recordatorioRepo,
      medicamentoRepo,
    );

    const resultado = await useCase.ejecutar(dto, 'usuario-1');

    expect(recordatorioRepo.crear).toHaveBeenCalledWith({
      usuarioId: 'usuario-1',
      medicamentoId: dto.medicamentoId,
      mensaje: dto.mensaje,
      horaRecordatorio: dto.horaRecordatorio,
    });
    expect(resultado).toBe(creado);
  });
});
