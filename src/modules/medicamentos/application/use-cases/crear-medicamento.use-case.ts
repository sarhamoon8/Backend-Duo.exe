import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Medicamento } from '../../domain/medicamento.entity';
import { MEDICAMENTO_REPOSITORY } from '../../domain/medicamento.repository';
import type { MedicamentoRepository } from '../../domain/medicamento.repository';
import { CrearMedicamentoDto } from '../dto/crear-medicamento.dto';

@Injectable()
export class CrearMedicamentoUseCase {
  constructor(
    @Inject(MEDICAMENTO_REPOSITORY)
    private readonly medicamentoRepository: MedicamentoRepository,
  ) {}

  async ejecutar(dto: CrearMedicamentoDto): Promise<Medicamento> {
    const existente = await this.medicamentoRepository.buscarPorCodigoNacional(
      dto.codigoNacional,
    );
    if (existente) {
      throw new ConflictException(
        'Ya existe un medicamento con ese código nacional',
      );
    }

    return this.medicamentoRepository.crear({
      codigoNacional: dto.codigoNacional,
      nombreGenerico: dto.nombreGenerico,
      concentracion: dto.concentracion,
      presentacion: dto.presentacion,
      laboratorioFabricante: dto.laboratorioFabricante,
      requiereAutorizacion: dto.requiereAutorizacion,
    });
  }
}
