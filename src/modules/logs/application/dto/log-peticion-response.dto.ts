import { LogPeticion } from '../../domain/log-peticion.entity';

export class LogPeticionResponseDto {
  id: string;
  metodo: string;
  ruta: string;
  codigoEstado: number;
  duracionMs: number;
  usuarioId: string | null;
  ip: string | null;
  mensaje: string | null;
  creadoEn: Date;

  static fromEntity(log: LogPeticion): LogPeticionResponseDto {
    const dto = new LogPeticionResponseDto();
    dto.id = log.id;
    dto.metodo = log.metodo;
    dto.ruta = log.ruta;
    dto.codigoEstado = log.codigoEstado;
    dto.duracionMs = log.duracionMs;
    dto.usuarioId = log.usuarioId;
    dto.ip = log.ip;
    dto.mensaje = log.mensaje;
    dto.creadoEn = log.creadoEn;
    return dto;
  }
}
