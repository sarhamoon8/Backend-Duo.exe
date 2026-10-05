import { Module } from '@nestjs/common';
import { PuntosDispensacionModule } from '../puntos-dispensacion/puntos-dispensacion.module';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { InventarioController } from './infrastructure/http/inventario.controller';
import { PrismaInventarioRepository } from './infrastructure/persistence/prisma-inventario.repository';
import { INVENTARIO_REPOSITORY } from './domain/inventario.repository';
import { CrearInventarioUseCase } from './application/use-cases/crear-inventario.use-case';
import { ListarInventarioPorPuntoUseCase } from './application/use-cases/listar-inventario-por-punto.use-case';

@Module({
  imports: [PuntosDispensacionModule, MedicamentosModule],
  controllers: [InventarioController],
  providers: [
    CrearInventarioUseCase,
    ListarInventarioPorPuntoUseCase,
    { provide: INVENTARIO_REPOSITORY, useClass: PrismaInventarioRepository },
  ],
  exports: [INVENTARIO_REPOSITORY],
})
export class InventarioModule {}
