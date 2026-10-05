import { Inject, Injectable } from '@nestjs/common';
import { ListaEspera } from '../../domain/lista-espera.entity';
import { LISTA_ESPERA_REPOSITORY } from '../../domain/lista-espera.repository';
import type { ListaEsperaRepository } from '../../domain/lista-espera.repository';

@Injectable()
export class ObtenerPosicionListaEsperaUseCase {
  constructor(
    @Inject(LISTA_ESPERA_REPOSITORY)
    private readonly listaEsperaRepository: ListaEsperaRepository,
  ) {}

  async ejecutar(entrada: ListaEspera): Promise<number> {
    const anteriores = await this.listaEsperaRepository.contarAntes(
      entrada.servicioId,
      entrada.puntoId,
      entrada.creadoEn,
    );
    return anteriores + 1;
  }
}
