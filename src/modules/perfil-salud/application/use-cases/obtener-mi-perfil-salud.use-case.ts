import { Inject, Injectable } from '@nestjs/common';
import { PerfilSalud } from '../../domain/perfil-salud.entity';
import { PERFIL_SALUD_REPOSITORY } from '../../domain/perfil-salud.repository';
import type { PerfilSaludRepository } from '../../domain/perfil-salud.repository';

@Injectable()
export class ObtenerMiPerfilSaludUseCase {
  constructor(
    @Inject(PERFIL_SALUD_REPOSITORY)
    private readonly perfilSaludRepository: PerfilSaludRepository,
  ) {}

  // null si el usuario todavía no ha registrado información de salud; no es
  // un error, es un perfil vacío.
  async ejecutar(usuarioId: string): Promise<PerfilSalud | null> {
    return this.perfilSaludRepository.buscarPorUsuario(usuarioId);
  }
}
