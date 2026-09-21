import { Module } from '@nestjs/common';
import { PuntosDispensacionModule } from '../puntos-dispensacion/puntos-dispensacion.module';
import { VentanillaController } from './infrastructure/http/ventanilla.controller';
import { PrismaVentanillaRepository } from './infrastructure/persistence/prisma-ventanilla.repository';
import { VENTANILLA_REPOSITORY } from './domain/ventanilla.repository';
import { CrearVentanillaUseCase } from './application/use-cases/crear-ventanilla.use-case';
import { ListarVentanillasPorPuntoUseCase } from './application/use-cases/listar-ventanillas-por-punto.use-case';

@Module({
  imports: [PuntosDispensacionModule],
  controllers: [VentanillaController],
  providers: [
    CrearVentanillaUseCase,
    ListarVentanillasPorPuntoUseCase,
    { provide: VENTANILLA_REPOSITORY, useClass: PrismaVentanillaRepository },
  ],
  exports: [VENTANILLA_REPOSITORY],
})
export class VentanillasModule {}
