import { Rol } from './rol.enum';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly password: string,
    public readonly rol: Rol,
    public readonly creadoEn: Date,
  ) {}
}
