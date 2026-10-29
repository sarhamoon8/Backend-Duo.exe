import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListarLogsUseCase } from '../../application/use-cases/listar-logs.use-case';
import { LogPeticionResponseDto } from '../../application/dto/log-peticion-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

// Bitácora de peticiones HTTP persistida en base de datos (ver
// LoggingInterceptor). Solo ADMIN puede consultarla: es información
// operativa, no de negocio, y puede incluir IPs de otros usuarios.
@ApiTags('logs')
@ApiBearerAuth()
@Controller('logs')
export class LogPeticionController {
  constructor(private readonly listarLogsUseCase: ListarLogsUseCase) {}

  @ApiOperation({
    summary: 'Ver la bitácora de peticiones HTTP más reciente (solo ADMIN)',
  })
  @Roles(Rol.ADMIN)
  @Get()
  async listar(
    @Query('limite') limite?: string,
  ): Promise<LogPeticionResponseDto[]> {
    const logs = await this.listarLogsUseCase.ejecutar(
      limite ? Number(limite) : undefined,
    );
    return logs.map(LogPeticionResponseDto.fromEntity);
  }
}
