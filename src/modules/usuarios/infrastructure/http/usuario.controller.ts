import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { ObtenerUsuarioUseCase } from '../../application/use-cases/obtener-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { CrearUsuarioDto } from '../../application/dto/crear-usuario.dto';
import { UsuarioResponseDto } from '../../application/dto/usuario-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../domain/rol.enum';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly obtenerUsuarioUseCase: ObtenerUsuarioUseCase,
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
  ) {}

  // Crear usuarios con rol arbitrario (p. ej. FUNCIONARIO o ADMIN) es
  // exclusivo de administradores. El autorregistro público vive en
  // POST /auth/register y siempre asigna PACIENTE.
  @Roles(Rol.ADMIN)
  @Post()
  async crear(@Body() dto: CrearUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await this.crearUsuarioUseCase.ejecutar(dto);
    return UsuarioResponseDto.fromEntity(usuario);
  }

  // Listar el padrón completo de usuarios es una funcionalidad
  // administrativa (consultar información de otros usuarios).
  @Roles(Rol.ADMIN)
  @Get()
  async listar(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.listarUsuariosUseCase.ejecutar();
    return usuarios.map(UsuarioResponseDto.fromEntity);
  }

  // Cualquier usuario autenticado puede consultar su propio perfil;
  // consultar el de otra persona requiere ser ADMIN.
  @Get(':id')
  async obtener(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<UsuarioResponseDto> {
    const solicitante = request.usuario;
    const esPropio = solicitante?.sub === id;
    const esAdmin = solicitante?.rol === Rol.ADMIN;

    if (!esPropio && !esAdmin) {
      throw new ForbiddenException(
        'No puedes consultar el perfil de otro usuario',
      );
    }

    const usuario = await this.obtenerUsuarioUseCase.ejecutar(id);
    return UsuarioResponseDto.fromEntity(usuario);
  }
}
