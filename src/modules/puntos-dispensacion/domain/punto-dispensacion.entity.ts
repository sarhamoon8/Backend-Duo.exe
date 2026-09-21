export class PuntoDispensacion {
  constructor(
    public readonly id: string,
    public readonly entidadId: string,
    public readonly nombreSede: string,
    public readonly direccion: string,
    public readonly ciudad: string,
    public readonly telefonoContacto: string | null,
    public readonly capacidadAtencion: number,
  ) {}
}
