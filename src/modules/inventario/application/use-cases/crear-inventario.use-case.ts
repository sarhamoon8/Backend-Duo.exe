import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Inventario } from '../../domain/inventario.entity';
import { INVENTARIO_REPOSITORY } from '../../domain/inventario.repository';
import type { InventarioRepository } from '../../domain/inventario.repository';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { MEDICAMENTO_REPOSITORY } from '../../../medicamentos/domain/medicamento.repository';
import type { MedicamentoRepository } from '../../../medicamentos/domain/medicamento.repository';
import { CrearInventarioDto } from '../dto/crear-inventario.dto';

@Injectable()
export class CrearInventarioUseCase {
  constructor(
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
    @Inject(MEDICAMENTO_REPOSITORY)
    private readonly medicamentoRepository: MedicamentoRepository,
  ) {}

  async ejecutar(dto: CrearInventarioDto): Promise<Inventario> {
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

    return this.inventarioRepository.crear({
      puntoId: dto.puntoId,
      medicamentoId: dto.medicamentoId,
      lote: dto.lote,
      stockActual: dto.stockActual,
      fechaVencimiento: new Date(dto.fechaVencimiento),
    });
  }
}
