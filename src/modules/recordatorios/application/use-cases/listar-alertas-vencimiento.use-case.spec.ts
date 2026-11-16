import { ListarAlertasVencimientoUseCase } from './listar-alertas-vencimiento.use-case';
import { RecordatorioRepository } from '../../domain/recordatorio.repository';
import { Recordatorio } from '../../domain/recordatorio.entity';
import { InventarioRepository } from '../../../inventario/domain/inventario.repository';
import { Inventario } from '../../../inventario/domain/inventario.entity';

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

function crearRecordatorio(activo: boolean, medicamentoId = 'medicamento-1'): Recordatorio {
  return new Recordatorio(
    'recordatorio-1',
    'usuario-1',
    medicamentoId,
    'Tomar acetaminofén',
    '08:00',
    activo,
    new Date(),
  );
}

function crearLote(fechaVencimiento: Date): Inventario {
  return new Inventario(
    'inv-1',
    'punto-1',
    'medicamento-1',
    'L-1',
    10,
    0,
    fechaVencimiento,
  );
}

const DIA_EN_MS = 24 * 60 * 60 * 1000;

describe('ListarAlertasVencimientoUseCase', () => {
  it('ignora recordatorios inactivos', async () => {
    const recordatorioRepo = crearRecordatorioRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([crearRecordatorio(false)]),
    });
    const inventarioRepo = crearInventarioRepoFalso();
    const useCase = new ListarAlertasVencimientoUseCase(
      recordatorioRepo,
      inventarioRepo,
    );

    const alertas = await useCase.ejecutar('usuario-1');

    expect(alertas).toEqual([]);
    expect(inventarioRepo.listarPorMedicamento).not.toHaveBeenCalled();
  });

  it('no genera alerta si no hay inventario registrado para el medicamento', async () => {
    const recordatorioRepo = crearRecordatorioRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([crearRecordatorio(true)]),
    });
    const inventarioRepo = crearInventarioRepoFalso({
      listarPorMedicamento: jest.fn().mockResolvedValue([]),
    });
    const useCase = new ListarAlertasVencimientoUseCase(
      recordatorioRepo,
      inventarioRepo,
    );

    const alertas = await useCase.ejecutar('usuario-1');

    expect(alertas).toEqual([]);
  });

  it('no genera alerta si el vencimiento más próximo está fuera del umbral', async () => {
    const lejano = crearLote(new Date(Date.now() + 30 * DIA_EN_MS));
    const recordatorioRepo = crearRecordatorioRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([crearRecordatorio(true)]),
    });
    const inventarioRepo = crearInventarioRepoFalso({
      listarPorMedicamento: jest.fn().mockResolvedValue([lejano]),
    });
    const useCase = new ListarAlertasVencimientoUseCase(
      recordatorioRepo,
      inventarioRepo,
    );

    const alertas = await useCase.ejecutar('usuario-1');

    expect(alertas).toEqual([]);
  });

  it('toma el lote que vence más pronto entre varios lotes del mismo medicamento', async () => {
    const medio = crearLote(new Date(Date.now() + 10 * DIA_EN_MS));
    const cercano = crearLote(new Date(Date.now() + 2 * DIA_EN_MS));
    const lejano = crearLote(new Date(Date.now() + 60 * DIA_EN_MS));
    const recordatorio = crearRecordatorio(true);
    const recordatorioRepo = crearRecordatorioRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([recordatorio]),
    });
    const inventarioRepo = crearInventarioRepoFalso({
      // Orden deliberado: primero "medio", luego algo más próximo
      // (reemplaza el mínimo) y luego algo más lejano (lo mantiene) — así
      // el reduce ejercita las dos ramas del comparador.
      listarPorMedicamento: jest
        .fn()
        .mockResolvedValue([medio, cercano, lejano]),
    });
    const useCase = new ListarAlertasVencimientoUseCase(
      recordatorioRepo,
      inventarioRepo,
    );

    const alertas = await useCase.ejecutar('usuario-1');

    expect(alertas).toHaveLength(1);
    expect(alertas[0].fechaVencimientoMasProxima).toEqual(
      cercano.fechaVencimiento,
    );
  });

  it('genera una alerta cuando el lote más próximo vence dentro del umbral', async () => {
    const cercano = crearLote(new Date(Date.now() + 3 * DIA_EN_MS));
    const recordatorio = crearRecordatorio(true);
    const recordatorioRepo = crearRecordatorioRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([recordatorio]),
    });
    const inventarioRepo = crearInventarioRepoFalso({
      listarPorMedicamento: jest.fn().mockResolvedValue([cercano]),
    });
    const useCase = new ListarAlertasVencimientoUseCase(
      recordatorioRepo,
      inventarioRepo,
    );

    const alertas = await useCase.ejecutar('usuario-1');

    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toMatchObject({
      medicamentoId: recordatorio.medicamentoId,
      recordatorioId: recordatorio.id,
    });
    expect(alertas[0].diasParaVencer).toBeLessThanOrEqual(7);
  });
});
