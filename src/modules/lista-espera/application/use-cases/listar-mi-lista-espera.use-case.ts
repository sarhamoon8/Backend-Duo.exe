import { Inject, Injectable } from '@nestjs/common';
import { ListaEspera } from '../../domain/lista-espera.entity';
import { LISTA_ESPERA_REPOSITORY } from '../../domain/lista-espera.repository';
import type { ListaEsperaRepository } from '../../domain/lista-espera.repository';

@Injectable()
export class ListarMiListaEsperaUseCase {
  constructor(
    @Inject(LISTA_ESPERA_REPOSITORY)
    private readonly listaEsperaRepository: ListaEsperaRepository,
  ) {}

  ejecutar(usuarioId: string): Promise<ListaEspera[]> {
    return this.listaEsperaRepository.listarPorUsuario(usuarioId);
  }
}
