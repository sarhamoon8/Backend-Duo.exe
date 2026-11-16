import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EliminarRecordatorioUseCase } from './eliminar-recordatorio.use-case';
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

function crearRecordatorio(usuarioId = 'usuario-1'): Recordatorio {
  return new Recordatorio(
    'recordatorio-1',
    usuarioId,
    'medicamento-1',
    'Tomar acetaminofén',
    '08:00',
    true,
    new Date(),
  );
}

describe('EliminarRecordatorioUseCase', () => {
  it('lanza NotFoundException si el recordatorio no existe', async () => {
    const repo = crearRecordatorioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new EliminarRecordatorioUseCase(repo);

    await expect(
      useCase.ejecutar('inexistente', 'usuario-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza eliminar el recordatorio de otro usuario', async () => {
    const recordatorio = crearRecordatorio('usuario-1');
    const repo = crearRecordatorioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(recordatorio),
    });
    const useCase = new EliminarRecordatorioUseCase(repo);

    await expect(
      useCase.ejecutar(recordatorio.id, 'usuario-2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.eliminar).not.toHaveBeenCalled();
  });

  it('elimina el recordatorio propio', async () => {
    const recordatorio = crearRecordatorio('usuario-1');
    const repo = crearRecordatorioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(recordatorio),
    });
    const useCase = new EliminarRecordatorioUseCase(repo);

    await useCase.ejecutar(recordatorio.id, 'usuario-1');

    expect(repo.eliminar).toHaveBeenCalledWith(recordatorio.id);
  });
});
