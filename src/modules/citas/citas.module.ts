import { Module } from '@nestjs/common';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { ProfesionalesModule } from '../profesionales/profesionales.module';
import { CitaController } from './infrastructure/http/cita.controller';
import { PrismaCitaRepository } from './infrastructure/persistence/prisma-cita.repository';
import { PrismaHorarioRepository } from './infrastructure/persistence/prisma-horario.repository';
import { CITA_REPOSITORY } from './domain/cita.repository';
import { HORARIO_REPOSITORY } from './domain/horario.repository';
import { AgendarCitaUseCase } from './application/use-cases/agendar-cita.use-case';
import { CancelarCitaUseCase } from './application/use-cases/cancelar-cita.use-case';
import { ConsultarDisponibilidadUseCase } from './application/use-cases/consultar-disponibilidad.use-case';
import { ReprogramarCitaUseCase } from './application/use-cases/reprogramar-cita.use-case';
import { AsignadorDeDoctorService } from './application/services/asignador-de-doctor.service';
import { ListarMisCitasUseCase } from './application/use-cases/listar-mis-citas.use-case';

@Module({
  imports: [ProfesionalesModule, NotificacionesModule],
  controllers: [CitaController],
  providers: [
    ConsultarDisponibilidadUseCase,
    AgendarCitaUseCase,
    ListarMisCitasUseCase,
    CancelarCitaUseCase,
    ReprogramarCitaUseCase,
    AsignadorDeDoctorService,
    { provide: CITA_REPOSITORY, useClass: PrismaCitaRepository },
    { provide: HORARIO_REPOSITORY, useClass: PrismaHorarioRepository },
  ],
})
export class CitasModule {}
