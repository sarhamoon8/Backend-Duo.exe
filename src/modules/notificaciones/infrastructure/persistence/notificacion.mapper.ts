import {
  Notificacion as NotificacionPrisma,
  TipoNotificacion as TipoNotificacionPrisma,
  EstadoEnvioNotificacion as EstadoEnvioNotificacionPrisma,
} from '@prisma/client';
import { Notificacion } from '../../domain/notificacion.entity';
import { TipoNotificacion } from '../../domain/tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from '../../domain/estado-envio-notificacion.enum';

export class NotificacionMapper {
  static toDomain(notificacionPrisma: NotificacionPrisma): Notificacion {
    return new Notificacion(
      notificacionPrisma.id,
      notificacionPrisma.usuarioId,
      notificacionPrisma.tipo as unknown as TipoNotificacion,
      notificacionPrisma.titulo,
      notificacionPrisma.mensaje,
      notificacionPrisma.estadoEnvio as unknown as EstadoEnvioNotificacion,
      notificacionPrisma.leida,
      notificacionPrisma.creadoEn,
    );
  }

  static tipoToPrisma(tipo: TipoNotificacion): TipoNotificacionPrisma {
    return tipo as unknown as TipoNotificacionPrisma;
  }

  static estadoEnvioToPrisma(
    estado: EstadoEnvioNotificacion,
  ): EstadoEnvioNotificacionPrisma {
    return estado as unknown as EstadoEnvioNotificacionPrisma;
  }
}
