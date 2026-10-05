import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrearMedicamentoUseCase } from '../../application/use-cases/crear-medicamento.use-case';
import { ObtenerMedicamentoUseCase } from '../../application/use-cases/obtener-medicamento.use-case';
import { ListarMedicamentosUseCase } from '../../application/use-cases/listar-medicamentos.use-case';
import { CrearMedicamentoDto } from '../../application/dto/crear-medicamento.dto';
import { MedicamentoResponseDto } from '../../application/dto/medicamento-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@ApiTags('medicamentos')
@Controller('medicamentos')
export class MedicamentoController {
  constructor(
    private readonly crearMedicamentoUseCase: CrearMedicamentoUseCase,
    private readonly obtenerMedicamentoUseCase: ObtenerMedicamentoUseCase,
    private readonly listarMedicamentosUseCase: ListarMedicamentosUseCase,
  ) {}

  // Dar de alta un medicamento en el catálogo es una operación administrativa.
  @ApiOperation({ summary: 'Crear un medicamento en el catálogo (solo ADMIN)' })
  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Post()
  async crear(
    @Body() dto: CrearMedicamentoDto,
  ): Promise<MedicamentoResponseDto> {
    const medicamento = await this.crearMedicamentoUseCase.ejecutar(dto);
    return MedicamentoResponseDto.fromEntity(medicamento);
  }

  // Consultar el catálogo no expone datos sensibles: cualquiera puede ver
  // qué medicamentos existen (la disponibilidad por punto vive en Inventario).
  @ApiOperation({ summary: 'Listar el catálogo de medicamentos (público)' })
  @Public()
  @Get()
  async listar(): Promise<MedicamentoResponseDto[]> {
    const medicamentos = await this.listarMedicamentosUseCase.ejecutar();
    return medicamentos.map(MedicamentoResponseDto.fromEntity);
  }

  @ApiOperation({ summary: 'Obtener un medicamento por id (público)' })
  @Public()
  @Get(':id')
  async obtener(@Param('id') id: string): Promise<MedicamentoResponseDto> {
    const medicamento = await this.obtenerMedicamentoUseCase.ejecutar(id);
    return MedicamentoResponseDto.fromEntity(medicamento);
  }
}
