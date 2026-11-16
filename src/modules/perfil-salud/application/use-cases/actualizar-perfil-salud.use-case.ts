import { Inject, Injectable } from '@nestjs/common';
import { PerfilSalud } from '../../domain/perfil-salud.entity';
import { PERFIL_SALUD_REPOSITORY } from '../../domain/perfil-salud.repository';
import type { PerfilSaludRepository } from '../../domain/perfil-salud.repository';
import { ActualizarPerfilSaludDto } from '../dto/actualizar-perfil-salud.dto';

@Injectable()
export class ActualizarPerfilSaludUseCase {
  constructor(
    @Inject(PERFIL_SALUD_REPOSITORY)
    private readonly perfilSaludRepository: PerfilSaludRepository,
  ) {}

  async ejecutar(
    dto: ActualizarPerfilSaludDto,
    usuarioId: string,
  ): Promise<PerfilSalud> {
    return this.perfilSaludRepository.actualizar(usuarioId, dto);
  }
}
