import { Usuario } from './usuario.entity';

export interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: Usuario['rol'];
}

export interface UsuarioRepository {
  crear(usuario: NuevoUsuario): Promise<Usuario>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
}

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');
