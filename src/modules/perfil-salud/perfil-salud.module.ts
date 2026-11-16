import { Module } from '@nestjs/common';
import { PerfilSaludController } from './infrastructure/http/perfil-salud.controller';
import { PrismaPerfilSaludRepository } from './infrastructure/persistence/prisma-perfil-salud.repository';
import { PERFIL_SALUD_REPOSITORY } from './domain/perfil-salud.repository';
import { ObtenerMiPerfilSaludUseCase } from './application/use-cases/obtener-mi-perfil-salud.use-case';
import { ActualizarPerfilSaludUseCase } from './application/use-cases/actualizar-perfil-salud.use-case';

@Module({
  controllers: [PerfilSaludController],
  providers: [
    ObtenerMiPerfilSaludUseCase,
    ActualizarPerfilSaludUseCase,
    { provide: PERFIL_SALUD_REPOSITORY, useClass: PrismaPerfilSaludRepository },
  ],
})
export class PerfilSaludModule {}
