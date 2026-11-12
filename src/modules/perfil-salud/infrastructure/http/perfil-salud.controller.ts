import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObtenerMiPerfilSaludUseCase } from '../../application/use-cases/obtener-mi-perfil-salud.use-case';
import { ActualizarPerfilSaludUseCase } from '../../application/use-cases/actualizar-perfil-salud.use-case';
import { ActualizarPerfilSaludDto } from '../../application/dto/actualizar-perfil-salud.dto';
import { PerfilSaludResponseDto } from '../../application/dto/perfil-salud-response.dto';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

// RF-10: información básica de salud autorreportada por el propio paciente.
@ApiTags('perfil-salud')
@ApiBearerAuth()
@Controller('perfil-salud')
export class PerfilSaludController {
  constructor(
    private readonly obtenerMiPerfilSaludUseCase: ObtenerMiPerfilSaludUseCase,
    private readonly actualizarPerfilSaludUseCase: ActualizarPerfilSaludUseCase,
  ) {}

  @ApiOperation({ summary: 'Consultar mi perfil de salud' })
  @Get('mi-perfil')
  async miPerfil(
    @Req() request: AuthenticatedRequest,
  ): Promise<PerfilSaludResponseDto | null> {
    const perfil = await this.obtenerMiPerfilSaludUseCase.ejecutar(
      request.usuario!.sub,
    );
    return perfil ? PerfilSaludResponseDto.fromEntity(perfil) : null;
  }

  @ApiOperation({ summary: 'Crear o actualizar mi perfil de salud' })
  @Put('mi-perfil')
  async actualizarMiPerfil(
    @Body() dto: ActualizarPerfilSaludDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PerfilSaludResponseDto> {
    const perfil = await this.actualizarPerfilSaludUseCase.ejecutar(
      dto,
      request.usuario!.sub,
    );
    return PerfilSaludResponseDto.fromEntity(perfil);
  }
}
