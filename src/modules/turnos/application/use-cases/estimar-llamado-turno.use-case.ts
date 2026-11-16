import { Inject, Injectable } from '@nestjs/common';
import { Turno } from '../../domain/turno.entity';
import { EstimacionLlamado, estimarLlamado } from '../../domain/tiempo-espera';
import { SERVICIO_REPOSITORY } from '../../../servicios/domain/servicio.repository';
import type { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { VENTANILLA_REPOSITORY } from '../../../ventanillas/domain/ventanilla.repository';
import type { VentanillaRepository } from '../../../ventanillas/domain/ventanilla.repository';
import { EstadoOperativoVentanilla } from '../../../ventanillas/domain/estado-operativo-ventanilla.enum';

// Calcula en cuánto tiempo van a llamar a un turno PENDIENTE, a partir de su
// posición en la fila, el tiempo promedio del servicio y las ventanillas
// activas de la sede. Para los demás estados no hay estimación.
@Injectable()
export class EstimarLlamadoTurnoUseCase {
  constructor(
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
    @Inject(VENTANILLA_REPOSITORY)
    private readonly ventanillaRepository: VentanillaRepository,
  ) {}

  async ejecutar(
    turno: Turno,
    posicion: number | null,
    ahora: Date = new Date(),
  ): Promise<EstimacionLlamado | null> {
    if (posicion === null) {
      return null;
    }

    const [servicio, ventanillas] = await Promise.all([
      this.servicioRepository.buscarPorId(turno.servicioId),
      this.ventanillaRepository.listarPorPunto(turno.puntoId),
    ]);

    return estimarLlamado({
      creadoEn: turno.creadoEn,
      personasAdelante: posicion - 1,
      tiempoPromedioMin: servicio?.tiempoPromedioMin ?? 0,
      ventanillasActivas: ventanillas.filter(
        (v) => v.estadoOperativo === EstadoOperativoVentanilla.ACTIVA,
      ).length,
      ahora,
    });
  }
}
