import { Inject, Injectable } from '@nestjs/common';
import { Inventario } from '../../domain/inventario.entity';
import { INVENTARIO_REPOSITORY } from '../../domain/inventario.repository';
import type { InventarioRepository } from '../../domain/inventario.repository';

@Injectable()
export class ListarInventarioPorPuntoUseCase {
  constructor(
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
  ) {}

  ejecutar(puntoId: string, medicamentoId?: string): Promise<Inventario[]> {
    return this.inventarioRepository.listarPorPunto(puntoId, medicamentoId);
  }
}
