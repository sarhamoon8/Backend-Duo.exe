import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { NotificacionController } from './infrastructure/http/notificacion.controller';
import { PrismaNotificacionRepository } from './infrastructure/persistence/prisma-notificacion.repository';
import { GmailApiProvider } from './infrastructure/email/gmail-api.provider';
import { NOTIFICACION_REPOSITORY } from './domain/notificacion.repository';
import { EMAIL_PROVIDER } from './domain/email-provider';
import { EnviarNotificacionUseCase } from './application/use-cases/enviar-notificacion.use-case';
import { ListarMisNotificacionesUseCase } from './application/use-cases/listar-mis-notificaciones.use-case';
import { MarcarNotificacionLeidaUseCase } from './application/use-cases/marcar-notificacion-leida.use-case';

@Module({
  imports: [ConfigModule, UsuariosModule],
  controllers: [NotificacionController],
  providers: [
    EnviarNotificacionUseCase,
    ListarMisNotificacionesUseCase,
    MarcarNotificacionLeidaUseCase,
    {
      provide: NOTIFICACION_REPOSITORY,
      useClass: PrismaNotificacionRepository,
    },
    { provide: EMAIL_PROVIDER, useClass: GmailApiProvider },
  ],
  // TurnosModule la importa para notificar al crear/cancelar/avanzar un
  // turno y al reasignar desde la lista de espera (RF-05).
  // EMAIL_PROVIDER también lo usa AuthModule (correo de recuperación de contraseña).
  exports: [EnviarNotificacionUseCase, EMAIL_PROVIDER],
})
export class NotificacionesModule {}
