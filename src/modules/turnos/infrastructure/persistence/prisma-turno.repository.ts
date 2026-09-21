import { Injectable } from '@nestjs/common';
import { EstadoTurno as PrismaEstadoTurno } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { Turno } from '../../domain/turno.entity';
import { NuevoTurno, TurnoRepository } from '../../domain/turno.repository';
import { TurnoMapper } from './turno.mapper';

@Injectable()
export class PrismaTurnoRepository implements TurnoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(turno: NuevoTurno): Promise<Turno> {
    const creado = await this.prisma.turno.create({
      data: {
        usuarioId: turno.usuarioId,
        servicioId: turno.servicioId,
      },
    });
    return TurnoMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<Turno | null> {
    const turno = await this.prisma.turno.findUnique({ where: { id } });
    return turno ? TurnoMapper.toDomain(turno) : null;
  }

  async listarPorServicio(servicioId: string): Promise<Turno[]> {
    const turnos = await this.prisma.turno.findMany({
      where: { servicioId },
      orderBy: { creadoEn: 'asc' },
    });
    return turnos.map(TurnoMapper.toDomain);
  }

  async actualizarEstado(id: string, estado: EstadoTurno): Promise<Turno> {
    const actualizado = await this.prisma.turno.update({
      where: { id },
      data: { estado: estado as unknown as PrismaEstadoTurno },
    });
    return TurnoMapper.toDomain(actualizado);
  }

  contarPendientesAntes(servicioId: string, creadoEn: Date): Promise<number> {
    return this.prisma.turno.count({
      where: {
        servicioId,
        estado: EstadoTurno.PENDIENTE as unknown as PrismaEstadoTurno,
        creadoEn: { lt: creadoEn },
      },
    });
  }
}
