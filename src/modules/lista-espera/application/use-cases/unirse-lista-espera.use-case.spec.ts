import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UnirseListaEsperaUseCase } from './unirse-lista-espera.use-case';
import { ListaEsperaRepository } from '../../domain/lista-espera.repository';
import { ListaEspera } from '../../domain/lista-espera.entity';
import { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { Servicio } from '../../../servicios/domain/servicio.entity';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../../puntos-dispensacion/domain/punto-dispensacion.entity';
import { UnirseListaEsperaDto } from '../dto/unirse-lista-espera.dto';

function crearListaEsperaRepoFalso(
  overrides: Partial<ListaEsperaRepository> = {},
): jest.Mocked<ListaEsperaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorUsuario: jest.fn(),
    listarPorServicioYPunto: jest.fn(),
    obtenerPrimero: jest.fn(),
    contarAntes: jest.fn(),
    eliminar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ListaEsperaRepository>;
}

function crearServicioRepoFalso(
  overrides: Partial<ServicioRepository> = {},
): jest.Mocked<ServicioRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCodigo: jest.fn(),
    listarPorEntidad: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ServicioRepository>;
}

function crearPuntoRepoFalso(
  overrides: Partial<PuntoDispensacionRepository> = {},
): jest.Mocked<PuntoDispensacionRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorEntidad: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<PuntoDispensacionRepository>;
}

const dto: UnirseListaEsperaDto = {
  servicioId: 'servicio-1',
  puntoId: 'punto-1',
};

const servicioActivo = new Servicio('servicio-1', 'COD-1', 'Servicio', 10, true, 'entidad-1');
const puntoMismaEntidad = new PuntoDispensacion('punto-1', 'entidad-1', 'Sede', 'Calle', 'Bogotá', null, 10);

describe('UnirseListaEsperaUseCase', () => {
  it('rechaza si el servicio no existe', async () => {
    const listaEsperaRepo = crearListaEsperaRepoFalso();
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const puntoRepo = crearPuntoRepoFalso();
    const useCase = new UnirseListaEsperaUseCase(
      listaEsperaRepo,
      servicioRepo,
      puntoRepo,
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(listaEsperaRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el servicio no está activo', async () => {
    const listaEsperaRepo = crearListaEsperaRepoFalso();
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(
          new Servicio('servicio-1', 'COD-1', 'Servicio', 10, false, 'entidad-1'),
        ),
    });
    const puntoRepo = crearPuntoRepoFalso();
    const useCase = new UnirseListaEsperaUseCase(
      listaEsperaRepo,
      servicioRepo,
      puntoRepo,
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rechaza si el punto no pertenece a la misma entidad del servicio', async () => {
    const listaEsperaRepo = crearListaEsperaRepoFalso();
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicioActivo),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(
          new PuntoDispensacion('punto-1', 'otra-entidad', 'Sede', 'Calle', 'Bogotá', null, 10),
        ),
    });
    const useCase = new UnirseListaEsperaUseCase(
      listaEsperaRepo,
      servicioRepo,
      puntoRepo,
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('crea la inscripción cuando todo es válido', async () => {
    const listaEsperaRepo = crearListaEsperaRepoFalso({
      crear: jest
        .fn()
        .mockResolvedValue(
          new ListaEspera('espera-1', 'usuario-1', 'servicio-1', 'punto-1', new Date()),
        ),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicioActivo),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoMismaEntidad),
    });
    const useCase = new UnirseListaEsperaUseCase(
      listaEsperaRepo,
      servicioRepo,
      puntoRepo,
    );

    const resultado = await useCase.ejecutar(dto, 'usuario-1');

    expect(listaEsperaRepo.crear).toHaveBeenCalledWith({
      usuarioId: 'usuario-1',
      servicioId: 'servicio-1',
      puntoId: 'punto-1',
    });
    expect(resultado.usuarioId).toBe('usuario-1');
  });
});
