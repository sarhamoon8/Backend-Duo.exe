import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Ventanilla } from '../../domain/ventanilla.entity';
import {
  NuevaVentanilla,
  VentanillaRepository,
} from '../../domain/ventanilla.repository';
import { VentanillaMapper } from './ventanilla.mapper';

@Injectable()
export class PrismaVentanillaRepository implements VentanillaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(ventanilla: NuevaVentanilla): Promise<Ventanilla> {
    const creada = await this.prisma.ventanilla.create({
      data: {
        puntoId: ventanilla.puntoId,
        numeroModulo: ventanilla.numeroModulo,
      },
    });
    return VentanillaMapper.toDomain(creada);
  }

  async buscarPorId(id: string): Promise<Ventanilla | null> {
    const ventanilla = await this.prisma.ventanilla.findUnique({
      where: { id },
    });
    return ventanilla ? VentanillaMapper.toDomain(ventanilla) : null;
  }

  async listarPorPunto(puntoId: string): Promise<Ventanilla[]> {
    const ventanillas = await this.prisma.ventanilla.findMany({
      where: { puntoId },
    });
    return ventanillas.map(VentanillaMapper.toDomain);
  }
}
