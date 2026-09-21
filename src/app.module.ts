import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { EntidadesMedicasModule } from './modules/entidades-medicas/entidades-medicas.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { TurnosModule } from './modules/turnos/turnos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    EntidadesMedicasModule,
    ServiciosModule,
    TurnosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
