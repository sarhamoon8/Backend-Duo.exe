import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearInventarioUseCase } from '../../application/use-cases/crear-inventario.use-case';
import { ListarInventarioPorPuntoUseCase } from '../../application/use-cases/listar-inventario-por-punto.use-case';
import { CrearInventarioDto } from '../../application/dto/crear-inventario.dto';
import { InventarioResponseDto } from '../../application/dto/inventario-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@ApiTags('inventario')
@Controller('inventario')
export class InventarioController {
  constructor(
    private readonly crearInventarioUseCase: CrearInventarioUseCase,
    private readonly listarInventarioPorPuntoUseCase: ListarInventarioPorPuntoUseCase,
  ) {}

  // Registrar/actualizar existencias es tarea del personal de atención o
  // administración de ese punto, no del paciente.
  @ApiOperation({
    summary:
      'Registrar un lote de un medicamento en el inventario de un punto (FUNCIONARIO/ADMIN)',
  })
  @ApiBearerAuth()
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Post()
  async crear(@Body() dto: CrearInventarioDto): Promise<InventarioResponseDto> {
    const inventario = await this.crearInventarioUseCase.ejecutar(dto);
    return InventarioResponseDto.fromEntity(inventario);
  }

  // RF-06: un paciente debe poder consultar si un medicamento está
  // disponible en un punto, sin necesitar sesión.
  @ApiOperation({
    summary:
      'Consultar disponibilidad de medicamentos en un punto (público; medicamentoId opcional)',
  })
  @Public()
  @Get()
  async listarPorPunto(
    @Query('puntoId') puntoId: string,
    @Query('medicamentoId') medicamentoId?: string,
  ): Promise<InventarioResponseDto[]> {
    const inventario = await this.listarInventarioPorPuntoUseCase.ejecutar(
      puntoId,
      medicamentoId,
    );
    return inventario.map(InventarioResponseDto.fromEntity);
  }
}
