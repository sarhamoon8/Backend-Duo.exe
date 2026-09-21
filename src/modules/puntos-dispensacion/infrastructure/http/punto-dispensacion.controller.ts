import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CrearPuntoDispensacionUseCase } from '../../application/use-cases/crear-punto-dispensacion.use-case';
import { ObtenerPuntoDispensacionUseCase } from '../../application/use-cases/obtener-punto-dispensacion.use-case';
import { ListarPuntosDispensacionUseCase } from '../../application/use-cases/listar-puntos-dispensacion.use-case';
import { CrearPuntoDispensacionDto } from '../../application/dto/crear-punto-dispensacion.dto';
import { PuntoDispensacionResponseDto } from '../../application/dto/punto-dispensacion-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@Controller('puntos-dispensacion')
export class PuntoDispensacionController {
  constructor(
    private readonly crearPuntoDispensacionUseCase: CrearPuntoDispensacionUseCase,
    private readonly obtenerPuntoDispensacionUseCase: ObtenerPuntoDispensacionUseCase,
    private readonly listarPuntosDispensacionUseCase: ListarPuntosDispensacionUseCase,
  ) {}

  // Dar de alta una sede física es una operación administrativa.
  @Roles(Rol.ADMIN)
  @Post()
  async crear(
    @Body() dto: CrearPuntoDispensacionDto,
  ): Promise<PuntoDispensacionResponseDto> {
    const punto = await this.crearPuntoDispensacionUseCase.ejecutar(dto);
    return PuntoDispensacionResponseDto.fromEntity(punto);
  }

  // Explorar las sedes disponibles no expone datos sensibles.
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

  @Public()
  @Get(':id')
  async obtener(
    @Param('id') id: string,
  ): Promise<PuntoDispensacionResponseDto> {
    const punto = await this.obtenerPuntoDispensacionUseCase.ejecutar(id);
    return PuntoDispensacionResponseDto.fromEntity(punto);
  }
}
