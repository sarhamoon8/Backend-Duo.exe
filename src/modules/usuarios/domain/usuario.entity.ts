import { Rol } from './rol.enum';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly numeroDocumento: string,
    public readonly tipoDocumento: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly email: string,
    public readonly password: string,
    public readonly telefono: string | null,
    public readonly rol: Rol,
    public readonly creadoEn: Date,
  ) {}
}
