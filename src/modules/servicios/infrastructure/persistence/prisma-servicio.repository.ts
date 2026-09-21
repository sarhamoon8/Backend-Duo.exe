import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Servicio } from '../../domain/servicio.entity';
import {
  NuevoServicio,
  ServicioRepository,
} from '../../domain/servicio.repository';
import { ServicioMapper } from './servicio.mapper';

@Injectable()
export class PrismaServicioRepository implements ServicioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(servicio: NuevoServicio): Promise<Servicio> {
    const creado = await this.prisma.servicio.create({
      data: { nombre: servicio.nombre, entidadId: servicio.entidadId },
    });
    return ServicioMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<Servicio | null> {
    const servicio = await this.prisma.servicio.findUnique({ where: { id } });
    return servicio ? ServicioMapper.toDomain(servicio) : null;
  }

  async listarPorEntidad(entidadId: string): Promise<Servicio[]> {
    const servicios = await this.prisma.servicio.findMany({
      where: { entidadId },
    });
    return servicios.map(ServicioMapper.toDomain);
  }

  async listar(): Promise<Servicio[]> {
    const servicios = await this.prisma.servicio.findMany();
    return servicios.map(ServicioMapper.toDomain);
  }
}
