import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearEntidadMedicaUseCase } from '../../application/use-cases/crear-entidad-medica.use-case';
import { ObtenerEntidadMedicaUseCase } from '../../application/use-cases/obtener-entidad-medica.use-case';
import { ListarEntidadesMedicasUseCase } from '../../application/use-cases/listar-entidades-medicas.use-case';
import { CrearEntidadMedicaDto } from '../../application/dto/crear-entidad-medica.dto';
import { EntidadMedicaResponseDto } from '../../application/dto/entidad-medica-response.dto';
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';

@Controller('entidades-medicas')
export class EntidadMedicaController {
  constructor(
    private readonly crearEntidadMedicaUseCase: CrearEntidadMedicaUseCase,
    private readonly obtenerEntidadMedicaUseCase: ObtenerEntidadMedicaUseCase,
    private readonly listarEntidadesMedicasUseCase: ListarEntidadesMedicasUseCase,
  ) {}

  // Dar de alta una entidad médica es una operación administrativa.
  @Roles(Rol.ADMIN)
  @Post()
  async crear(
    @Body() dto: CrearEntidadMedicaDto,
  ): Promise<EntidadMedicaResponseDto> {
    const entidad = await this.crearEntidadMedicaUseCase.ejecutar(dto);
    return EntidadMedicaResponseDto.fromEntity(entidad);
  }

  // Explorar el catálogo de entidades médicas no expone datos personales
  // ni sensibles, por lo que se mantiene público.
  @Public()
  @Get()
  async listar(): Promise<EntidadMedicaResponseDto[]> {
    const entidades = await this.listarEntidadesMedicasUseCase.ejecutar();
    return entidades.map(EntidadMedicaResponseDto.fromEntity);
  }

  @Public()
  @Get(':id')
  async obtener(@Param('id') id: string): Promise<EntidadMedicaResponseDto> {
    const entidad = await this.obtenerEntidadMedicaUseCase.ejecutar(id);
    return EntidadMedicaResponseDto.fromEntity(entidad);
  }
}
