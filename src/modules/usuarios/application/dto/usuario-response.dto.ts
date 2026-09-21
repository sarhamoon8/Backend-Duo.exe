import { Usuario } from '../../domain/usuario.entity';

export class UsuarioResponseDto {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  creadoEn: Date;

  static fromEntity(usuario: Usuario): UsuarioResponseDto {
    const dto = new UsuarioResponseDto();
    dto.id = usuario.id;
    dto.nombre = usuario.nombre;
    dto.email = usuario.email;
    dto.rol = usuario.rol;
    dto.creadoEn = usuario.creadoEn;
    return dto;
  }
}
