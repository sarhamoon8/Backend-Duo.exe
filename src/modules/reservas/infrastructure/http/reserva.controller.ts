import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearReservaUseCase } from '../../application/use-cases/crear-reserva.use-case';
import { ListarMisReservasUseCase } from '../../application/use-cases/listar-mis-reservas.use-case';
import { CancelarReservaUseCase } from '../../application/use-cases/cancelar-reserva.use-case';
import { ReclamarReservaUseCase } from '../../application/use-cases/reclamar-reserva.use-case';
import { CrearReservaDto } from '../../application/dto/crear-reserva.dto';
import { ReservaResponseDto } from '../../application/dto/reserva-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@ApiTags('reservas')
@ApiBearerAuth()
@Controller('reservas')
export class ReservaController {
  constructor(
    private readonly crearReservaUseCase: CrearReservaUseCase,
    private readonly listarMisReservasUseCase: ListarMisReservasUseCase,
    private readonly cancelarReservaUseCase: CancelarReservaUseCase,
    private readonly reclamarReservaUseCase: ReclamarReservaUseCase,
  ) {}

  // RF-07: reservar temporalmente un medicamento disponible.
  @ApiOperation({ summary: 'Reservar un medicamento disponible (24-48h)' })
  @Post()
  async crear(
    @Body() dto: CrearReservaDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.crearReservaUseCase.ejecutar(
      dto,
      request.usuario!.sub,
    );
    return ReservaResponseDto.fromEntity(reserva);
  }

  @ApiOperation({ summary: 'Mis reservas de medicamentos' })
  @Get('mis-reservas')
  async misReservas(
    @Req() request: AuthenticatedRequest,
  ): Promise<ReservaResponseDto[]> {
    const reservas = await this.listarMisReservasUseCase.ejecutar(
      request.usuario!.sub,
    );
    return ReservaResponseDto.fromEntities(reservas);
  }

  @ApiOperation({ summary: 'Cancelar una reserva propia' })
  @Patch(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<ReservaResponseDto> {
    const reserva = await this.cancelarReservaUseCase.ejecutar(
      id,
      request.usuario!.sub,
    );
    return ReservaResponseDto.fromEntity(reserva);
  }

  // Entrega física del medicamento reservado, registrada por el personal
  // del punto de dispensación.
  @ApiOperation({
    summary: 'Marcar una reserva como entregada (FUNCIONARIO/ADMIN)',
  })
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Patch(':id/reclamar')
  async reclamar(@Param('id') id: string): Promise<ReservaResponseDto> {
    const reserva = await this.reclamarReservaUseCase.ejecutar(id);
    return ReservaResponseDto.fromEntity(reserva);
  }
}
