import { Inject, Injectable } from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { TURNO_REPOSITORY } from '../../domain/turno.repository';
import type { TurnoRepository } from '../../domain/turno.repository';
import { LISTA_ESPERA_REPOSITORY } from '../../../lista-espera/domain/lista-espera.repository';
import type { ListaEsperaRepository } from '../../../lista-espera/domain/lista-espera.repository';
import { generarCodigoTurno } from '../../domain/generar-codigo-turno';
import { EnviarNotificacionUseCase } from '../../../notificaciones/application/use-cases/enviar-notificacion.use-case';
import { TipoNotificacion } from '../../../notificaciones/domain/tipo-notificacion.enum';

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
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
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

    // RF-05: "nuevas oportunidades de citas" — se liberó un cupo y esta
    // persona, que solo estaba en lista de espera, ahora tiene un turno
    // real sin haber hecho nada.
    await this.enviarNotificacionUseCase.ejecutar(
      siguiente.usuarioId,
      TipoNotificacion.TURNO_REASIGNADO,
      'Se liberó un turno para ti',
      `Un cupo se liberó y te asignamos el turno ${turno.codigoAlfanumerico}.`,
    );

    return turno;
  }
}
