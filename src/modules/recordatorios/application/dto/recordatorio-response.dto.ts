import { Recordatorio } from '../../domain/recordatorio.entity';

export class RecordatorioResponseDto {
  id: string;
  usuarioId: string;
  medicamentoId: string;
  mensaje: string;
  horaRecordatorio: string;
  activo: boolean;
  creadoEn: Date;

  static fromEntity(recordatorio: Recordatorio): RecordatorioResponseDto {
    const dto = new RecordatorioResponseDto();
    dto.id = recordatorio.id;
    dto.usuarioId = recordatorio.usuarioId;
    dto.medicamentoId = recordatorio.medicamentoId;
    dto.mensaje = recordatorio.mensaje;
    dto.horaRecordatorio = recordatorio.horaRecordatorio;
    dto.activo = recordatorio.activo;
    dto.creadoEn = recordatorio.creadoEn;
    return dto;
  }

  static fromEntities(recordatorios: Recordatorio[]): RecordatorioResponseDto[] {
    return recordatorios.map(RecordatorioResponseDto.fromEntity);
  }
}
