import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogPeticionController } from './infrastructure/http/log-peticion.controller';
import { PrismaLogPeticionRepository } from './infrastructure/persistence/prisma-log-peticion.repository';
import { LoggingInterceptor } from './infrastructure/http/logging.interceptor';
import { LOG_PETICION_REPOSITORY } from './domain/log-peticion.repository';
import { RegistrarLogPeticionUseCase } from './application/use-cases/registrar-log-peticion.use-case';
import { ListarLogsUseCase } from './application/use-cases/listar-logs.use-case';

@Module({
  controllers: [LogPeticionController],
  providers: [
    RegistrarLogPeticionUseCase,
    ListarLogsUseCase,
    {
      provide: LOG_PETICION_REPOSITORY,
      useClass: PrismaLogPeticionRepository,
    },
    // Interceptor global: corre en cada petición de toda la aplicación,
    // no solo en las rutas de este módulo.
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class LogsModule {}
