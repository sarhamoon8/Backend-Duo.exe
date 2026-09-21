import { Module } from '@nestjs/common';
import { EntidadesMedicasModule } from '../entidades-medicas/entidades-medicas.module';
import { ServicioController } from './infrastructure/http/servicio.controller';
import { PrismaServicioRepository } from './infrastructure/persistence/prisma-servicio.repository';
import { SERVICIO_REPOSITORY } from './domain/servicio.repository';
import { CrearServicioUseCase } from './application/use-cases/crear-servicio.use-case';
import { ObtenerServicioUseCase } from './application/use-cases/obtener-servicio.use-case';
import { ListarServiciosUseCase } from './application/use-cases/listar-servicios.use-case';

@Module({
  imports: [EntidadesMedicasModule],
  controllers: [ServicioController],
  providers: [
    CrearServicioUseCase,
    ObtenerServicioUseCase,
    ListarServiciosUseCase,
    { provide: SERVICIO_REPOSITORY, useClass: PrismaServicioRepository },
  ],
  exports: [SERVICIO_REPOSITORY],
})
export class ServiciosModule {}
