import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { NotificacionController } from './infrastructure/http/notificacion.controller';
import { PrismaNotificacionRepository } from './infrastructure/persistence/prisma-notificacion.repository';
import { GmailSmtpProvider } from './infrastructure/email/gmail-smtp.provider';
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
    { provide: NOTIFICACION_REPOSITORY, useClass: PrismaNotificacionRepository },
    { provide: EMAIL_PROVIDER, useClass: GmailSmtpProvider },
  ],
  // TurnosModule la importa para notificar al crear/cancelar/avanzar un
  // turno y al reasignar desde la lista de espera (RF-05).
  exports: [EnviarNotificacionUseCase],
})
export class NotificacionesModule {}
