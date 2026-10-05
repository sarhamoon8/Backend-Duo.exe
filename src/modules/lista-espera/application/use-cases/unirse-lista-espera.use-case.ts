import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListaEspera } from '../../domain/lista-espera.entity';
import { LISTA_ESPERA_REPOSITORY } from '../../domain/lista-espera.repository';
import type { ListaEsperaRepository } from '../../domain/lista-espera.repository';
import { SERVICIO_REPOSITORY } from '../../../servicios/domain/servicio.repository';
import type { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { PUNTO_DISPENSACION_REPOSITORY } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import type { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { UnirseListaEsperaDto } from '../dto/unirse-lista-espera.dto';

@Injectable()
export class UnirseListaEsperaUseCase {
  constructor(
    @Inject(LISTA_ESPERA_REPOSITORY)
    private readonly listaEsperaRepository: ListaEsperaRepository,
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepository: ServicioRepository,
    @Inject(PUNTO_DISPENSACION_REPOSITORY)
    private readonly puntoDispensacionRepository: PuntoDispensacionRepository,
  ) {}

  async ejecutar(
    dto: UnirseListaEsperaDto,
    usuarioId: string,
  ): Promise<ListaEspera> {
    const servicio = await this.servicioRepository.buscarPorId(
      dto.servicioId,
    );
    if (!servicio) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (!servicio.activo) {
      throw new BadRequestException('El servicio no está activo actualmente');
    }

    const punto = await this.puntoDispensacionRepository.buscarPorId(
      dto.puntoId,
    );
    if (!punto) {
      throw new NotFoundException('Punto de dispensación no encontrado');
    }

    if (punto.entidadId !== servicio.entidadId) {
      throw new BadRequestException(
        'El servicio no pertenece a la entidad médica de este punto de dispensación',
      );
    }

    // Duplicados (mismo usuario + servicio + punto) los rechaza la
    // restricción única de la base de datos, traducida a 409 por el
    // PrismaExceptionFilter global.
    return this.listaEsperaRepository.crear({
      usuarioId,
      servicioId: dto.servicioId,
      puntoId: dto.puntoId,
    });
  }
}
