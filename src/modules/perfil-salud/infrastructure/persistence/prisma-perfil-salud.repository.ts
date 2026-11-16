import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PerfilSalud } from '../../domain/perfil-salud.entity';
import {
  DatosPerfilSalud,
  PerfilSaludRepository,
} from '../../domain/perfil-salud.repository';
import { PerfilSaludMapper } from './perfil-salud.mapper';

@Injectable()
export class PrismaPerfilSaludRepository implements PerfilSaludRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorUsuario(usuarioId: string): Promise<PerfilSalud | null> {
    const perfil = await this.prisma.perfilSalud.findUnique({
      where: { usuarioId },
    });
    return perfil ? PerfilSaludMapper.toDomain(perfil) : null;
  }

  async actualizar(
    usuarioId: string,
    datos: DatosPerfilSalud,
  ): Promise<PerfilSalud> {
    const actualizado = await this.prisma.perfilSalud.upsert({
      where: { usuarioId },
      create: { usuarioId, ...datos },
      update: { ...datos },
    });
    return PerfilSaludMapper.toDomain(actualizado);
  }
}
