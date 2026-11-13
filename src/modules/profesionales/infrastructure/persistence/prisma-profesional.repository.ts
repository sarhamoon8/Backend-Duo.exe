import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Profesional } from '../../domain/profesional.entity';
import {
  FiltroProfesionales,
  NuevoProfesional,
  ProfesionalRepository,
} from '../../domain/profesional.repository';
import { ProfesionalMapper } from './profesional.mapper';

@Injectable()
export class PrismaProfesionalRepository implements ProfesionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(profesional: NuevoProfesional): Promise<Profesional> {
    const creado = await this.prisma.profesional.create({
      data: {
        registroMedico: profesional.registroMedico,
        nombres: profesional.nombres,
        apellidos: profesional.apellidos,
        especialidad: profesional.especialidad,
        puntoId: profesional.puntoId,
      },
    });
    return ProfesionalMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<Profesional | null> {
    const profesional = await this.prisma.profesional.findUnique({
      where: { id },
    });
    return profesional ? ProfesionalMapper.toDomain(profesional) : null;
  }

  async buscarPorRegistroMedico(
    registroMedico: string,
  ): Promise<Profesional | null> {
    const profesional = await this.prisma.profesional.findUnique({
      where: { registroMedico },
    });
    return profesional ? ProfesionalMapper.toDomain(profesional) : null;
  }

  async listar(filtro: FiltroProfesionales = {}): Promise<Profesional[]> {
    const profesionales = await this.prisma.profesional.findMany({
      where: {
        activo: true,
        puntoId: filtro.puntoId,
        especialidad: filtro.especialidad
          ? { equals: filtro.especialidad, mode: 'insensitive' }
          : undefined,
      },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
    });
    return profesionales.map(ProfesionalMapper.toDomain);
  }
}
