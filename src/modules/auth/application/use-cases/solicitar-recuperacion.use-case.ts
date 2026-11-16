import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USUARIO_REPOSITORY } from '../../../usuarios/domain/usuario.repository';
import type { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { EMAIL_PROVIDER } from '../../../notificaciones/domain/email-provider';
import type { EmailProvider } from '../../../notificaciones/domain/email-provider';
import { construirCorreoHtml } from '../../../notificaciones/infrastructure/email/plantilla-correo';
import { TOKEN_RECUPERACION_REPOSITORY } from '../../domain/token-recuperacion.repository';
import type { TokenRecuperacionRepository } from '../../domain/token-recuperacion.repository';

// El enlace vale una hora.
export const MINUTOS_VIGENCIA_RECUPERACION = 60;

export function hashDeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Injectable()
export class SolicitarRecuperacionUseCase {
  private readonly logger = new Logger(SolicitarRecuperacionUseCase.name);

  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(TOKEN_RECUPERACION_REPOSITORY)
    private readonly tokenRepository: TokenRecuperacionRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
    private readonly config: ConfigService,
  ) {}

  /**
   * Envía por correo un enlace para definir una contraseña nueva. No dice si
   * el correo tiene cuenta (no devuelve nada en ningún caso) para que nadie
   * pueda usar este paso y descubrir qué correos están registrados.
   */
  async ejecutar(email: string, ahora: Date = new Date()): Promise<void> {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) return;

    const token = randomBytes(32).toString('base64url');
    await this.tokenRepository.invalidarPendientes(usuario.id);
    await this.tokenRepository.crear({
      usuarioId: usuario.id,
      tokenHash: hashDeToken(token),
      expiraEn: new Date(
        ahora.getTime() + MINUTOS_VIGENCIA_RECUPERACION * 60_000,
      ),
    });

    const base = (
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001'
    ).replace(/\/+$/, '');
    const enlace = `${base}/restablecer-contrasena?token=${token}`;

    // Solo para desarrollo local sin Gmail configurado: permite probar el
    // flujo leyendo el enlace en los logs. No activar en producción.
    if (this.config.get<string>('RECUPERACION_REGISTRAR_ENLACE') === 'true') {
      this.logger.warn(
        `Enlace de recuperación para ${usuario.email}: ${enlace}`,
      );
    }

    try {
      await this.emailProvider.enviar(
        usuario.email,
        'Restablece tu contraseña de FilaCero',
        construirCorreoHtml({
          nombreUsuario: escaparHtml(usuario.nombres),
          titulo: 'Restablece tu contraseña',
          mensaje:
            `Recibimos una solicitud para cambiar la contraseña de tu cuenta. ` +
            `El enlace vale ${MINUTOS_VIGENCIA_RECUPERACION} minutos y solo se puede usar una vez.<br /><br />` +
            `<a href="${enlace}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:10px;">Cambiar mi contraseña</a><br /><br />` +
            `Si el botón no funciona, copia este enlace en tu navegador:<br />${enlace}<br /><br />` +
            `Si no fuiste tú, ignora este correo: tu contraseña no cambiará.`,
        }),
      );
    } catch (error) {
      // Se registra, pero no se le cuenta a quien pidió el enlace (ver arriba).
      this.logger.error(
        `No se pudo enviar el correo de recuperación: ${(error as Error).message}`,
      );
    }
  }
}
