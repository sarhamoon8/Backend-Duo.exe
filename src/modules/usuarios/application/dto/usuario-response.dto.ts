import { Usuario } from '../../domain/usuario.entity';

export class UsuarioResponseDto {
  id: string;
  numeroDocumento: string;
  tipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  rol: string;
  creadoEn: Date;

  static fromEntity(usuario: Usuario): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = usuario.id;
    dto.numeroDocumento = usuario.numeroDocumento;
    dto.tipoDocumento = usuario.tipoDocumento;
    dto.nombres = usuario.nombres;
    dto.apellidos = usuario.apellidos;
    dto.email = usuario.email;
    dto.telefono = usuario.telefono;
    dto.rol = usuario.rol;
    dto.creadoEn = usuario.creadoEn;
    return dto;
  }
}
