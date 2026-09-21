import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '../../domain/usuario.entity';
import { USUARIO_REPOSITORY } from '../../domain/usuario.repository';
import type { UsuarioRepository } from '../../domain/usuario.repository';

@Injectable()
export class ObtenerUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async ejecutar(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }
}
