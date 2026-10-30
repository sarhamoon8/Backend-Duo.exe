export class Profesional {
  constructor(
    public readonly id: string,
    public readonly registroMedico: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly especialidad: string,
    public readonly activo: boolean,
    public readonly puntoId: string,
  ) {}
}
