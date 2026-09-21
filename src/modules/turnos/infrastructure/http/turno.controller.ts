import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CrearTurnoUseCase } from '../../application/use-cases/crear-turno.use-case';
import { AvanzarTurnoUseCase } from '../../application/use-cases/avanzar-turno.use-case';
import { CancelarTurnoUseCase } from '../../application/use-cases/cancelar-turno.use-case';
import { ListarTurnosPorPuntoUseCase } from '../../application/use-cases/listar-turnos-por-punto.use-case';
import { ObtenerPosicionTurnoUseCase } from '../../application/use-cases/obtener-posicion-turno.use-case';
import { CrearTurnoDto } from '../../application/dto/crear-turno.dto';
import { AvanzarTurnoDto } from '../../application/dto/avanzar-turno.dto';
import { TurnoResponseDto } from '../../application/dto/turno-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@Controller('turnos')
export class TurnoController {
  constructor(
    private readonly crearTurnoUseCase: CrearTurnoUseCase,
    private readonly avanzarTurnoUseCase: AvanzarTurnoUseCase,
    private readonly cancelarTurnoUseCase: CancelarTurnoUseCase,
    private readonly listarTurnosPorPuntoUseCase: ListarTurnosPorPuntoUseCase,
    private readonly obtenerPosicionTurnoUseCase: ObtenerPosicionTurnoUseCase,
  ) {}

  // El turno siempre se crea a nombre de quien está autenticado: el id
  // se toma del token, nunca del body.
  @Post()
  async crear(
    @Body() dto: CrearTurnoDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<TurnoResponseDto> {
    const turno = await this.crearTurnoUseCase.ejecutar(
      dto,
      request.usuario!.sub,
    );
    const posicion = await this.obtenerPosicionTurnoUseCase.ejecutar(turno);
    return TurnoResponseDto.fromEntity(turno, posicion);
  }

  // Ver la fila de un punto de dispensación (opcionalmente filtrada por
  // servicio) es una vista de personal de atención / administración, no
  // del usuario final.
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Get()
  async listarPorPunto(
    @Query('puntoId') puntoId: string,
    @Query('servicioId') servicioId?: string,
  ): Promise<TurnoResponseDto[]> {
    const turnos = await this.listarTurnosPorPuntoUseCase.ejecutar(
      puntoId,
      servicioId,
    );
    return TurnoResponseDto.fromEntities(turnos);
  }

  // Avanzar el turno (llamar al siguiente / finalizar atención) es una
  // acción exclusiva del personal de atención. ventanillaId es
  // obligatorio solo para llamar un turno PENDIENTE (ver AvanzarTurnoUseCase).
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Patch(':id/avanzar')
  async avanzar(
    @Param('id') id: string,
    @Body() dto: AvanzarTurnoDto,
  ): Promise<TurnoResponseDto> {
    const turno = await this.avanzarTurnoUseCase.ejecutar(
      id,
      dto.ventanillaId,
    );
    const posicion = await this.obtenerPosicionTurnoUseCase.ejecutar(turno);
    return TurnoResponseDto.fromEntity(turno, posicion);
  }

  // Cancelar permite tanto al dueño del turno como al personal de
  // atención/administración; la verificación vive en el caso de uso
  // porque necesita comparar contra el usuarioId del turno.
  @Patch(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<TurnoResponseDto> {
    const turno = await this.cancelarTurnoUseCase.ejecutar(id, {
      id: request.usuario!.sub,
      rol: request.usuario!.rol,
    });
    // Un turno recién cancelado nunca está PENDIENTE, pero se reutiliza
    // el mismo caso de uso para mantener una sola fuente de verdad.
    const posicion = await this.obtenerPosicionTurnoUseCase.ejecutar(turno);
    return TurnoResponseDto.fromEntity(turno, posicion);
  }
}
