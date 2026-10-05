import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { ListaEspera } from '../../domain/lista-espera.entity';
import {
  NuevaListaEspera,
  ListaEsperaRepository,
} from '../../domain/lista-espera.repository';
import { ListaEsperaMapper } from './lista-espera.mapper';

@Injectable()
export class PrismaListaEsperaRepository implements ListaEsperaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(entrada: NuevaListaEspera): Promise<ListaEspera> {
    const creada = await this.prisma.listaEspera.create({
      data: {
        usuarioId: entrada.usuarioId,
        servicioId: entrada.servicioId,
        puntoId: entrada.puntoId,
      },
    });
    return ListaEsperaMapper.toDomain(creada);
  }

  async buscarPorId(id: string): Promise<ListaEspera | null> {
    const entrada = await this.prisma.listaEspera.findUnique({
      where: { id },
    });
    return entrada ? ListaEsperaMapper.toDomain(entrada) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<ListaEspera[]> {
    const entradas = await this.prisma.listaEspera.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
    });
    return entradas.map(ListaEsperaMapper.toDomain);
  }

  async listarPorServicioYPunto(
    servicioId: string,
    puntoId: string,
  ): Promise<ListaEspera[]> {
    const entradas = await this.prisma.listaEspera.findMany({
      where: { servicioId, puntoId },
      orderBy: { creadoEn: 'asc' },
    });
    return entradas.map(ListaEsperaMapper.toDomain);
  }

  async obtenerPrimero(
    servicioId: string,
    puntoId: string,
  ): Promise<ListaEspera | null> {
    const entrada = await this.prisma.listaEspera.findFirst({
      where: { servicioId, puntoId },
      orderBy: { creadoEn: 'asc' },
    });
    return entrada ? ListaEsperaMapper.toDomain(entrada) : null;
  }

  contarAntes(
    servicioId: string,
    puntoId: string,
    creadoEn: Date,
  ): Promise<number> {
    return this.prisma.listaEspera.count({
      where: { servicioId, puntoId, creadoEn: { lt: creadoEn } },
    });
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.listaEspera.delete({ where: { id } });
  }
}
