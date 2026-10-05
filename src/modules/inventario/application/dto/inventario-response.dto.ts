import { Inventario } from '../../domain/inventario.entity';

export class InventarioResponseDto {
  id: string;
  puntoId: string;
  medicamentoId: string;
  lote: string;
  stockActual: number;
  stockReservado: number;
  // Calculado, no persistido (igual que la posición de un turno): evita que
  // el cliente tenga que restar a mano para saber si hay existencias.
  cantidadDisponible: number;
  disponible: boolean;
  fechaVencimiento: Date;

  static fromEntity(inventario: Inventario): InventarioResponseDto {
    const dto = new InventarioResponseDto();
    dto.id = inventario.id;
    dto.puntoId = inventario.puntoId;
    dto.medicamentoId = inventario.medicamentoId;
    dto.lote = inventario.lote;
    dto.stockActual = inventario.stockActual;
    dto.stockReservado = inventario.stockReservado;
    dto.cantidadDisponible = inventario.stockActual - inventario.stockReservado;
    dto.disponible = dto.cantidadDisponible > 0;
    dto.fechaVencimiento = inventario.fechaVencimiento;
    return dto;
  }
}
