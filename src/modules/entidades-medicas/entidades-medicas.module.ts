import { Module } from '@nestjs/common';
import { EntidadMedicaController } from './infrastructure/http/entidad-medica.controller';
import { PrismaEntidadMedicaRepository } from './infrastructure/persistence/prisma-entidad-medica.repository';
import { ENTIDAD_MEDICA_REPOSITORY } from './domain/entidad-medica.repository';
import { CrearEntidadMedicaUseCase } from './application/use-cases/crear-entidad-medica.use-case';
import { ObtenerEntidadMedicaUseCase } from './application/use-cases/obtener-entidad-medica.use-case';
import { ListarEntidadesMedicasUseCase } from './application/use-cases/listar-entidades-medicas.use-case';

@Module({
  controllers: [EntidadMedicaController],
  providers: [
    CrearEntidadMedicaUseCase,
    ObtenerEntidadMedicaUseCase,
    ListarEntidadesMedicasUseCase,
    {
      provide: ENTIDAD_MEDICA_REPOSITORY,
      useClass: PrismaEntidadMedicaRepository,
    },
  ],
  exports: [ENTIDAD_MEDICA_REPOSITORY],
})
export class EntidadesMedicasModule {}
