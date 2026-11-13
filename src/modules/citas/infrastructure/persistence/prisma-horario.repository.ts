import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { HorarioProfesional } from '../../domain/horario-profesional.entity';
import { HorarioRepository } from '../../domain/horario.repository';

@Injectable()
export class PrismaHorarioRepository implements HorarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorProfesionales(
    profesionalIds: string[],
  ): Promise<HorarioProfesional[]> {
    const horarios = await this.prisma.horarioProfesional.findMany({
      where: { profesionalId: { in: profesionalIds } },
    });
    return horarios.map(
      (h) =>
        new HorarioProfesional(
          h.profesionalId,
          h.diaSemana,
          h.horaInicio,
          h.horaFin,
          h.duracionMin,
        ),
    );
  }
}
