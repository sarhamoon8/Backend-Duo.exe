export class Medicamento {
  constructor(
    public readonly id: string,
    public readonly codigoNacional: string,
    public readonly nombreGenerico: string,
    public readonly concentracion: string,
    public readonly presentacion: string,
    public readonly laboratorioFabricante: string,
    public readonly requiereAutorizacion: boolean,
  ) {}
}
