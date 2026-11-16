import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Recordatorio } from '../../domain/recordatorio.entity';
import {
  NuevoRecordatorio,
  RecordatorioRepository,
} from '../../domain/recordatorio.repository';
import { RecordatorioMapper } from './recordatorio.mapper';

@Injectable()
export class PrismaRecordatorioRepository implements RecordatorioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(recordatorio: NuevoRecordatorio): Promise<Recordatorio> {
    const creado = await this.prisma.recordatorio.create({
      data: {
        usuarioId: recordatorio.usuarioId,
        medicamentoId: recordatorio.medicamentoId,
        mensaje: recordatorio.mensaje,
        horaRecordatorio: recordatorio.horaRecordatorio,
      },
    });
    return RecordatorioMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<Recordatorio | null> {
    const recordatorio = await this.prisma.recordatorio.findUnique({
      where: { id },
    });
    return recordatorio ? RecordatorioMapper.toDomain(recordatorio) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<Recordatorio[]> {
    const recordatorios = await this.prisma.recordatorio.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
    });
    return recordatorios.map(RecordatorioMapper.toDomain);
  }

  async actualizarActivo(id: string, activo: boolean): Promise<Recordatorio> {
    const actualizado = await this.prisma.recordatorio.update({
      where: { id },
      data: { activo },
    });
    return RecordatorioMapper.toDomain(actualizado);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.recordatorio.delete({ where: { id } });
  }
}
