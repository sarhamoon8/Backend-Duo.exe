import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reserva } from '../../domain/reserva.entity';
import { EstadoReserva } from '../../domain/estado-reserva.enum';
import { RESERVA_REPOSITORY } from '../../domain/reserva.repository';
import type { ReservaRepository } from '../../domain/reserva.repository';
import { INVENTARIO_REPOSITORY } from '../../../inventario/domain/inventario.repository';
import type { InventarioRepository } from '../../../inventario/domain/inventario.repository';

@Injectable()
export class CancelarReservaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: ReservaRepository,
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
  ) {}

  async ejecutar(id: string, usuarioId: string): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.usuarioId !== usuarioId) {
      throw new ForbiddenException('No puedes cancelar la reserva de otro usuario');
    }

    if (reserva.estado !== EstadoReserva.ACTIVA) {
      throw new BadRequestException(
        `La reserva en estado ${reserva.estado} no puede cancelarse`,
      );
    }

    await this.inventarioRepository.ajustarStock(reserva.inventarioId, {
      deltaStockReservado: -reserva.cantidadReservada,
    });

    return this.reservaRepository.actualizarEstado(
      id,
      EstadoReserva.CANCELADA,
    );
  }
}
