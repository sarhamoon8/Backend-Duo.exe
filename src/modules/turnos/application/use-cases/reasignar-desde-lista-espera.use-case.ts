import { Inject, Injectable } from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';
import { LISTA_ESPERA_REPOSITORY } from '../../../lista-espera/domain/lista-espera.repository';
import type { ListaEsperaRepository } from '../../../lista-espera/domain/lista-espera.repository';
import { generarCodigoTurno } from '../../domain/generar-codigo-turno';

// RF-04: cuando un turno PENDIENTE se cancela, le da automáticamente ese
// cupo liberado al primero de la lista de espera del mismo servicio+punto
// (si hay alguien esperando), creándole un turno real y sacándolo de la
// lista de espera.
@Injectable()
export class ReasignarDesdeListaEsperaUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY)
    private readonly turnoRepository: TurnoRepository,
    @Inject(LISTA_ESPERA_REPOSITORY)
    private readonly listaEsperaRepository: ListaEsperaRepository,
  ) {}

  async ejecutar(servicioId: string, puntoId: string): Promise<Turno | null> {
    const siguiente = await this.listaEsperaRepository.obtenerPrimero(
      servicioId,
      puntoId,
    );
    if (!siguiente) {
      return null;
    }

    const turno = await this.turnoRepository.crear({
      usuarioId: siguiente.usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });

    await this.listaEsperaRepository.eliminar(siguiente.id);

    return turno;
  }
}
