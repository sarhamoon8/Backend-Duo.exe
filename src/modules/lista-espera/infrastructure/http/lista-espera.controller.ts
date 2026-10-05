import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnirseListaEsperaUseCase } from '../../application/use-cases/unirse-lista-espera.use-case';
import { SalirListaEsperaUseCase } from '../../application/use-cases/salir-lista-espera.use-case';
import { ListarMiListaEsperaUseCase } from '../../application/use-cases/listar-mi-lista-espera.use-case';
import { ListarListaEsperaPorPuntoUseCase } from '../../application/use-cases/listar-lista-espera-por-punto.use-case';
import { ObtenerPosicionListaEsperaUseCase } from '../../application/use-cases/obtener-posicion-lista-espera.use-case';
import { UnirseListaEsperaDto } from '../../application/dto/unirse-lista-espera.dto';
import { ListaEsperaResponseDto } from '../../application/dto/lista-espera-response.dto';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Rol } from '../../../usuarios/domain/rol.enum';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

// RF-04: un paciente se inscribe en la lista de espera de un servicio+punto
// (sin pedir turno todavía). Cuando alguien cancela un turno PENDIENTE de
// esa misma fila, ReasignarDesdeListaEsperaUseCase (en el módulo turnos)
// toma automáticamente al primero de esta lista y le crea un turno real.
@ApiTags('lista-espera')
@ApiBearerAuth()
@Controller('lista-espera')
export class ListaEsperaController {
  constructor(
    private readonly unirseListaEsperaUseCase: UnirseListaEsperaUseCase,
    private readonly salirListaEsperaUseCase: SalirListaEsperaUseCase,
    private readonly listarMiListaEsperaUseCase: ListarMiListaEsperaUseCase,
    private readonly listarListaEsperaPorPuntoUseCase: ListarListaEsperaPorPuntoUseCase,
    private readonly obtenerPosicionListaEsperaUseCase: ObtenerPosicionListaEsperaUseCase,
  ) {}

  @ApiOperation({ summary: 'Unirse a la lista de espera de un servicio+punto' })
  @Post()
  async unirse(
    @Body() dto: UnirseListaEsperaDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ListaEsperaResponseDto> {
    const entrada = await this.unirseListaEsperaUseCase.ejecutar(
      dto,
      request.usuario!.sub,
    );
    const posicion = await this.obtenerPosicionListaEsperaUseCase.ejecutar(
      entrada,
    );
    return ListaEsperaResponseDto.fromEntity(entrada, posicion);
  }

  @ApiOperation({ summary: 'Mis inscripciones en listas de espera' })
  @Get('mis-inscripciones')
  async misInscripciones(
    @Req() request: AuthenticatedRequest,
  ): Promise<ListaEsperaResponseDto[]> {
    const entradas = await this.listarMiListaEsperaUseCase.ejecutar(
      request.usuario!.sub,
    );
    return Promise.all(
      entradas.map(async (entrada) => {
        const posicion = await this.obtenerPosicionListaEsperaUseCase.ejecutar(
          entrada,
        );
        return ListaEsperaResponseDto.fromEntity(entrada, posicion);
      }),
    );
  }

  @ApiOperation({
    summary: 'Ver la lista de espera de un servicio+punto (FUNCIONARIO/ADMIN)',
  })
  @Roles(Rol.FUNCIONARIO, Rol.ADMIN)
  @Get()
  async listarPorPunto(
    @Query('servicioId') servicioId: string,
    @Query('puntoId') puntoId: string,
  ): Promise<ListaEsperaResponseDto[]> {
    const entradas = await this.listarListaEsperaPorPuntoUseCase.ejecutar(
      servicioId,
      puntoId,
    );
    return Promise.all(
      entradas.map(async (entrada) => {
        const posicion = await this.obtenerPosicionListaEsperaUseCase.ejecutar(
          entrada,
        );
        return ListaEsperaResponseDto.fromEntity(entrada, posicion);
      }),
    );
  }

  // DELETE, no PATCH: a diferencia de un turno (que siempre se conserva
  // como historial cambiando su estado), una inscripción en lista de
  // espera no tiene valor histórico propio una vez resuelta — o se
  // promovió a un turno real, o el usuario cambió de idea. No hay nada
  // que conservar.
  @ApiOperation({ summary: 'Salir de una lista de espera (propio o personal/ADMIN)' })
  @Delete(':id')
  async salir(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    await this.salirListaEsperaUseCase.ejecutar(id, {
      id: request.usuario!.sub,
      rol: request.usuario!.rol,
    });
  }
}
