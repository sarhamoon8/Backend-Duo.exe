import { TipoNotificacion } from './tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from './estado-envio-notificacion.enum';

export class Notificacion {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly tipo: TipoNotificacion,
    public readonly titulo: string,
    public readonly mensaje: string,
    public readonly estadoEnvio: EstadoEnvioNotificacion,
    public readonly leida: boolean,
    public readonly creadoEn: Date,
  ) {}
}
