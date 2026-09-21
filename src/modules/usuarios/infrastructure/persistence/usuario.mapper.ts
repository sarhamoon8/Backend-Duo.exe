import { Usuario as UsuarioPrisma } from '@prisma/client';
import { Usuario } from '../../domain/usuario.entity';
import { Rol } from '../../domain/rol.enum';

export class UsuarioMapper {
  // El enum de dominio y el generado por Prisma comparten valores pero son
  // tipos nominales distintos: se traduce explícitamente en el borde de infra.
  static toDomain(usuarioPrisma: UsuarioPrisma): Usuario {
    return new Usuario(
      usuarioPrisma.id,
      usuarioPrisma.numeroDocumento,
      usuarioPrisma.tipoDocumento,
      usuarioPrisma.nombres,
      usuarioPrisma.apellidos,
      usuarioPrisma.email,
      usuarioPrisma.password,
      usuarioPrisma.telefono,
      usuarioPrisma.rol as unknown as Rol,
      usuarioPrisma.creadoEn,
    );
  }
}
