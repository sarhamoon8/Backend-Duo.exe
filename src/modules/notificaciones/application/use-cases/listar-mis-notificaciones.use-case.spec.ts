import { ListarMisNotificacionesUseCase } from './listar-mis-notificaciones.use-case';
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

describe('ListarMisNotificacionesUseCase', () => {
  it('delega en notificacionRepository.listarPorUsuario', async () => {
    const repo = crearNotificacionRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([notificacion]),
    });
    const useCase = new ListarMisNotificacionesUseCase(repo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(repo.listarPorUsuario).toHaveBeenCalledWith('usuario-1');
    expect(resultado).toEqual([notificacion]);
  });
});
