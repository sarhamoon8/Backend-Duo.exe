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
import { PuntosDispensacionModule } from './modules/puntos-dispensacion/puntos-dispensacion.module';
import { VentanillasModule } from './modules/ventanillas/ventanillas.module';
import { MedicamentosModule } from './modules/medicamentos/medicamentos.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { ListaEsperaModule } from './modules/lista-espera/lista-espera.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsuariosModule,
    AuthModule,
    EntidadesMedicasModule,
    ServiciosModule,
    PuntosDispensacionModule,
    VentanillasModule,
    ListaEsperaModule,
    TurnosModule,
    MedicamentosModule,
    InventarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
