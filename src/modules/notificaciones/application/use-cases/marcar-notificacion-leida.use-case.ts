import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Notificacion } from '../../domain/notificacion.entity';
import { NOTIFICACION_REPOSITORY } from '../../domain/notificacion.repository';
import type { NotificacionRepository } from '../../domain/notificacion.repository';

@Injectable()
export class MarcarNotificacionLeidaUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: NotificacionRepository,
  ) {}

  async ejecutar(id: string, usuarioId: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.buscarPorId(id);
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    if (notificacion.usuarioId !== usuarioId) {
      throw new ForbiddenException(
        'No puedes marcar como leída la notificación de otro usuario',
      );
    }
    return this.notificacionRepository.marcarLeida(id);
  }
}
