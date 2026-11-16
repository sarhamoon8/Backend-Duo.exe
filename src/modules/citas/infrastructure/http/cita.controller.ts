import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgendarCitaUseCase } from '../../application/use-cases/agendar-cita.use-case';
import { CancelarCitaUseCase } from '../../application/use-cases/cancelar-cita.use-case';
import { ConsultarDisponibilidadUseCase } from '../../application/use-cases/consultar-disponibilidad.use-case';
import { ReprogramarCitaUseCase } from '../../application/use-cases/reprogramar-cita.use-case';
import { ReprogramarCitaDto } from '../../application/dto/reprogramar-cita.dto';
import { ListarMisCitasUseCase } from '../../application/use-cases/listar-mis-citas.use-case';
import { AgendarCitaDto } from '../../application/dto/agendar-cita.dto';
import { ConsultarDisponibilidadDto } from '../../application/dto/consultar-disponibilidad.dto';
import {
  CitaResponseDto,
  DisponibilidadResponseDto,
} from '../../application/dto/cita-response.dto';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

@ApiTags('citas')
@ApiBearerAuth()
@Controller('citas')
export class CitaController {
  constructor(
    private readonly consultarDisponibilidadUseCase: ConsultarDisponibilidadUseCase,
    private readonly agendarCitaUseCase: AgendarCitaUseCase,
    private readonly listarMisCitasUseCase: ListarMisCitasUseCase,
    private readonly cancelarCitaUseCase: CancelarCitaUseCase,
    private readonly reprogramarCitaUseCase: ReprogramarCitaUseCase,
  ) {}

  @ApiOperation({
    summary: 'Horas libres de una especialidad en una sede para una fecha',
  })
  @Get('disponibilidad')
  disponibilidad(
    @Query() query: ConsultarDisponibilidadDto,
  ): Promise<DisponibilidadResponseDto> {
    return this.consultarDisponibilidadUseCase.ejecutar(query);
  }

  @ApiOperation({
    summary:
      'Agendar una cita: el sistema asigna automáticamente un doctor disponible',
  })
  @Post()
  async agendar(
    @Body() dto: AgendarCitaDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<CitaResponseDto> {
    const { cita, profesional } = await this.agendarCitaUseCase.ejecutar(
      dto,
      request.usuario!.sub,
    );
    return CitaResponseDto.fromEntity(cita, profesional);
  }

  @ApiOperation({ summary: 'Mis citas (más recientes primero)' })
  @Get('mis-citas')
  async misCitas(
    @Req() request: AuthenticatedRequest,
  ): Promise<CitaResponseDto[]> {
    const citas = await this.listarMisCitasUseCase.ejecutar(
      request.usuario!.sub,
    );
    return citas.map(({ cita, profesional }) =>
      CitaResponseDto.fromEntity(cita, profesional),
    );
  }

  @ApiOperation({
    summary:
      'Reprogramar una cita a otra hora (mismo doctor si está libre, si no otro disponible)',
  })
  @Patch(':id/reprogramar')
  async reprogramar(
    @Param('id') id: string,
    @Body() dto: ReprogramarCitaDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<CitaResponseDto> {
    const { cita, profesional } = await this.reprogramarCitaUseCase.ejecutar(
      id,
      dto,
      { id: request.usuario!.sub, rol: request.usuario!.rol },
    );
    return CitaResponseDto.fromEntity(cita, profesional);
  }

  @ApiOperation({ summary: 'Cancelar una cita (propia, o cualquiera si eres personal/ADMIN)' })
  @Patch(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<CitaResponseDto> {
    const cita = await this.cancelarCitaUseCase.ejecutar(id, {
      id: request.usuario!.sub,
      rol: request.usuario!.rol,
    });
    return CitaResponseDto.fromEntity(cita, null);
  }
}
