import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Reserva } from '../../domain/reserva.entity';
import { EstadoReserva } from '../../domain/estado-reserva.enum';
import {
  NuevaReserva,
  ReservaRepository,
} from '../../domain/reserva.repository';
import { ReservaMapper } from './reserva.mapper';

@Injectable()
export class PrismaReservaRepository implements ReservaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(reserva: NuevaReserva): Promise<Reserva> {
    const creada = await this.prisma.reserva.create({
      data: {
        usuarioId: reserva.usuarioId,
        puntoId: reserva.puntoId,
        medicamentoId: reserva.medicamentoId,
        inventarioId: reserva.inventarioId,
        cantidadReservada: reserva.cantidadReservada,
        fechaExpiracion: reserva.fechaExpiracion,
      },
    });
    return ReservaMapper.toDomain(creada);
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    const reserva = await this.prisma.reserva.findUnique({ where: { id } });
    return reserva ? ReservaMapper.toDomain(reserva) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<Reserva[]> {
    const reservas = await this.prisma.reserva.findMany({
      where: { usuarioId },
      orderBy: { fechaSolicitud: 'desc' },
    });
    return reservas.map(ReservaMapper.toDomain);
  }

  async actualizarEstado(
    id: string,
    estado: EstadoReserva,
  ): Promise<Reserva> {
    const actualizada = await this.prisma.reserva.update({
      where: { id },
      data: { estado },
    });
    return ReservaMapper.toDomain(actualizada);
  }
}
