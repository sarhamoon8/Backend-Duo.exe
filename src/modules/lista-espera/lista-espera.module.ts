import { Module } from '@nestjs/common';
import { ServiciosModule } from '../servicios/servicios.module';
import { PuntosDispensacionModule } from '../puntos-dispensacion/puntos-dispensacion.module';
import { ListaEsperaController } from './infrastructure/http/lista-espera.controller';
import { PrismaListaEsperaRepository } from './infrastructure/persistence/prisma-lista-espera.repository';
import { LISTA_ESPERA_REPOSITORY } from './domain/lista-espera.repository';
import { UnirseListaEsperaUseCase } from './application/use-cases/unirse-lista-espera.use-case';
import { SalirListaEsperaUseCase } from './application/use-cases/salir-lista-espera.use-case';
import { ListarMiListaEsperaUseCase } from './application/use-cases/listar-mi-lista-espera.use-case';
import { ListarListaEsperaPorPuntoUseCase } from './application/use-cases/listar-lista-espera-por-punto.use-case';
import { ObtenerPosicionListaEsperaUseCase } from './application/use-cases/obtener-posicion-lista-espera.use-case';

@Module({
  imports: [ServiciosModule, PuntosDispensacionModule],
  controllers: [ListaEsperaController],
  providers: [
    UnirseListaEsperaUseCase,
    SalirListaEsperaUseCase,
    ListarMiListaEsperaUseCase,
    ListarListaEsperaPorPuntoUseCase,
    ObtenerPosicionListaEsperaUseCase,
    { provide: LISTA_ESPERA_REPOSITORY, useClass: PrismaListaEsperaRepository },
  ],
  // TurnosModule la importa para la reasignación automática al cancelar.
  exports: [LISTA_ESPERA_REPOSITORY],
})
export class ListaEsperaModule {}
