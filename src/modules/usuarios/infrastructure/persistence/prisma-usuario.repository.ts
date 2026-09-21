import { Injectable } from '@nestjs/common';
import { Rol as PrismaRol } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Usuario } from '../../domain/usuario.entity';
import {
  NuevoUsuario,
  UsuarioRepository,
} from '../../domain/usuario.repository';
import { UsuarioMapper } from './usuario.mapper';

@Injectable()
export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(usuario: NuevoUsuario): Promise<Usuario> {
    const creado = await this.prisma.usuario.create({
      data: {
        numeroDocumento: usuario.numeroDocumento,
        tipoDocumento: usuario.tipoDocumento,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        password: usuario.password,
        telefono: usuario.telefono,
        rol: usuario.rol as unknown as PrismaRol,
      },
    });
    return UsuarioMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    return usuario ? UsuarioMapper.toDomain(usuario) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    return usuario ? UsuarioMapper.toDomain(usuario) : null;
  }

  async buscarPorNumeroDocumento(
    numeroDocumento: string,
  ): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { numeroDocumento },
    });
    return usuario ? UsuarioMapper.toDomain(usuario) : null;
  }

  async listar(): Promise<Usuario[]> {
    const usuarios = await this.prisma.usuario.findMany();
    return usuarios.map(UsuarioMapper.toDomain);
  }
}
