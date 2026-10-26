import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarMisNotificacionesUseCase } from '../../application/use-cases/listar-mis-notificaciones.use-case';
import { MarcarNotificacionLeidaUseCase } from '../../application/use-cases/marcar-notificacion-leida.use-case';
import { NotificacionResponseDto } from '../../application/dto/notificacion-response.dto';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@ApiTags('notificaciones')
@ApiBearerAuth()
@Controller('notificaciones')
export class NotificacionController {
  constructor(
    private readonly listarMisNotificacionesUseCase: ListarMisNotificacionesUseCase,
    private readonly marcarNotificacionLeidaUseCase: MarcarNotificacionLeidaUseCase,
  ) {}

  @ApiOperation({ summary: 'Mis notificaciones, más reciente primero' })
  @Get('mis-notificaciones')
  async misNotificaciones(
    @Req() request: AuthenticatedRequest,
  ): Promise<NotificacionResponseDto[]> {
    const notificaciones = await this.listarMisNotificacionesUseCase.ejecutar(
      request.usuario!.sub,
    );
    return notificaciones.map(NotificacionResponseDto.fromEntity);
  }

  @ApiOperation({ summary: 'Marcar una notificación propia como leída' })
  @Patch(':id/leida')
  async marcarLeida(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<NotificacionResponseDto> {
    const notificacion = await this.marcarNotificacionLeidaUseCase.ejecutar(
      id,
      request.usuario!.sub,
    );
    return NotificacionResponseDto.fromEntity(notificacion);
  }
}
