import { ListarMisRecordatoriosUseCase } from './listar-mis-recordatorios.use-case';
import { RecordatorioRepository } from '../../domain/recordatorio.repository';
import { Recordatorio } from '../../domain/recordatorio.entity';

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

describe('ListarMisRecordatoriosUseCase', () => {
  it('devuelve los recordatorios del usuario', async () => {
    const recordatorio = new Recordatorio(
      'recordatorio-1',
      'usuario-1',
      'medicamento-1',
      'Tomar acetaminofén',
      '08:00',
      true,
      new Date(),
    );
    const recordatorioRepo = crearRecordatorioRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([recordatorio]),
    });
    const useCase = new ListarMisRecordatoriosUseCase(recordatorioRepo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(recordatorioRepo.listarPorUsuario).toHaveBeenCalledWith(
      'usuario-1',
    );
    expect(resultado).toEqual([recordatorio]);
  });
});
