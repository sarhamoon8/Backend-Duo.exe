import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Notificacion } from '../../domain/notificacion.entity';
import {
  NotificacionRepository,
  NuevaNotificacion,
} from '../../domain/notificacion.repository';
import { NotificacionMapper } from './notificacion.mapper';

@Injectable()
export class PrismaNotificacionRepository implements NotificacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(notificacion: NuevaNotificacion): Promise<Notificacion> {
    const creada = await this.prisma.notificacion.create({
      data: {
        usuarioId: notificacion.usuarioId,
        tipo: NotificacionMapper.tipoToPrisma(notificacion.tipo),
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        estadoEnvio: NotificacionMapper.estadoEnvioToPrisma(
          notificacion.estadoEnvio,
        ),
      },
    });
    return NotificacionMapper.toDomain(creada);
  }

  async buscarPorId(id: string): Promise<Notificacion | null> {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
    });
    return notificacion ? NotificacionMapper.toDomain(notificacion) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<Notificacion[]> {
    const notificaciones = await this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
    });
    return notificaciones.map(NotificacionMapper.toDomain);
  }

  async marcarLeida(id: string): Promise<Notificacion> {
    const actualizada = await this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
    return NotificacionMapper.toDomain(actualizada);
  }
}
