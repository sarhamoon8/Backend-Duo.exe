export class LogPeticion {
  constructor(
    public readonly id: string,
    public readonly metodo: string,
    public readonly ruta: string,
    public readonly codigoEstado: number,
    public readonly duracionMs: number,
    public readonly usuarioId: string | null,
    public readonly ip: string | null,
    public readonly mensaje: string | null,
    public readonly creadoEn: Date,
  ) {}
}
