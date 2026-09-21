import { Module } from '@nestjs/common';
import { UsuarioController } from './infrastructure/http/usuario.controller';
import { PrismaUsuarioRepository } from './infrastructure/persistence/prisma-usuario.repository';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';
import { CrearUsuarioUseCase } from './application/use-cases/crear-usuario.use-case';
import { ObtenerUsuarioUseCase } from './application/use-cases/obtener-usuario.use-case';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios.use-case';

@Module({
  controllers: [UsuarioController],
  providers: [
    CrearUsuarioUseCase,
    ObtenerUsuarioUseCase,
    ListarUsuariosUseCase,
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
  ],
  exports: [USUARIO_REPOSITORY, CrearUsuarioUseCase],
})
export class UsuariosModule {}
