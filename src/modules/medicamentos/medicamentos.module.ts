import { Module } from '@nestjs/common';
import { MedicamentoController } from './infrastructure/http/medicamento.controller';
import { PrismaMedicamentoRepository } from './infrastructure/persistence/prisma-medicamento.repository';
import { MEDICAMENTO_REPOSITORY } from './domain/medicamento.repository';
import { CrearMedicamentoUseCase } from './application/use-cases/crear-medicamento.use-case';
import { ObtenerMedicamentoUseCase } from './application/use-cases/obtener-medicamento.use-case';
import { ListarMedicamentosUseCase } from './application/use-cases/listar-medicamentos.use-case';

@Module({
  controllers: [MedicamentoController],
  providers: [
    CrearMedicamentoUseCase,
    ObtenerMedicamentoUseCase,
    ListarMedicamentosUseCase,
    { provide: MEDICAMENTO_REPOSITORY, useClass: PrismaMedicamentoRepository },
  ],
  exports: [MEDICAMENTO_REPOSITORY],
})
export class MedicamentosModule {}
