import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Medicamento } from '../../domain/medicamento.entity';
import {
  NuevoMedicamento,
  MedicamentoRepository,
} from '../../domain/medicamento.repository';
import { MedicamentoMapper } from './medicamento.mapper';

@Injectable()
export class PrismaMedicamentoRepository implements MedicamentoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(medicamento: NuevoMedicamento): Promise<Medicamento> {
    const creado = await this.prisma.medicamento.create({
      data: {
        codigoNacional: medicamento.codigoNacional,
        nombreGenerico: medicamento.nombreGenerico,
        concentracion: medicamento.concentracion,
        presentacion: medicamento.presentacion,
        laboratorioFabricante: medicamento.laboratorioFabricante,
        requiereAutorizacion: medicamento.requiereAutorizacion,
      },
    });
    return MedicamentoMapper.toDomain(creado);
  }

  async buscarPorId(id: string): Promise<Medicamento | null> {
    const medicamento = await this.prisma.medicamento.findUnique({
      where: { id },
    });
    return medicamento ? MedicamentoMapper.toDomain(medicamento) : null;
  }

  async buscarPorCodigoNacional(
    codigoNacional: string,
  ): Promise<Medicamento | null> {
    const medicamento = await this.prisma.medicamento.findUnique({
      where: { codigoNacional },
    });
    return medicamento ? MedicamentoMapper.toDomain(medicamento) : null;
  }

  async listar(): Promise<Medicamento[]> {
    const medicamentos = await this.prisma.medicamento.findMany();
    return medicamentos.map(MedicamentoMapper.toDomain);
  }
}
