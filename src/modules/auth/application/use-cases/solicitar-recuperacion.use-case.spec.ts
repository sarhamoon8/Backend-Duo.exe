import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from '../../../notificaciones/domain/email-provider';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { TokenRecuperacionRepository } from '../../domain/token-recuperacion.repository';
import {
  hashDeToken,
  MINUTOS_VIGENCIA_RECUPERACION,
  SolicitarRecuperacionUseCase,
} from './solicitar-recuperacion.use-case';

const AHORA = new Date('2026-11-16T15:00:00.000Z');
const usuario = new Usuario(
  'u1',
  '123',
  'CC',
  'Ana <b>',
  'Pérez',
  'ana@example.com',
  'hash',
  null,
  Rol.PACIENTE,
  new Date(),
);

describe('SolicitarRecuperacionUseCase', () => {
  let usuarios: jest.Mocked<UsuarioRepository>;
  let tokens: jest.Mocked<TokenRecuperacionRepository>;
  let correo: jest.Mocked<EmailProvider>;
  let entorno: Record<string, string | undefined>;
  let useCase: SolicitarRecuperacionUseCase;

  beforeEach(() => {
    usuarios = {
      buscarPorEmail: jest.fn().mockResolvedValue(usuario),
    } as unknown as jest.Mocked<UsuarioRepository>;
    tokens = {
      crear: jest.fn().mockResolvedValue(undefined),
      invalidarPendientes: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TokenRecuperacionRepository>;
    correo = { enviar: jest.fn().mockResolvedValue(undefined) };
    entorno = { FRONTEND_URL: 'https://filacero.test/' };
    const config = {
      get: jest.fn((clave: string) => entorno[clave]),
    } as unknown as ConfigService;
    useCase = new SolicitarRecuperacionUseCase(
      usuarios,
      tokens,
      correo,
      config,
    );
  });

  const enlaceEnviado = (): string => {
    const html = correo.enviar.mock.calls[0]![2];
    return /href="([^"]+)"/.exec(html)![1]!;
  };

  it('no hace nada ni revela nada si el correo no tiene cuenta', async () => {
    usuarios.buscarPorEmail.mockResolvedValue(null);

    await expect(
      useCase.ejecutar('nadie@example.com', AHORA),
    ).resolves.toBeUndefined();

    expect(tokens.crear).not.toHaveBeenCalled();
    expect(correo.enviar).not.toHaveBeenCalled();
  });

  it('guarda solo el hash del token, con vigencia de una hora, y anula los enlaces anteriores', async () => {
    await useCase.ejecutar('ana@example.com', AHORA);

    const enlace = enlaceEnviado();
    const token = new URL(enlace).searchParams.get('token')!;
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(tokens.invalidarPendientes).toHaveBeenCalledWith('u1');
    expect(tokens.crear).toHaveBeenCalledWith({
      usuarioId: 'u1',
      tokenHash: hashDeToken(token),
      expiraEn: new Date(
        AHORA.getTime() + MINUTOS_VIGENCIA_RECUPERACION * 60_000,
      ),
    });
    // El token en claro nunca se guarda.
    expect(JSON.stringify(tokens.crear.mock.calls)).not.toContain(token);
  });

  it('envía al correo de la cuenta un enlace al frontend, con el nombre escapado', async () => {
    await useCase.ejecutar('ana@example.com', AHORA);

    const [destino, asunto, html] = correo.enviar.mock.calls[0]!;
    expect(destino).toBe('ana@example.com');
    expect(asunto).toMatch(/contraseña/i);
    expect(enlaceEnviado()).toMatch(
      /^https:\/\/filacero\.test\/restablecer-contrasena\?token=/,
    );
    expect(html).toContain('Ana &lt;b&gt;');
    expect(html).not.toContain('Ana <b>');
  });

  it('usa localhost:3001 si no hay FRONTEND_URL', async () => {
    entorno = {};

    await useCase.ejecutar('ana@example.com', AHORA);

    expect(enlaceEnviado()).toMatch(
      /^http:\/\/localhost:3001\/restablecer-contrasena\?token=/,
    );
  });

  it('registra el enlace en el log solo si RECUPERACION_REGISTRAR_ENLACE es "true"', async () => {
    entorno = {
      FRONTEND_URL: 'https://filacero.test/',
      RECUPERACION_REGISTRAR_ENLACE: 'true',
    };
    const logSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    await useCase.ejecutar('ana@example.com', AHORA);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('ana@example.com'),
    );
    logSpy.mockRestore();
  });

  it('cada solicitud genera un token distinto', async () => {
    await useCase.ejecutar('ana@example.com', AHORA);
    await useCase.ejecutar('ana@example.com', AHORA);

    const [primero, segundo] = tokens.crear.mock.calls.map(
      (c) => c[0].tokenHash,
    );
    expect(primero).not.toBe(segundo);
  });

  it('si el correo no se puede enviar, no lanza (no se le cuenta a quien lo pidió)', async () => {
    correo.enviar.mockRejectedValue(new Error('SMTP caído'));

    await expect(
      useCase.ejecutar('ana@example.com', AHORA),
    ).resolves.toBeUndefined();
    expect(tokens.crear).toHaveBeenCalled();
  });
});
