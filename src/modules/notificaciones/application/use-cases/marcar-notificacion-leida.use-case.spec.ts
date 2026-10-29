import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MarcarNotificacionLeidaUseCase } from './marcar-notificacion-leida.use-case';
import { NotificacionRepository } from '../../domain/notificacion.repository';
import { Notificacion } from '../../domain/notificacion.entity';
import { TipoNotificacion } from '../../domain/tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from '../../domain/estado-envio-notificacion.enum';

function crearNotificacionRepoFalso(
  overrides: Partial<NotificacionRepository> = {},
): jest.Mocked<NotificacionRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    marcarLeida: jest.fn(),
    ...overrides,
  } as jest.Mocked<NotificacionRepository>;
}

const notificacion = new Notificacion(
  'notif-1',
  'usuario-1',
  TipoNotificacion.TURNO_CREADO,
  'Turno creado',
  'mensaje',
  EstadoEnvioNotificacion.ENVIADA,
  false,
  new Date(),
);

describe('MarcarNotificacionLeidaUseCase', () => {
  it('rechaza si la notificación no existe', async () => {
    const repo = crearNotificacionRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new MarcarNotificacionLeidaUseCase(repo);

    await expect(
      useCase.ejecutar('inexistente', 'usuario-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.marcarLeida).not.toHaveBeenCalled();
  });

  it('rechaza si la notificación pertenece a otro usuario', async () => {
    const repo = crearNotificacionRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(notificacion),
    });
    const useCase = new MarcarNotificacionLeidaUseCase(repo);

    await expect(
      useCase.ejecutar('notif-1', 'otro-usuario'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.marcarLeida).not.toHaveBeenCalled();
  });

  it('marca la notificación como leída cuando pertenece al usuario', async () => {
    const notificacionLeida = new Notificacion(
      'notif-1',
      'usuario-1',
      TipoNotificacion.TURNO_CREADO,
      'Turno creado',
      'mensaje',
      EstadoEnvioNotificacion.ENVIADA,
      true,
      new Date(),
    );
    const repo = crearNotificacionRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(notificacion),
      marcarLeida: jest.fn().mockResolvedValue(notificacionLeida),
    });
    const useCase = new MarcarNotificacionLeidaUseCase(repo);

    const resultado = await useCase.ejecutar('notif-1', 'usuario-1');

    expect(repo.marcarLeida).toHaveBeenCalledWith('notif-1');
    expect(resultado).toBe(notificacionLeida);
  });
});
