import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ServiciosModule } from '../servicios/servicios.module';
import { PuntosDispensacionModule } from '../puntos-dispensacion/puntos-dispensacion.module';
import { VentanillasModule } from '../ventanillas/ventanillas.module';
import { TurnoController } from './infrastructure/http/turno.controller';
import { PrismaTurnoRepository } from './infrastructure/persistence/prisma-turno.repository';
import { TURNO_REPOSITORY } from './domain/turno.repository';
import { CrearTurnoUseCase } from './application/use-cases/crear-turno.use-case';
import { AvanzarTurnoUseCase } from './application/use-cases/avanzar-turno.use-case';
import { CancelarTurnoUseCase } from './application/use-cases/cancelar-turno.use-case';
import { ListarTurnosPorPuntoUseCase } from './application/use-cases/listar-turnos-por-punto.use-case';
import { ListarMisTurnosUseCase } from './application/use-cases/listar-mis-turnos.use-case';
import { ObtenerTurnoUseCase } from './application/use-cases/obtener-turno.use-case';
import { ObtenerPosicionTurnoUseCase } from './application/use-cases/obtener-posicion-turno.use-case';

@Module({
  imports: [
    UsuariosModule,
    ServiciosModule,
    PuntosDispensacionModule,
    VentanillasModule,
  ],
  controllers: [TurnoController],
  providers: [
    CrearTurnoUseCase,
    AvanzarTurnoUseCase,
    CancelarTurnoUseCase,
    ListarTurnosPorPuntoUseCase,
    ListarMisTurnosUseCase,
    ObtenerTurnoUseCase,
    ObtenerPosicionTurnoUseCase,
    { provide: TURNO_REPOSITORY, useClass: PrismaTurnoRepository },
  ],
})
export class TurnosModule {}
