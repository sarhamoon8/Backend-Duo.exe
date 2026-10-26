import { Inject, Injectable } from '@nestjs/common';
import { Notificacion } from '../../domain/notificacion.entity';
import { NOTIFICACION_REPOSITORY } from '../../domain/notificacion.repository';
import type { NotificacionRepository } from '../../domain/notificacion.repository';

@Injectable()
export class ListarMisNotificacionesUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORY)
    private readonly notificacionRepository: NotificacionRepository,
  ) {}

  ejecutar(usuarioId: string): Promise<Notificacion[]> {
    return this.notificacionRepository.listarPorUsuario(usuarioId);
  }
}
