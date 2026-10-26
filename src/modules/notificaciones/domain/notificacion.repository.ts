import { Notificacion } from './notificacion.entity';
import { TipoNotificacion } from './tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from './estado-envio-notificacion.enum';

export interface NuevaNotificacion {
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  estadoEnvio: EstadoEnvioNotificacion;
}

export interface NotificacionRepository {
  crear(notificacion: NuevaNotificacion): Promise<Notificacion>;
  buscarPorId(id: string): Promise<Notificacion | null>;
  // Más reciente primero, igual que ListaEspera.listarPorUsuario.
  listarPorUsuario(usuarioId: string): Promise<Notificacion[]>;
  marcarLeida(id: string): Promise<Notificacion>;
}

export const NOTIFICACION_REPOSITORY = Symbol('NOTIFICACION_REPOSITORY');
