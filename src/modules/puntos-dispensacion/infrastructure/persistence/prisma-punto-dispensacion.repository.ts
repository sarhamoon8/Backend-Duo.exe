import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';
import {
  NuevoPuntoDispensacion,
  PuntoDispensacionRepository,
} from '../../domain/punto-dispensacion.repository';
import { PuntoDispensacionMapper } from './punto-dispensacion.mapper';

@Injectable()
export class PrismaPuntoDispensacionRepository
  implements PuntoDispensacionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async crear(punto: NuevoPuntoDispensacion): Promise<PuntoDispensacion> {
    const creado = await this.prisma.puntoDispensacion.create({
      data: {
        entidadId: punto.entidadId,
        nombreSede: punto.nombreSede,
        direccion: punto.direccion,
        ciudad: punto.ciudad,
        telefonoContacto: punto.telefonoContacto,
        capacidadAtencion: punto.capacidadAtencion,
      },
    });
    return PuntoDispensacionMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<PuntoDispensacion | null> {
    const punto = await this.prisma.puntoDispensacion.findUnique({
      where: { id },
    });
    return punto ? PuntoDispensacionMapper.toDomain(punto) : null;
  }

  async listarPorEntidad(entidadId: string): Promise<PuntoDispensacion[]> {
    const puntos = await this.prisma.puntoDispensacion.findMany({
      where: { entidadId },
    });
    return puntos.map(PuntoDispensacionMapper.toDomain);
  }

  async listar(): Promise<PuntoDispensacion[]> {
    const puntos = await this.prisma.puntoDispensacion.findMany();
    return puntos.map(PuntoDispensacionMapper.toDomain);
  }
}
