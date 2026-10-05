import { Inventario as InventarioPrisma } from '@prisma/client';
import { Inventario } from '../../domain/inventario.entity';

export class InventarioMapper {
  static toDomain(inventarioPrisma: InventarioPrisma): Inventario {
    return new Inventario(
      inventarioPrisma.id,
      inventarioPrisma.puntoId,
      inventarioPrisma.medicamentoId,
      inventarioPrisma.lote,
      inventarioPrisma.stockActual,
      inventarioPrisma.stockReservado,
      inventarioPrisma.fechaVencimiento,
    );
  }
}
