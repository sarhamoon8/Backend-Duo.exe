import {
  BadRequestException,
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

// Entrega física del medicamento reservado al paciente, registrada por el
// personal del punto de dispensación. El acceso por rol ya lo filtra el
// controller (@Roles FUNCIONARIO/ADMIN), no se repite acá.
@Injectable()
export class ReclamarReservaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: ReservaRepository,
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
  ) {}

  async ejecutar(id: string): Promise<Reserva> {
    const reserva = await this.reservaRepository.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.estado !== EstadoReserva.ACTIVA) {
      throw new BadRequestException(
        `La reserva en estado ${reserva.estado} no puede reclamarse`,
      );
    }

    if (reserva.fechaExpiracion <= new Date()) {
      await this.inventarioRepository.ajustarStock(reserva.inventarioId, {
        deltaStockReservado: -reserva.cantidadReservada,
      });
      await this.reservaRepository.actualizarEstado(
        id,
        EstadoReserva.EXPIRADA,
      );
      throw new BadRequestException(
        'La reserva ya expiró, el stock fue liberado',
      );
    }

    await this.inventarioRepository.ajustarStock(reserva.inventarioId, {
      deltaStockActual: -reserva.cantidadReservada,
      deltaStockReservado: -reserva.cantidadReservada,
    });

    return this.reservaRepository.actualizarEstado(
      id,
      EstadoReserva.RECLAMADA,
    );
  }
}
