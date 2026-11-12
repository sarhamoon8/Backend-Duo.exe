import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reserva } from '../../domain/reserva.entity';
import { RESERVA_REPOSITORY } from '../../domain/reserva.repository';
import type { ReservaRepository } from '../../domain/reserva.repository';
import { VENTANA_RESERVA_HORAS } from '../../domain/ventana-reserva.const';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { MEDICAMENTO_REPOSITORY } from '../../../medicamentos/domain/medicamento.repository';
import type { MedicamentoRepository } from '../../../medicamentos/domain/medicamento.repository';
import { INVENTARIO_REPOSITORY } from '../../../inventario/domain/inventario.repository';
import type { InventarioRepository } from '../../../inventario/domain/inventario.repository';
import { CrearReservaDto } from '../dto/crear-reserva.dto';

const HORA_EN_MS = 60 * 60 * 1000;

@Injectable()
export class CrearReservaUseCase {
  constructor(
    @Inject(RESERVA_REPOSITORY)
    private readonly reservaRepository: ReservaRepository,
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
    @Inject(MEDICAMENTO_REPOSITORY)
    private readonly medicamentoRepository: MedicamentoRepository,
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
  ) {}

  async ejecutar(dto: CrearReservaDto, usuarioId: string): Promise<Reserva> {
    const punto = await this.puntoDispensacionRepository.buscarPorId(
      dto.puntoId,
    );
    if (!punto) {
      throw new NotFoundException('Punto de dispensación no encontrado');
    }

    const medicamento = await this.medicamentoRepository.buscarPorId(
      dto.medicamentoId,
    );
    if (!medicamento) {
      throw new NotFoundException('Medicamento no encontrado');
    }

    const lotes = await this.inventarioRepository.listarPorPunto(
      dto.puntoId,
      dto.medicamentoId,
    );

    // FEFO (first-expire, first-out): se aparta primero el lote más
    // próximo a vencer, entre los que tengan suficiente disponible.
    const lote = lotes
      .filter((l) => l.stockActual - l.stockReservado >= dto.cantidad)
      .sort(
        (a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime(),
      )[0];

    if (!lote) {
      throw new BadRequestException(
        'No hay suficiente stock disponible de este medicamento en este punto',
      );
    }

    await this.inventarioRepository.ajustarStock(lote.id, {
      deltaStockReservado: dto.cantidad,
    });

    const fechaExpiracion = new Date(
      Date.now() + VENTANA_RESERVA_HORAS * HORA_EN_MS,
    );

    return this.reservaRepository.crear({
      usuarioId,
      puntoId: dto.puntoId,
      medicamentoId: dto.medicamentoId,
      inventarioId: lote.id,
      cantidadReservada: dto.cantidad,
      fechaExpiracion,
    });
  }
}
