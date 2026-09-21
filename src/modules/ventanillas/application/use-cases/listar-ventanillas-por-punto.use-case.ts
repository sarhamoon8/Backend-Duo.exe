import { Inject, Injectable } from '@nestjs/common';
import { Ventanilla } from '../../domain/ventanilla.entity';
import { VENTANILLA_REPOSITORY } from '../../domain/ventanilla.repository';
import type { VentanillaRepository } from '../../domain/ventanilla.repository';

@Injectable()
export class ListarVentanillasPorPuntoUseCase {
  constructor(
    @Inject(VENTANILLA_REPOSITORY)
    private readonly ventanillaRepository: VentanillaRepository,
  ) {}

  ejecutar(puntoId: string): Promise<Ventanilla[]> {
    return this.ventanillaRepository.listarPorPunto(puntoId);
  }
}
