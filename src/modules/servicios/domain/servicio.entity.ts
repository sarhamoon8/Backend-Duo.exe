export class Servicio {
  constructor(
    public readonly id: string,
    public readonly codigoServicio: string,
    public readonly nombre: string,
    public readonly tiempoPromedioMin: number,
    public readonly activo: boolean,
    public readonly entidadId: string,
  ) {}
}
