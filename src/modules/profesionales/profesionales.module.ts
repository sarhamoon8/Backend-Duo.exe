import { Module } from '@nestjs/common';
import { PuntosDispensacionModule } from '../puntos-dispensacion/puntos-dispensacion.module';
import { ProfesionalController } from './infrastructure/http/profesional.controller';
import { PrismaProfesionalRepository } from './infrastructure/persistence/prisma-profesional.repository';
import { PROFESIONAL_REPOSITORY } from './domain/profesional.repository';
import { CrearProfesionalUseCase } from './application/use-cases/crear-profesional.use-case';
import { ListarProfesionalesUseCase } from './application/use-cases/listar-profesionales.use-case';
import { ObtenerProfesionalUseCase } from './application/use-cases/obtener-profesional.use-case';

@Module({
  imports: [PuntosDispensacionModule],
  controllers: [ProfesionalController],
  providers: [
    CrearProfesionalUseCase,
    ListarProfesionalesUseCase,
    ObtenerProfesionalUseCase,
    { provide: PROFESIONAL_REPOSITORY, useClass: PrismaProfesionalRepository },
  ],
  exports: [PROFESIONAL_REPOSITORY],
})
export class ProfesionalesModule {}
