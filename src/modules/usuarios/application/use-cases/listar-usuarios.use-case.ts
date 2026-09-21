import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/usuario.entity';
import { USUARIO_REPOSITORY } from '../../domain/usuario.repository';
import type { UsuarioRepository } from '../../domain/usuario.repository';

@Injectable()
export class ListarUsuariosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  ejecutar(): Promise<Usuario[]> {
    return this.usuarioRepository.listar();
  }
}
