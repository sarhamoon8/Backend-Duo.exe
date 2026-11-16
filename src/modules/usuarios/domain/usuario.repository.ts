import { Usuario } from './usuario.entity';

export interface NuevoUsuario {
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string | null;
  rol: Usuario['rol'];
  terminosAceptadosEn?: Date | null;
}

export interface UsuarioRepository {
  crear(usuario: NuevoUsuario): Promise<Usuario>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorNumeroDocumento(numeroDocumento: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
  // Recibe la contraseña ya hasheada (recuperación de contraseña).
  actualizarPassword(id: string, passwordHasheado: string): Promise<void>;
}

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');
