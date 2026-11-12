import { Inject, Injectable } from '@nestjs/common';
import { Reserva } from '../../domain/reserva.entity';
import { EstadoReserva } from '../../domain/estado-reserva.enum';
import { RESERVA_REPOSITORY } from '../../domain/reserva.repository';
import type { ReservaRepository } from '../../domain/reserva.repository';
import { INVENTARIO_REPOSITORY } from '../../../inventario/domain/inventario.repository';
import type { InventarioRepository } from '../../../inventario/domain/inventario.repository';

@Injectable()
export class ListarMisReservasUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: ReservaRepository,
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
  ) {}

  async ejecutar(usuarioId: string): Promise<Reserva[]> {
    const reservas = await this.reservaRepository.listarPorUsuario(usuarioId);
    const ahora = new Date();

    // Igual que la posición de un turno, el vencimiento de una reserva no
    // depende de un cron: se resuelve en el momento en que alguien la
    // consulta. A diferencia de la posición, sí tiene un efecto que
    // persistir (liberar el stock apartado), por eso el ajuste ocurre acá
    // y no solo en el DTO de respuesta.
    return Promise.all(
      reservas.map(async (reserva) => {
        if (reserva.estado !== EstadoReserva.ACTIVA) {
          return reserva;
        }
        if (reserva.fechaExpiracion > ahora) {
          return reserva;
        }

        await this.inventarioRepository.ajustarStock(reserva.inventarioId, {
          deltaStockReservado: -reserva.cantidadReservada,
        });
        return this.reservaRepository.actualizarEstado(
          reserva.id,
          EstadoReserva.EXPIRADA,
        );
      }),
    );
  }
}
