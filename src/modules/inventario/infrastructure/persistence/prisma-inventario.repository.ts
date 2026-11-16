import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Inventario } from '../../domain/inventario.entity';
import {
  AjusteStock,
  NuevoInventario,
  InventarioRepository,
} from '../../domain/inventario.repository';
import { InventarioMapper } from './inventario.mapper';

@Injectable()
export class PrismaInventarioRepository implements InventarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(inventario: NuevoInventario): Promise<Inventario> {
    const creado = await this.prisma.inventario.create({
      data: {
        puntoId: inventario.puntoId,
        medicamentoId: inventario.medicamentoId,
        lote: inventario.lote,
        stockActual: inventario.stockActual,
        fechaVencimiento: inventario.fechaVencimiento,
      },
    });
    return InventarioMapper.toDomain(creado);
  }

  async listarPorPunto(
    puntoId: string,
    medicamentoId?: string,
  ): Promise<Inventario[]> {
    const registros = await this.prisma.inventario.findMany({
      where: medicamentoId ? { puntoId, medicamentoId } : { puntoId },
    });
    return registros.map(InventarioMapper.toDomain);
  }

  async buscarPorId(id: string): Promise<Inventario | null> {
    const registro = await this.prisma.inventario.findUnique({
      where: { id },
    });
    return registro ? InventarioMapper.toDomain(registro) : null;
  }

  async listarPorMedicamento(medicamentoId: string): Promise<Inventario[]> {
    const registros = await this.prisma.inventario.findMany({
      where: { medicamentoId },
    });
    return registros.map(InventarioMapper.toDomain);
  }

  async ajustarStock(id: string, cambios: AjusteStock): Promise<Inventario> {
    const actualizado = await this.prisma.inventario.update({
      where: { id },
      data: {
        stockActual: cambios.deltaStockActual
          ? { increment: cambios.deltaStockActual }
          : undefined,
        stockReservado: cambios.deltaStockReservado
          ? { increment: cambios.deltaStockReservado }
          : undefined,
      },
    });
    return InventarioMapper.toDomain(actualizado);
  }
}
