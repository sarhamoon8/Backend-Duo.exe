import { EnviarNotificacionUseCase } from './enviar-notificacion.use-case';
import { NotificacionRepository } from '../../domain/notificacion.repository';
import { EmailProvider } from '../../domain/email-provider';
import { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { TipoNotificacion } from '../../domain/tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from '../../domain/estado-envio-notificacion.enum';
import { Notificacion } from '../../domain/notificacion.entity';

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

function crearEmailProviderFalso(
  overrides: Partial<EmailProvider> = {},
): jest.Mocked<EmailProvider> {
  return {
    enviar: jest.fn(),
    ...overrides,
  } as jest.Mocked<EmailProvider>;
}

function crearUsuarioRepoFalso(
  overrides: Partial<UsuarioRepository> = {},
): jest.Mocked<UsuarioRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorEmail: jest.fn(),
    buscarPorNumeroDocumento: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<UsuarioRepository>;
}

function crearUsuario(): Usuario {
  return new Usuario(
    'usuario-1',
    '123',
    'CC',
    'Ana',
    'Pérez',
    'ana@example.com',
    'hash',
    null,
    Rol.PACIENTE,
    new Date(),
  );
}

describe('EnviarNotificacionUseCase', () => {
  it('envía el correo y registra la notificación como ENVIADA', async () => {
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(crearUsuario()),
    });
    const emailProvider = crearEmailProviderFalso({
      enviar: jest.fn().mockResolvedValue(undefined),
    });
    const notificacionRepo = crearNotificacionRepoFalso({
      crear: jest.fn().mockImplementation((n) =>
        Promise.resolve(
          new Notificacion(
            'notif-1',
            n.usuarioId,
            n.tipo,
            n.titulo,
            n.mensaje,
            n.estadoEnvio,
            false,
            new Date(),
          ),
        ),
      ),
    });
    const useCase = new EnviarNotificacionUseCase(
      notificacionRepo,
      emailProvider,
      usuarioRepo,
    );

    const resultado = await useCase.ejecutar(
      'usuario-1',
      TipoNotificacion.TURNO_CREADO,
      'Turno creado',
      'mensaje',
    );

    expect(emailProvider.enviar).toHaveBeenCalledWith(
      'ana@example.com',
      'Turno creado',
      'mensaje',
    );
    expect(resultado.estadoEnvio).toBe(EstadoEnvioNotificacion.ENVIADA);
  });

  it('si el envío falla, registra la notificación como FALLIDA sin lanzar', async () => {
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(crearUsuario()),
    });
    const emailProvider = crearEmailProviderFalso({
      enviar: jest.fn().mockRejectedValue(new Error('Resend caído')),
    });
    const notificacionRepo = crearNotificacionRepoFalso({
      crear: jest.fn().mockImplementation((n) =>
        Promise.resolve(
          new Notificacion(
            'notif-1',
            n.usuarioId,
            n.tipo,
            n.titulo,
            n.mensaje,
            n.estadoEnvio,
            false,
            new Date(),
          ),
        ),
      ),
    });
    const useCase = new EnviarNotificacionUseCase(
      notificacionRepo,
      emailProvider,
      usuarioRepo,
    );

    const resultado = await useCase.ejecutar(
      'usuario-1',
      TipoNotificacion.TURNO_CANCELADO,
      'Turno cancelado',
      'mensaje',
    );

    expect(resultado.estadoEnvio).toBe(EstadoEnvioNotificacion.FALLIDA);
    expect(notificacionRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({ estadoEnvio: EstadoEnvioNotificacion.FALLIDA }),
    );
  });

  it('si el usuario no existe, registra la notificación como FALLIDA sin lanzar', async () => {
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const emailProvider = crearEmailProviderFalso();
    const notificacionRepo = crearNotificacionRepoFalso({
      crear: jest.fn().mockImplementation((n) =>
        Promise.resolve(
          new Notificacion(
            'notif-1',
            n.usuarioId,
            n.tipo,
            n.titulo,
            n.mensaje,
            n.estadoEnvio,
            false,
            new Date(),
          ),
        ),
      ),
    });
    const useCase = new EnviarNotificacionUseCase(
      notificacionRepo,
      emailProvider,
      usuarioRepo,
    );

    const resultado = await useCase.ejecutar(
      'usuario-inexistente',
      TipoNotificacion.TURNO_CREADO,
      'Turno creado',
      'mensaje',
    );

    expect(emailProvider.enviar).not.toHaveBeenCalled();
    expect(resultado.estadoEnvio).toBe(EstadoEnvioNotificacion.FALLIDA);
  });
});
