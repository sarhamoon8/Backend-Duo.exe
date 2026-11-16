import { Inventario } from './inventario.entity';

export interface NuevoInventario {
  puntoId: string;
  medicamentoId: string;
  lote: string;
  stockActual: number;
  fechaVencimiento: Date;
}

export interface AjusteStock {
  deltaStockActual?: number;
  deltaStockReservado?: number;
}

export interface InventarioRepository {
  crear(inventario: NuevoInventario): Promise<Inventario>;
  /** medicamentoId es opcional: sin él trae todo el inventario del punto. */
  listarPorPunto(
    puntoId: string,
    medicamentoId?: string,
  ): Promise<Inventario[]>;
  buscarPorId(id: string): Promise<Inventario | null>;
  /** Todos los lotes de un medicamento, en cualquier punto. Usado por las
   * alertas de vencimiento de fórmulas (RF-08). */
  listarPorMedicamento(medicamentoId: string): Promise<Inventario[]>;
  /**
   * Usado por RF-07 (reservas): apartar/liberar/descontar stock de un lote
   * concreto. Los deltas pueden ser negativos (liberar una reserva) o
   * positivos (apartar stock al reservar).
   */
  ajustarStock(id: string, cambios: AjusteStock): Promise<Inventario>;
}

export const INVENTARIO_REPOSITORY = Symbol('INVENTARIO_REPOSITORY');
