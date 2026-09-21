import { EstadoOperativoVentanilla } from './estado-operativo-ventanilla.enum';

export class Ventanilla {
  constructor(
    public readonly id: string,
    public readonly puntoId: string,
    public readonly numeroModulo: string,
    public readonly estadoOperativo: EstadoOperativoVentanilla,
  ) {}
}
