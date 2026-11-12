import { Recordatorio as RecordatorioPrisma } from '@prisma/client';
import { Recordatorio } from '../../domain/recordatorio.entity';

export class RecordatorioMapper {
  static toDomain(recordatorioPrisma: RecordatorioPrisma): Recordatorio {
    return new Recordatorio(
      recordatorioPrisma.id,
      recordatorioPrisma.usuarioId,
      recordatorioPrisma.medicamentoId,
      recordatorioPrisma.mensaje,
      recordatorioPrisma.horaRecordatorio,
      recordatorioPrisma.activo,
      recordatorioPrisma.creadoEn,
    );
  }
}
