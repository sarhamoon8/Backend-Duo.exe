import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearPuntoDispensacionUseCase } from '../../application/use-cases/crear-punto-dispensacion.use-case';
import { ObtenerPuntoDispensacionUseCase } from '../../application/use-cases/obtener-punto-dispensacion.use-case';
import { ListarPuntosDispensacionUseCase } from '../../application/use-cases/listar-puntos-dispensacion.use-case';
import { CrearPuntoDispensacionDto } from '../../application/dto/crear-punto-dispensacion.dto';
import { PuntoDispensacionResponseDto } from '../../application/dto/punto-dispensacion-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@ApiTags('puntos-dispensacion')
@Controller('puntos-dispensacion')
export class PuntoDispensacionController {
  constructor(
    private readonly crearPuntoDispensacionUseCase: CrearPuntoDispensacionUseCase,
    private readonly obtenerPuntoDispensacionUseCase: ObtenerPuntoDispensacionUseCase,
    private readonly listarPuntosDispensacionUseCase: ListarPuntosDispensacionUseCase,
  ) {}

  // Dar de alta una sede física es una operación administrativa.
  @ApiOperation({ summary: 'Crear un punto de dispensación (solo ADMIN)' })
  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Post()
  async crear(
    @Body() dto: CrearPuntoDispensacionDto,
  ): Promise<PuntoDispensacionResponseDto> {
    const punto = await this.crearPuntoDispensacionUseCase.ejecutar(dto);
    return PuntoDispensacionResponseDto.fromEntity(punto);
  }

  // Explorar las sedes disponibles no expone datos sensibles.
  @ApiOperation({
    summary: 'Listar puntos de dispensación, opcionalmente por entidad (público)',
  })
  @Public()
  @Get()
  async listar(
    @Query('entidadId') entidadId?: string,
  ): Promise<PuntoDispensacionResponseDto[]> {
    const puntos = await this.listarPuntosDispensacionUseCase.ejecutar(
      entidadId,
    );
    return puntos.map(PuntoDispensacionResponseDto.fromEntity);
  }

  @ApiOperation({ summary: 'Obtener un punto de dispensación por id (público)' })
  @Public()
  @Get(':id')
  async obtener(
    @Param('id') id: string,
  ): Promise<PuntoDispensacionResponseDto> {
    const punto = await this.obtenerPuntoDispensacionUseCase.ejecutar(id);
    return PuntoDispensacionResponseDto.fromEntity(punto);
  }
}
