export class PerfilSalud {
  constructor(
    public readonly id: string,
    public readonly usuarioId: string,
    public readonly grupoSanguineo: string | null,
    public readonly alergias: string | null,
    public readonly condicionesCronicas: string | null,
    public readonly contactoEmergenciaNombre: string | null,
    public readonly contactoEmergenciaTelefono: string | null,
    public readonly actualizadoEn: Date,
  ) {}
}
