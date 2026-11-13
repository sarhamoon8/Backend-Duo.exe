import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CrearProfesionalUseCase } from '../../application/use-cases/crear-profesional.use-case';
import { ListarProfesionalesUseCase } from '../../application/use-cases/listar-profesionales.use-case';
import { ObtenerProfesionalUseCase } from '../../application/use-cases/obtener-profesional.use-case';
import { CrearProfesionalDto } from '../../application/dto/crear-profesional.dto';
import { ProfesionalResponseDto } from '../../application/dto/profesional-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@ApiTags('profesionales')
@Controller('profesionales')
export class ProfesionalController {
  constructor(
    private readonly crearProfesionalUseCase: CrearProfesionalUseCase,
    private readonly listarProfesionalesUseCase: ListarProfesionalesUseCase,
    private readonly obtenerProfesionalUseCase: ObtenerProfesionalUseCase,
  ) {}

  @ApiOperation({ summary: 'Registrar un profesional de salud (solo ADMIN)' })
  @ApiBearerAuth()
  @Roles(Rol.ADMIN)
  @Post()
  async crear(
    @Body() dto: CrearProfesionalDto,
  ): Promise<ProfesionalResponseDto> {
    const profesional = await this.crearProfesionalUseCase.ejecutar(dto);
    return ProfesionalResponseDto.fromEntity(profesional);
  }

  // El listado de profesionales es información de cara al público (qué
  // especialistas atienden en cada sede), por eso no exige sesión.
  @ApiOperation({
    summary: 'Listar profesionales activos, filtrables por sede y especialidad',
  })
  @ApiQuery({ name: 'puntoId', required: false })
  @ApiQuery({ name: 'especialidad', required: false })
  @Public()
  @Get()
  async listar(
    @Query('puntoId') puntoId?: string,
    @Query('especialidad') especialidad?: string,
  ): Promise<ProfesionalResponseDto[]> {
    const profesionales = await this.listarProfesionalesUseCase.ejecutar({
      puntoId,
      especialidad,
    });
    return profesionales.map(ProfesionalResponseDto.fromEntity);
  }

  @ApiOperation({ summary: 'Obtener un profesional por id (público)' })
  @Public()
  @Get(':id')
  async obtener(@Param('id') id: string): Promise<ProfesionalResponseDto> {
    const profesional = await this.obtenerProfesionalUseCase.ejecutar(id);
    return ProfesionalResponseDto.fromEntity(profesional);
  }
}
