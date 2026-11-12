export class Recordatorio {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly medicamentoId: string,
    public readonly mensaje: string,
    public readonly horaRecordatorio: string,
    public readonly activo: boolean,
    public readonly creadoEn: Date,
  ) {}
}
