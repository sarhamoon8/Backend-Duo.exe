import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CrearTurnoUseCase } from '../../application/use-cases/crear-turno.use-case';
import { AvanzarTurnoUseCase } from '../../application/use-cases/avanzar-turno.use-case';
import { CancelarTurnoUseCase } from '../../application/use-cases/cancelar-turno.use-case';
import { ListarTurnosPorServicioUseCase } from '../../application/use-cases/listar-turnos-por-servicio.use-case';
import { CrearTurnoDto } from '../../application/dto/crear-turno.dto';
import { TurnoResponseDto } from '../../application/dto/turno-response.dto';

@Controller('turnos')
export class TurnoController {
  constructor(
    private readonly crearTurnoUseCase: CrearTurnoUseCase,
    private readonly avanzarTurnoUseCase: AvanzarTurnoUseCase,
    private readonly cancelarTurnoUseCase: CancelarTurnoUseCase,
    private readonly listarTurnosPorServicioUseCase: ListarTurnosPorServicioUseCase,
  ) {}

  @Post()
  async crear(@Body() dto: CrearTurnoDto): Promise<TurnoResponseDto> {
    const turno = await this.crearTurnoUseCase.ejecutar(dto);
    return TurnoResponseDto.fromEntity(turno);
  }

  @Get('servicio/:servicioId')
  async listarPorServicio(
    @Param('servicioId') servicioId: string,
  ): Promise<TurnoResponseDto[]> {
    const turnos =
      await this.listarTurnosPorServicioUseCase.ejecutar(servicioId);
    return turnos.map(TurnoResponseDto.fromEntity);
  }

  @Patch(':id/avanzar')
  async avanzar(@Param('id') id: string): Promise<TurnoResponseDto> {
    const turno = await this.avanzarTurnoUseCase.ejecutar(id);
    return TurnoResponseDto.fromEntity(turno);
  }

  @Patch(':id/cancelar')
  async cancelar(@Param('id') id: string): Promise<TurnoResponseDto> {
    const turno = await this.cancelarTurnoUseCase.ejecutar(id);
    return TurnoResponseDto.fromEntity(turno);
  }
}
