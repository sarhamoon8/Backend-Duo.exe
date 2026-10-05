import { Medicamento as MedicamentoPrisma } from '@prisma/client';
import { Medicamento } from '../../domain/medicamento.entity';

export class MedicamentoMapper {
  static toDomain(medicamentoPrisma: MedicamentoPrisma): Medicamento {
    return new Medicamento(
      medicamentoPrisma.id,
      medicamentoPrisma.codigoNacional,
      medicamentoPrisma.nombreGenerico,
      medicamentoPrisma.concentracion,
      medicamentoPrisma.presentacion,
      medicamentoPrisma.laboratorioFabricante,
      medicamentoPrisma.requiereAutorizacion,
    );
  }
}
