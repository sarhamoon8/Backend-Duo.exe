import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { EntidadMedica } from '../../domain/entidad-medica.entity';
import {
  EntidadMedicaRepository,
  NuevaEntidadMedica,
} from '../../domain/entidad-medica.repository';
import { EntidadMedicaMapper } from './entidad-medica.mapper';

@Injectable()
export class PrismaEntidadMedicaRepository implements EntidadMedicaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(entidad: NuevaEntidadMedica): Promise<EntidadMedica> {
    const creada = await this.prisma.entidadMedica.create({
      data: { nombre: entidad.nombre },
    });
    return EntidadMedicaMapper.toDomain(creada);
  }

  async buscarPorId(id: string): Promise<EntidadMedica | null> {
    const entidad = await this.prisma.entidadMedica.findUnique({
      where: { id },
    });
    return entidad ? EntidadMedicaMapper.toDomain(entidad) : null;
  }

  async listar(): Promise<EntidadMedica[]> {
    const entidades = await this.prisma.entidadMedica.findMany();
    return entidades.map(EntidadMedicaMapper.toDomain);
  }
}
