import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CrearServicioUseCase } from '../../application/use-cases/crear-servicio.use-case';
import { ObtenerServicioUseCase } from '../../application/use-cases/obtener-servicio.use-case';
import { ListarServiciosUseCase } from '../../application/use-cases/listar-servicios.use-case';
import { CrearServicioDto } from '../../application/dto/crear-servicio.dto';
import { ServicioResponseDto } from '../../application/dto/servicio-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@Controller('servicios')
export class ServicioController {
  constructor(
    private readonly crearServicioUseCase: CrearServicioUseCase,
    private readonly obtenerServicioUseCase: ObtenerServicioUseCase,
    private readonly listarServiciosUseCase: ListarServiciosUseCase,
  ) {}

  // Dar de alta un servicio es una operación administrativa.
  @Roles(Rol.ADMIN)
  @Post()
  async crear(@Body() dto: CrearServicioDto): Promise<ServicioResponseDto> {
    const servicio = await this.crearServicioUseCase.ejecutar(dto);
    return ServicioResponseDto.fromEntity(servicio);
  }

  // Explorar los servicios disponibles no expone datos sensibles.
  @Public()
  @Get()
  async listar(
    @Query('entidadId') entidadId?: string,
  ): Promise<ServicioResponseDto[]> {
    const servicios = await this.listarServiciosUseCase.ejecutar(entidadId);
    return servicios.map(ServicioResponseDto.fromEntity);
  }

  @Public()
  @Get(':id')
  async obtener(@Param('id') id: string): Promise<ServicioResponseDto> {
    const servicio = await this.obtenerServicioUseCase.ejecutar(id);
    return ServicioResponseDto.fromEntity(servicio);
  }
}
