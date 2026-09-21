import { Module } from '@nestjs/common';
import { EntidadesMedicasModule } from '../entidades-medicas/entidades-medicas.module';
import { PuntoDispensacionController } from './infrastructure/http/punto-dispensacion.controller';
import { PrismaPuntoDispensacionRepository } from './infrastructure/persistence/prisma-punto-dispensacion.repository';
import { PUNTO_DISPENSACION_REPOSITORY } from './domain/punto-dispensacion.repository';
import { CrearPuntoDispensacionUseCase } from './application/use-cases/crear-punto-dispensacion.use-case';
import { ObtenerPuntoDispensacionUseCase } from './application/use-cases/obtener-punto-dispensacion.use-case';
import { ListarPuntosDispensacionUseCase } from './application/use-cases/listar-puntos-dispensacion.use-case';

@Module({
  imports: [EntidadesMedicasModule],
  controllers: [PuntoDispensacionController],
  providers: [
    CrearPuntoDispensacionUseCase,
    ObtenerPuntoDispensacionUseCase,
    ListarPuntosDispensacionUseCase,
    {
      provide: PUNTO_DISPENSACION_REPOSITORY,
      useClass: PrismaPuntoDispensacionRepository,
    },
  ],
  exports: [PUNTO_DISPENSACION_REPOSITORY],
})
export class PuntosDispensacionModule {}
