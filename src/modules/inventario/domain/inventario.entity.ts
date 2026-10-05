export class Inventario {
  constructor(
    public readonly id: string,
    public readonly puntoId: string,
    public readonly medicamentoId: string,
    public readonly lote: string,
    public readonly stockActual: number,
    public readonly stockReservado: number,
    public readonly fechaVencimiento: Date,
  ) {}
}
