import { Inventario } from './inventario.entity';

export interface NuevoInventario {
  puntoId: string;
  medicamentoId: string;
  lote: string;
  stockActual: number;
  fechaVencimiento: Date;
}

export interface InventarioRepository {
  crear(inventario: NuevoInventario): Promise<Inventario>;
  /** medicamentoId es opcional: sin él trae todo el inventario del punto. */
  listarPorPunto(
    puntoId: string,
    medicamentoId?: string,
  ): Promise<Inventario[]>;
}

export const INVENTARIO_REPOSITORY = Symbol('INVENTARIO_REPOSITORY');
