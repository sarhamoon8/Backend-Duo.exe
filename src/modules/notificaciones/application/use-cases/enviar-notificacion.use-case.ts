import { Inject, Injectable, Logger } from '@nestjs/common';
import { Notificacion } from '../../domain/notificacion.entity';
import { TipoNotificacion } from '../../domain/tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from '../../domain/estado-envio-notificacion.enum';
import {
  NOTIFICACION_REPOSITORY,
} from '../../domain/notificacion.repository';
import type { NotificacionRepository } from '../../domain/notificacion.repository';
import { EMAIL_PROVIDER } from '../../domain/email-provider';
import type { EmailProvider } from '../../domain/email-provider';
import { USUARIO_REPOSITORY } from '../../../usuarios/domain/usuario.repository';
import type { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';

// RF-05: punto de entrada único para notificar un evento del flujo de
// turnos a un usuario. Se usa desde otros módulos (turnos) para no
// repetir la lógica de "buscar email + enviar + registrar" en cada caso
// de uso que dispara una notificación.
//
// El envío de correo NUNCA debe tumbar el flujo que lo origina (crear un
// turno, cancelarlo, etc.): si Resend falla, no hay API key configurada,
// o el usuario no existe, se registra la notificación como FALLIDA y se
// continúa. Por eso este método no lanza excepciones.
@Injectable()
export class EnviarNotificacionUseCase {
  private readonly logger = new Logger(EnviarNotificacionUseCase.name);

  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: NotificacionRepository,
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async ejecutar(
    usuarioId: string,
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
  ): Promise<Notificacion> {
    let estadoEnvio = EstadoEnvioNotificacion.FALLIDA;

    try {
      const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
      if (!usuario) {
        throw new Error(`Usuario ${usuarioId} no encontrado`);
      }
      await this.emailProvider.enviar(usuario.email, titulo, mensaje);
      estadoEnvio = EstadoEnvioNotificacion.ENVIADA;
    } catch (error) {
      const detalle = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo enviar la notificación ${tipo} a ${usuarioId}: ${detalle}`,
      );
    }

    return this.notificacionRepository.crear({
      usuarioId,
      tipo,
      titulo,
      mensaje,
      estadoEnvio,
    });
  }
}
