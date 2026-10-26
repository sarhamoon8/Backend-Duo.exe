import { Notificacion } from '../../domain/notificacion.entity';
import { TipoNotificacion } from '../../domain/tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from '../../domain/estado-envio-notificacion.enum';

export class NotificacionResponseDto {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  estadoEnvio: EstadoEnvioNotificacion;
  leida: boolean;
  creadoEn: Date;

  static fromEntity(notificacion: Notificacion): NotificacionResponseDto {
    const dto = new NotificacionResponseDto();
    dto.id = notificacion.id;
    dto.tipo = notificacion.tipo;
    dto.titulo = notificacion.titulo;
    dto.mensaje = notificacion.mensaje;
    dto.estadoEnvio = notificacion.estadoEnvio;
    dto.leida = notificacion.leida;
    dto.creadoEn = notificacion.creadoEn;
    return dto;
  }
}
