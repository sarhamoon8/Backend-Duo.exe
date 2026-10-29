import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { LogPeticion } from '../../domain/log-peticion.entity';
import {
  LogPeticionRepository,
  NuevoLogPeticion,
} from '../../domain/log-peticion.repository';
import { LogPeticionMapper } from './log-peticion.mapper';

@Injectable()
export class PrismaLogPeticionRepository implements LogPeticionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(log: NuevoLogPeticion): Promise<LogPeticion> {
    const creado = await this.prisma.logPeticion.create({
      data: {
        metodo: log.metodo,
        ruta: log.ruta,
        codigoEstado: log.codigoEstado,
        duracionMs: log.duracionMs,
        usuarioId: log.usuarioId,
        ip: log.ip,
        mensaje: log.mensaje,
      },
    });
    return LogPeticionMapper.toDomain(creado);
  }

  async listarRecientes(limite: number): Promise<LogPeticion[]> {
    const logs = await this.prisma.logPeticion.findMany({
      orderBy: { creadoEn: 'desc' },
      take: limite,
    });
    return logs.map(LogPeticionMapper.toDomain);
  }
}
