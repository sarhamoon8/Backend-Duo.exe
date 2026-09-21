import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { ObtenerUsuarioUseCase } from '../../application/use-cases/obtener-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { CrearUsuarioDto } from '../../application/dto/crear-usuario.dto';
import { UsuarioResponseDto } from '../../application/dto/usuario-response.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly obtenerUsuarioUseCase: ObtenerUsuarioUseCase,
    private readonly listarUsuariosUseCase: ListarUsuariosUseCase,
  ) {}

  @Post()
  async crear(@Body() dto: CrearUsuarioDto): Promise<UsuarioResponseDto> {
    const usuario = await this.crearUsuarioUseCase.ejecutar(dto);
    return UsuarioResponseDto.fromEntity(usuario);
  }

  @Get()
  async listar(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.listarUsuariosUseCase.ejecutar();
    return usuarios.map(UsuarioResponseDto.fromEntity);
  }

  @Get(':id')
  async obtener(@Param('id') id: string): Promise<UsuarioResponseDto> {
    const usuario = await this.obtenerUsuarioUseCase.ejecutar(id);
    return UsuarioResponseDto.fromEntity(usuario);
  }
}
