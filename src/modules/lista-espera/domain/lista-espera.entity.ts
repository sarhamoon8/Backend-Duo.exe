export class ListaEspera {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly servicioId: string,
    public readonly puntoId: string,
    public readonly creadoEn: Date,
  ) {}
}
