import { Medicamento } from './medicamento.entity';

export interface NuevoMedicamento {
  codigoNacional: string;
  nombreGenerico: string;
  concentracion: string;
  presentacion: string;
  laboratorioFabricante: string;
  requiereAutorizacion?: boolean;
}

export interface MedicamentoRepository {
  crear(medicamento: NuevoMedicamento): Promise<Medicamento>;
  buscarPorId(id: string): Promise<Medicamento | null>;
  buscarPorCodigoNacional(codigoNacional: string): Promise<Medicamento | null>;
  listar(): Promise<Medicamento[]>;
}

export const MEDICAMENTO_REPOSITORY = Symbol('MEDICAMENTO_REPOSITORY');
