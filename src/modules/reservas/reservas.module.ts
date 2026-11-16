import { Module } from '@nestjs/common';
import { PuntosDispensacionModule } from '../puntos-dispensacion/puntos-dispensacion.module';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { InventarioModule } from '../inventario/inventario.module';
import { ReservaController } from './infrastructure/http/reserva.controller';
import { PrismaReservaRepository } from './infrastructure/persistence/prisma-reserva.repository';
import { RESERVA_REPOSITORY } from './domain/reserva.repository';
import { CrearReservaUseCase } from './application/use-cases/crear-reserva.use-case';
import { ListarMisReservasUseCase } from './application/use-cases/listar-mis-reservas.use-case';
import { CancelarReservaUseCase } from './application/use-cases/cancelar-reserva.use-case';
import { ReclamarReservaUseCase } from './application/use-cases/reclamar-reserva.use-case';

@Module({
  imports: [PuntosDispensacionModule, MedicamentosModule, InventarioModule],
  controllers: [ReservaController],
  providers: [
    CrearReservaUseCase,
    ListarMisReservasUseCase,
    CancelarReservaUseCase,
    ReclamarReservaUseCase,
    { provide: RESERVA_REPOSITORY, useClass: PrismaReservaRepository },
  ],
})
export class ReservasModule {}
