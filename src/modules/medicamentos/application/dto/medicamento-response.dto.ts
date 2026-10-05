import { Medicamento } from '../../domain/medicamento.entity';

export class MedicamentoResponseDto {
  id: string;
  codigoNacional: string;
  nombreGenerico: string;
  concentracion: string;
  presentacion: string;
  laboratorioFabricante: string;
  requiereAutorizacion: boolean;

  static fromEntity(medicamento: Medicamento): MedicamentoResponseDto {
    const dto = new MedicamentoResponseDto();
    dto.id = medicamento.id;
    dto.codigoNacional = medicamento.codigoNacional;
    dto.nombreGenerico = medicamento.nombreGenerico;
    dto.concentracion = medicamento.concentracion;
    dto.presentacion = medicamento.presentacion;
    dto.laboratorioFabricante = medicamento.laboratorioFabricante;
    dto.requiereAutorizacion = medicamento.requiereAutorizacion;
    return dto;
  }
}
