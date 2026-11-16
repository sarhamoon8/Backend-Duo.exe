import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearRecordatorioUseCase } from '../../application/use-cases/crear-recordatorio.use-case';
import { ListarMisRecordatoriosUseCase } from '../../application/use-cases/listar-mis-recordatorios.use-case';
import { ActualizarEstadoRecordatorioUseCase } from '../../application/use-cases/actualizar-estado-recordatorio.use-case';
import { EliminarRecordatorioUseCase } from '../../application/use-cases/eliminar-recordatorio.use-case';
import { ListarAlertasVencimientoUseCase } from '../../application/use-cases/listar-alertas-vencimiento.use-case';
import { CrearRecordatorioDto } from '../../application/dto/crear-recordatorio.dto';
import { ActualizarRecordatorioDto } from '../../application/dto/actualizar-recordatorio.dto';
import { RecordatorioResponseDto } from '../../application/dto/recordatorio-response.dto';
import { AlertaVencimientoResponseDto } from '../../application/dto/alerta-vencimiento-response.dto';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@ApiTags('recordatorios')
@ApiBearerAuth()
@Controller('recordatorios')
export class RecordatorioController {
  constructor(
    private readonly crearRecordatorioUseCase: CrearRecordatorioUseCase,
    private readonly listarMisRecordatoriosUseCase: ListarMisRecordatoriosUseCase,
    private readonly actualizarEstadoRecordatorioUseCase: ActualizarEstadoRecordatorioUseCase,
    private readonly eliminarRecordatorioUseCase: EliminarRecordatorioUseCase,
    private readonly listarAlertasVencimientoUseCase: ListarAlertasVencimientoUseCase,
  ) {}

  // RF-08: registrar un medicamento de uso habitual con recordatorio de toma.
  @ApiOperation({ summary: 'Crear un recordatorio de medicamento' })
  @Post()
  async crear(
    @Body() dto: CrearRecordatorioDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<RecordatorioResponseDto> {
    const recordatorio = await this.crearRecordatorioUseCase.ejecutar(
      dto,
      request.usuario!.sub,
    );
    return RecordatorioResponseDto.fromEntity(recordatorio);
  }

  @ApiOperation({
    summary: 'Mis recordatorios (historial de medicamentos de uso habitual)',
  })
  @Get('mis-recordatorios')
  async misRecordatorios(
    @Req() request: AuthenticatedRequest,
  ): Promise<RecordatorioResponseDto[]> {
    const recordatorios = await this.listarMisRecordatoriosUseCase.ejecutar(
      request.usuario!.sub,
    );
    return RecordatorioResponseDto.fromEntities(recordatorios);
  }

  @ApiOperation({
    summary: 'Alertas de fórmulas próximas a vencer (recordatorios activos)',
  })
  @Get('alertas-vencimiento')
  async alertasVencimiento(
    @Req() request: AuthenticatedRequest,
  ): Promise<AlertaVencimientoResponseDto[]> {
    return this.listarAlertasVencimientoUseCase.ejecutar(
      request.usuario!.sub,
    );
  }

  @ApiOperation({ summary: 'Activar o desactivar un recordatorio propio' })
  @Patch(':id')
  async actualizarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarRecordatorioDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<RecordatorioResponseDto> {
    const recordatorio = await this.actualizarEstadoRecordatorioUseCase.ejecutar(
      id,
      dto.activo,
      request.usuario!.sub,
    );
    return RecordatorioResponseDto.fromEntity(recordatorio);
  }

  @ApiOperation({ summary: 'Eliminar un recordatorio propio' })
  @Delete(':id')
  async eliminar(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.eliminarRecordatorioUseCase.ejecutar(id, request.usuario!.sub);
  }
}
