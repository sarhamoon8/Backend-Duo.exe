import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LISTA_ESPERA_REPOSITORY } from '../../domain/lista-espera.repository';
import type { ListaEsperaRepository } from '../../domain/lista-espera.repository';
import { Rol } from '../../../usuarios/domain/rol.enum';

const ROLES_STAFF = [Rol.FUNCIONARIO, Rol.ADMIN];

export interface ActorSalidaListaEspera {
  id: string;
  rol: Rol;
}

@Injectable()
export class SalirListaEsperaUseCase {
  constructor(
    @Inject(LISTA_ESPERA_REPOSITORY)
    private readonly listaEsperaRepository: ListaEsperaRepository,
  ) {}

  async ejecutar(id: string, actor: ActorSalidaListaEspera): Promise<void> {
    const entrada = await this.listaEsperaRepository.buscarPorId(id);
    if (!entrada) {
      throw new NotFoundException('Inscripción en lista de espera no encontrada');
    }

    const esStaff = ROLES_STAFF.includes(actor.rol);
    if (!esStaff && entrada.usuarioId !== actor.id) {
      throw new ForbiddenException(
        'No puedes retirar la inscripción de otro usuario',
      );
    }

    await this.listaEsperaRepository.eliminar(id);
  }
}
