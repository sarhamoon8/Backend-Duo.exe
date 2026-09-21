import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearVentanillaUseCase } from '../../application/use-cases/crear-ventanilla.use-case';
import { ListarVentanillasPorPuntoUseCase } from '../../application/use-cases/listar-ventanillas-por-punto.use-case';
import { CrearVentanillaDto } from '../../application/dto/crear-ventanilla.dto';
import { VentanillaResponseDto } from '../../application/dto/ventanilla-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

// A diferencia de entidades-medicas/servicios/puntos-dispensacion (catálogo
// visible para el usuario final), las ventanillas son información operativa
// interna: a qué módulo está llamando el personal de atención. Todo el
// controlador queda restringido a personal de atención/administración.
@ApiTags('ventanillas')
@ApiBearerAuth()
@Roles(Rol.FUNCIONARIO, Rol.ADMIN)
@Controller('ventanillas')
export class VentanillaController {
  constructor(
    private readonly crearVentanillaUseCase: CrearVentanillaUseCase,
    private readonly listarVentanillasPorPuntoUseCase: ListarVentanillasPorPuntoUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear una ventanilla en un punto de dispensación' })
  @Post()
  async crear(
    @Body() dto: CrearVentanillaDto,
  ): Promise<VentanillaResponseDto> {
    const ventanilla = await this.crearVentanillaUseCase.ejecutar(dto);
    return VentanillaResponseDto.fromEntity(ventanilla);
  }

  @ApiOperation({ summary: 'Listar las ventanillas de un punto de dispensación' })
  @Get()
  async listarPorPunto(
    @Query('puntoId') puntoId: string,
  ): Promise<VentanillaResponseDto[]> {
    const ventanillas =
      await this.listarVentanillasPorPuntoUseCase.ejecutar(puntoId);
    return ventanillas.map(VentanillaResponseDto.fromEntity);
  }
}
