import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CrearTurnoUseCase } from '../../application/use-cases/crear-turno.use-case';
import { AvanzarTurnoUseCase } from '../../application/use-cases/avanzar-turno.use-case';
import { CancelarTurnoUseCase } from '../../application/use-cases/cancelar-turno.use-case';
import { ListarTurnosPorServicioUseCase } from '../../application/use-cases/listar-turnos-por-servicio.use-case';
import { ObtenerPosicionTurnoUseCase } from '../../application/use-cases/obtener-posicion-turno.use-case';
import { CrearTurnoDto } from '../../application/dto/crear-turno.dto';
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
    private readonly listarTurnosPorServicioUseCase: ListarTurnosPorServicioUseCase,
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

  // Ver la fila completa de un servicio es una vista de personal de
  // atención / administración, no del usuario final.
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Get('servicio/:servicioId')
  async listarPorServicio(
    @Param('servicioId') servicioId: string,
  ): Promise<TurnoResponseDto[]> {
    const turnos =
      await this.listarTurnosPorServicioUseCase.ejecutar(servicioId);
    return TurnoResponseDto.fromEntities(turnos);
  }

  // Avanzar el turno (llamar al siguiente) es una acción exclusiva del
  // personal de atención.
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Patch(':id/avanzar')
  async avanzar(@Param('id') id: string): Promise<TurnoResponseDto> {
    const turno = await this.avanzarTurnoUseCase.ejecutar(id);
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
