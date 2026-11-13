import { Injectable } from '@nestjs/common';
import { Prisma, Cita as CitaPrisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Cita } from '../../domain/cita.entity';
import { EstadoCita } from '../../domain/estado-cita.enum';
import {
  CitaRepository,
  NuevaCita,
  OcupacionCita,
} from '../../domain/cita.repository';

function aDominio(cita: CitaPrisma): Cita {
  return new Cita(
    cita.id,
    cita.pacienteId,
    cita.profesionalId,
    cita.puntoId,
    cita.especialidad,
    cita.fechaHora,
    cita.estado as EstadoCita,
    cita.creadoEn,
  );
}

@Injectable()
export class PrismaCitaRepository implements CitaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(cita: NuevaCita): Promise<Cita | null> {
    try {
      const creada = await this.prisma.cita.create({
        data: {
          pacienteId: cita.pacienteId,
          profesionalId: cita.profesionalId,
          puntoId: cita.puntoId,
          especialidad: cita.especialidad,
          fechaHora: cita.fechaHora,
        },
      });
      return aDominio(creada);
    } catch (error) {
      // P2002: el índice único parcial (profesional + hora, sin canceladas)
      // detectó que otro paciente tomó esa hora un instante antes.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return null;
      }
      throw error;
    }
  }

  async buscarPorId(id: string): Promise<Cita | null> {
    const cita = await this.prisma.cita.findUnique({ where: { id } });
    return cita ? aDominio(cita) : null;
  }

  async listarPorPaciente(pacienteId: string): Promise<Cita[]> {
    const citas = await this.prisma.cita.findMany({
      where: { pacienteId },
      orderBy: { fechaHora: 'desc' },
    });
    return citas.map(aDominio);
  }

  async ocupadasEntre(
    profesionalIds: string[],
    desde: Date,
    hasta: Date,
  ): Promise<OcupacionCita[]> {
    const citas = await this.prisma.cita.findMany({
      where: {
        profesionalId: { in: profesionalIds },
        estado: { not: 'CANCELADA' },
        fechaHora: { gte: desde, lt: hasta },
      },
      select: { profesionalId: true, fechaHora: true },
    });
    return citas;
  }

  async pacienteTieneCitaEn(
    pacienteId: string,
    fechaHora: Date,
  ): Promise<boolean> {
    const cantidad = await this.prisma.cita.count({
      where: { pacienteId, fechaHora, estado: { not: 'CANCELADA' } },
    });
    return cantidad > 0;
  }

  async cancelar(id: string): Promise<Cita> {
    const cita = await this.prisma.cita.update({
      where: { id },
      data: { estado: 'CANCELADA' },
    });
    return aDominio(cita);
  }
}
