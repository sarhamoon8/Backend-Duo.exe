import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CrearTurnoUseCase } from './crear-turno.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { ServicioRepository } from '../../../servicios/domain/servicio.repository';
import { Servicio } from '../../../servicios/domain/servicio.entity';
import { PuntoDispensacionRepository } from '../../../puntos-dispensacion/domain/punto-dispensacion.repository';
import { PuntoDispensacion } from '../../../puntos-dispensacion/domain/punto-dispensacion.entity';
import { CrearTurnoDto } from '../dto/crear-turno.dto';
import { EnviarNotificacionUseCase } from '../../../notificaciones/application/use-cases/enviar-notificacion.use-case';

function crearTurnoRepoFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    listarPorUsuario: jest.fn(),
    actualizarEstado: jest.fn(),
    iniciarAtencion: jest.fn(),
    finalizarAtencion: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

function crearUsuarioRepoFalso(
  overrides: Partial<UsuarioRepository> = {},
): jest.Mocked<UsuarioRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorEmail: jest.fn(),
    buscarPorNumeroDocumento: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<UsuarioRepository>;
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

function crearEnviarNotificacionFalso(): jest.Mocked<EnviarNotificacionUseCase> {
  return {
    ejecutar: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<EnviarNotificacionUseCase>;
}

const dto: CrearTurnoDto = { servicioId: 'servicio-1', puntoId: 'punto-1' };

const usuario = new Usuario(
  'usuario-1',
  '123',
  'CC',
  'Ana',
  'Pérez',
  'ana@example.com',
  'hash',
  null,
  Rol.PACIENTE,
  new Date(),
);

const servicioActivo = new Servicio(
  'servicio-1',
  'COD-1',
  'Servicio',
  10,
  true,
  'entidad-1',
);

const puntoMismaEntidad = new PuntoDispensacion(
  'punto-1',
  'entidad-1',
  'Sede',
  'Calle',
  'Bogotá',
  null,
  10,
);

const turnoCreado = new Turno(
  'turno-1',
  'usuario-1',
  'servicio-1',
  'punto-1',
  null,
  'T-ABC123',
  EstadoTurno.PENDIENTE,
  false,
  null,
  null,
  new Date(),
);

describe('CrearTurnoUseCase', () => {
  it('rechaza si el usuario no existe', async () => {
    const turnoRepo = crearTurnoRepoFalso();
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const servicioRepo = crearServicioRepoFalso();
    const puntoRepo = crearPuntoRepoFalso();
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      crearEnviarNotificacionFalso(),
    );

    await expect(
      useCase.ejecutar(dto, 'usuario-inexistente'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(turnoRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el servicio no existe', async () => {
    const turnoRepo = crearTurnoRepoFalso();
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const puntoRepo = crearPuntoRepoFalso();
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      crearEnviarNotificacionFalso(),
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(turnoRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el servicio no está activo', async () => {
    const turnoRepo = crearTurnoRepoFalso();
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(
          new Servicio('servicio-1', 'COD-1', 'Servicio', 10, false, 'entidad-1'),
        ),
    });
    const puntoRepo = crearPuntoRepoFalso();
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      crearEnviarNotificacionFalso(),
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(turnoRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el punto de dispensación no existe', async () => {
    const turnoRepo = crearTurnoRepoFalso();
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicioActivo),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      crearEnviarNotificacionFalso(),
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(turnoRepo.crear).not.toHaveBeenCalled();
  });

  it('rechaza si el punto no pertenece a la misma entidad del servicio', async () => {
    const turnoRepo = crearTurnoRepoFalso();
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicioActivo),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(
          new PuntoDispensacion(
            'punto-1',
            'otra-entidad',
            'Sede',
            'Calle',
            'Bogotá',
            null,
            10,
          ),
        ),
    });
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      crearEnviarNotificacionFalso(),
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(turnoRepo.crear).not.toHaveBeenCalled();
  });

  it('crea el turno con un código alfanumérico generado y notifica al usuario', async () => {
    const turnoRepo = crearTurnoRepoFalso({
      crear: jest.fn().mockResolvedValue(turnoCreado),
    });
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicioActivo),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoMismaEntidad),
    });
    const enviarNotificacion = crearEnviarNotificacionFalso();
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      enviarNotificacion,
    );

    const resultado = await useCase.ejecutar(dto, 'usuario-1');

    expect(turnoRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 'usuario-1',
        servicioId: 'servicio-1',
        puntoId: 'punto-1',
        codigoAlfanumerico: expect.stringMatching(/^T-[A-Z0-9]{6}$/),
      }),
    );
    expect(resultado).toBe(turnoCreado);
    expect(enviarNotificacion.ejecutar).toHaveBeenCalledTimes(1);
  });

  it('la creación del turno no falla si el envío de la notificación falla (no se espera su rechazo)', async () => {
    // EnviarNotificacionUseCase nunca rechaza en producción (ver su propio
    // spec), pero si algo inesperado lo hiciera, CrearTurnoUseCase no debe
    // dejar al cliente sin turno creado por un problema de notificaciones.
    const turnoRepo = crearTurnoRepoFalso({
      crear: jest.fn().mockResolvedValue(turnoCreado),
    });
    const usuarioRepo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const servicioRepo = crearServicioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(servicioActivo),
    });
    const puntoRepo = crearPuntoRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(puntoMismaEntidad),
    });
    const enviarNotificacion = crearEnviarNotificacionFalso();
    enviarNotificacion.ejecutar.mockResolvedValue(undefined);
    const useCase = new CrearTurnoUseCase(
      turnoRepo,
      usuarioRepo,
      servicioRepo,
      puntoRepo,
      enviarNotificacion,
    );

    await expect(useCase.ejecutar(dto, 'usuario-1')).resolves.toBe(
      turnoCreado,
    );
  });
});
