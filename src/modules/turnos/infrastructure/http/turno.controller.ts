import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearTurnoUseCase } from '../../application/use-cases/crear-turno.use-case';
import { AvanzarTurnoUseCase } from '../../application/use-cases/avanzar-turno.use-case';
import { CancelarTurnoUseCase } from '../../application/use-cases/cancelar-turno.use-case';
import { ListarTurnosPorPuntoUseCase } from '../../application/use-cases/listar-turnos-por-punto.use-case';
import { ListarMisTurnosUseCase } from '../../application/use-cases/listar-mis-turnos.use-case';
import { ObtenerTurnoUseCase } from '../../application/use-cases/obtener-turno.use-case';
import { ObtenerPosicionTurnoUseCase } from '../../application/use-cases/obtener-posicion-turno.use-case';
import { CrearTurnoDto } from '../../application/dto/crear-turno.dto';
import { AvanzarTurnoDto } from '../../application/dto/avanzar-turno.dto';
import { TurnoResponseDto } from '../../application/dto/turno-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@ApiTags('turnos')
@ApiBearerAuth()
@Controller('turnos')
export class TurnoController {
  constructor(
    private readonly crearTurnoUseCase: CrearTurnoUseCase,
    private readonly avanzarTurnoUseCase: AvanzarTurnoUseCase,
    private readonly cancelarTurnoUseCase: CancelarTurnoUseCase,
    private readonly listarTurnosPorPuntoUseCase: ListarTurnosPorPuntoUseCase,
    private readonly listarMisTurnosUseCase: ListarMisTurnosUseCase,
    private readonly obtenerTurnoUseCase: ObtenerTurnoUseCase,
    private readonly obtenerPosicionTurnoUseCase: ObtenerPosicionTurnoUseCase,
  ) {}

  // El turno siempre se crea a nombre de quien está autenticado: el id
  // se toma del token, nunca del body.
  @ApiOperation({ summary: 'Solicitar un turno para el usuario autenticado' })
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

  // "La cara" de FilaCero para el paciente: sus propios turnos, con
  // posición calculada, sin necesitar rol de personal.
  @ApiOperation({
    summary: 'Mis turnos',
    description:
      'Turnos del usuario autenticado (cualquier estado), más reciente primero, con la posición en fila cuando aplica.',
  })
  @Get('mis-turnos')
  async misTurnos(
    @Req() request: AuthenticatedRequest,
  ): Promise<TurnoResponseDto[]> {
    const turnos = await this.listarMisTurnosUseCase.ejecutar(
      request.usuario!.sub,
    );
    return Promise.all(
      turnos.map(async (turno) => {
        const posicion = await this.obtenerPosicionTurnoUseCase.ejecutar(
          turno,
        );
        return TurnoResponseDto.fromEntity(turno, posicion);
      }),
    );
  }

  // Ver la fila de un punto de dispensación (opcionalmente filtrada por
  // servicio) es una vista de personal de atención / administración, no
  // del usuario final.
  @ApiOperation({
    summary: 'Ver la fila de un punto de dispensación (FUNCIONARIO/ADMIN)',
  })
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

  // Consultar un turno puntual: el dueño o personal/administración.
  @ApiOperation({ summary: 'Obtener un turno por id (propio o personal/ADMIN)' })
  @Get(':id')
  async obtener(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<TurnoResponseDto> {
    const turno = await this.obtenerTurnoUseCase.ejecutar(id);

    const solicitante = request.usuario!;
    const esPropio = turno.usuarioId === solicitante.sub;
    const esStaff =
      solicitante.rol === Rol.FUNCIONARIO || solicitante.rol === Rol.ADMIN;
    if (!esPropio && !esStaff) {
      throw new ForbiddenException('No puedes consultar el turno de otro usuario');
    }

    const posicion = await this.obtenerPosicionTurnoUseCase.ejecutar(turno);
    return TurnoResponseDto.fromEntity(turno, posicion);
  }

  // Avanzar el turno (llamar al siguiente / finalizar atención) es una
  // acción exclusiva del personal de atención. ventanillaId es
  // obligatorio solo para llamar un turno PENDIENTE (ver AvanzarTurnoUseCase).
  @ApiOperation({
    summary: 'Avanzar el estado del turno (FUNCIONARIO/ADMIN)',
    description:
      'PENDIENTE→EN_CURSO requiere ventanillaId en el body; EN_CURSO→ATENDIDO no lo requiere.',
  })
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
  @ApiOperation({ summary: 'Cancelar un turno (propio o personal/ADMIN)' })
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
