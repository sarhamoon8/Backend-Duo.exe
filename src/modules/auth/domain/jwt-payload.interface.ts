import { Rol } from '../../usuarios/domain/rol.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: Rol;
}
