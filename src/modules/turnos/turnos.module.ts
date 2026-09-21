import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ServiciosModule } from '../servicios/servicios.module';
import { TurnoController } from './infrastructure/http/turno.controller';
import { PrismaTurnoRepository } from './infrastructure/persistence/prisma-turno.repository';
import { TURNO_REPOSITORY } from './domain/turno.repository';
import { CrearTurnoUseCase } from './application/use-cases/crear-turno.use-case';
import { AvanzarTurnoUseCase } from './application/use-cases/avanzar-turno.use-case';
import { CancelarTurnoUseCase } from './application/use-cases/cancelar-turno.use-case';
import { ListarTurnosPorServicioUseCase } from './application/use-cases/listar-turnos-por-servicio.use-case';

@Module({
  imports: [UsuariosModule, ServiciosModule],
  controllers: [TurnoController],
  providers: [
    CrearTurnoUseCase,
    AvanzarTurnoUseCase,
    CancelarTurnoUseCase,
    ListarTurnosPorServicioUseCase,
    { provide: TURNO_REPOSITORY, useClass: PrismaTurnoRepository },
  ],
})
export class TurnosModule {}
