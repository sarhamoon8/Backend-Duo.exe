import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { GoogleAuthUseCase } from './application/use-cases/google-auth.use-case';
import { SolicitarRecuperacionUseCase } from './application/use-cases/solicitar-recuperacion.use-case';
import { RestablecerPasswordUseCase } from './application/use-cases/restablecer-password.use-case';
import { TOKEN_RECUPERACION_REPOSITORY } from './domain/token-recuperacion.repository';
import { PrismaTokenRecuperacionRepository } from './infrastructure/persistence/prisma-token-recuperacion.repository';
import { GOOGLE_TOKEN_VERIFIER } from './domain/google-token-verifier';
import { GoogleAuthLibraryVerifier } from './infrastructure/google/google-auth-library.verifier';

@Module({
  imports: [
    UsuariosModule,
    NotificacionesModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    GoogleAuthUseCase,
    SolicitarRecuperacionUseCase,
    RestablecerPasswordUseCase,
    {
      provide: TOKEN_RECUPERACION_REPOSITORY,
      useClass: PrismaTokenRecuperacionRepository,
    },
    {
      provide: GOOGLE_TOKEN_VERIFIER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new GoogleAuthLibraryVerifier(config),
    },
    // Guards globales: se aplican a toda la aplicación en este orden.
    // JwtAuthGuard debe ejecutarse antes que RolesGuard porque este
    // último depende de `request.usuario`, que JwtAuthGuard completa.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
