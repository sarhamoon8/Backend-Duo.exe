import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ActualizarEstadoRecordatorioUseCase } from './actualizar-estado-recordatorio.use-case';
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

describe('ActualizarEstadoRecordatorioUseCase', () => {
  it('lanza NotFoundException si el recordatorio no existe', async () => {
    const repo = crearRecordatorioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ActualizarEstadoRecordatorioUseCase(repo);

    await expect(
      useCase.ejecutar('inexistente', false, 'usuario-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza modificar el recordatorio de otro usuario', async () => {
    const recordatorio = crearRecordatorio('usuario-1');
    const repo = crearRecordatorioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(recordatorio),
    });
    const useCase = new ActualizarEstadoRecordatorioUseCase(repo);

    await expect(
      useCase.ejecutar(recordatorio.id, false, 'usuario-2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.actualizarActivo).not.toHaveBeenCalled();
  });

  it('actualiza el estado activo del recordatorio propio', async () => {
    const recordatorio = crearRecordatorio('usuario-1');
    const actualizado = new Recordatorio(
      recordatorio.id,
      'usuario-1',
      recordatorio.medicamentoId,
      recordatorio.mensaje,
      recordatorio.horaRecordatorio,
      false,
      recordatorio.creadoEn,
    );
    const repo = crearRecordatorioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(recordatorio),
      actualizarActivo: jest.fn().mockResolvedValue(actualizado),
    });
    const useCase = new ActualizarEstadoRecordatorioUseCase(repo);

    const resultado = await useCase.ejecutar(
      recordatorio.id,
      false,
      'usuario-1',
    );

    expect(repo.actualizarActivo).toHaveBeenCalledWith(recordatorio.id, false);
    expect(resultado).toBe(actualizado);
  });
});
