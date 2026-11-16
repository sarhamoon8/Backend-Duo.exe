import { Module } from '@nestjs/common';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { InventarioModule } from '../inventario/inventario.module';
import { RecordatorioController } from './infrastructure/http/recordatorio.controller';
import { PrismaRecordatorioRepository } from './infrastructure/persistence/prisma-recordatorio.repository';
import { RECORDATORIO_REPOSITORY } from './domain/recordatorio.repository';
import { CrearRecordatorioUseCase } from './application/use-cases/crear-recordatorio.use-case';
import { ListarMisRecordatoriosUseCase } from './application/use-cases/listar-mis-recordatorios.use-case';
import { ActualizarEstadoRecordatorioUseCase } from './application/use-cases/actualizar-estado-recordatorio.use-case';
import { EliminarRecordatorioUseCase } from './application/use-cases/eliminar-recordatorio.use-case';
import { ListarAlertasVencimientoUseCase } from './application/use-cases/listar-alertas-vencimiento.use-case';

@Module({
  imports: [MedicamentosModule, InventarioModule],
  controllers: [RecordatorioController],
  providers: [
    CrearRecordatorioUseCase,
    ListarMisRecordatoriosUseCase,
    ActualizarEstadoRecordatorioUseCase,
    EliminarRecordatorioUseCase,
    ListarAlertasVencimientoUseCase,
    { provide: RECORDATORIO_REPOSITORY, useClass: PrismaRecordatorioRepository },
  ],
})
export class RecordatoriosModule {}
