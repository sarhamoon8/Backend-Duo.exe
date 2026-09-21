import { ConflictException } from '@nestjs/common';
import { CrearUsuarioUseCase } from './crear-usuario.use-case';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { Usuario } from '../../domain/usuario.entity';
import { Rol } from '../../domain/rol.enum';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';

function crearRepositorioFalso(
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

function crearUsuario(
  overrides: Partial<{
    id: string;
    numeroDocumento: string;
    email: string;
    rol: Rol;
  }> = {},
): Usuario {
  return new Usuario(
    overrides.id ?? 'id-1',
    overrides.numeroDocumento ?? '1000000001',
    'CC',
    'Ana',
    'Prueba',
    overrides.email ?? dto.email,
    'hash',
    null,
    overrides.rol ?? Rol.PACIENTE,
    new Date(),
  );
}

const dto: CrearUsuarioDto = {
  numeroDocumento: '1000000001',
  tipoDocumento: 'CC',
  nombres: 'Ana',
  apellidos: 'Prueba',
  email: 'ana@example.com',
  password: 'clave123',
};

describe('CrearUsuarioUseCase', () => {
  it('rechaza el registro si el email ya existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(crearUsuario()),
    });
    const useCase = new CrearUsuarioUseCase(repositorio);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repositorio.crear).not.toHaveBeenCalled();
  });

  it('rechaza el registro si el número de documento ya existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(null),
      buscarPorNumeroDocumento: jest.fn().mockResolvedValue(crearUsuario()),
    });
    const useCase = new CrearUsuarioUseCase(repositorio);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repositorio.crear).not.toHaveBeenCalled();
  });

  it('hashea la contraseña antes de persistir y nunca guarda el texto plano', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(null),
      buscarPorNumeroDocumento: jest.fn().mockResolvedValue(null),
      crear: jest
        .fn()
        .mockImplementation((usuario) =>
          Promise.resolve(
            new Usuario(
              'id-1',
              usuario.numeroDocumento,
              usuario.tipoDocumento,
              usuario.nombres,
              usuario.apellidos,
              usuario.email,
              usuario.password,
              usuario.telefono ?? null,
              usuario.rol,
              new Date(),
            ),
          ),
        ),
    });
    const useCase = new CrearUsuarioUseCase(repositorio);

    await useCase.ejecutar(dto);

    expect(repositorio.crear).toHaveBeenCalledTimes(1);
    const usuarioCreado = repositorio.crear.mock.calls[0][0];
    expect(usuarioCreado.password).not.toBe(dto.password);
    expect(usuarioCreado.password.length).toBeGreaterThan(dto.password.length);
  });

  it('asigna el rol PACIENTE por defecto cuando no se especifica', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(null),
      buscarPorNumeroDocumento: jest.fn().mockResolvedValue(null),
      crear: jest
        .fn()
        .mockImplementation((usuario) =>
          Promise.resolve(
            new Usuario(
              'id-1',
              usuario.numeroDocumento,
              usuario.tipoDocumento,
              usuario.nombres,
              usuario.apellidos,
              usuario.email,
              usuario.password,
              usuario.telefono ?? null,
              usuario.rol,
              new Date(),
            ),
          ),
        ),
    });
    const useCase = new CrearUsuarioUseCase(repositorio);

    await useCase.ejecutar(dto);

    expect(repositorio.crear.mock.calls[0][0].rol).toBe(Rol.PACIENTE);
  });

  it('respeta el rol explícito del dto', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(null),
      buscarPorNumeroDocumento: jest.fn().mockResolvedValue(null),
      crear: jest
        .fn()
        .mockImplementation((usuario) =>
          Promise.resolve(
            new Usuario(
              'id-1',
              usuario.numeroDocumento,
              usuario.tipoDocumento,
              usuario.nombres,
              usuario.apellidos,
              usuario.email,
              usuario.password,
              usuario.telefono ?? null,
              usuario.rol,
              new Date(),
            ),
          ),
        ),
    });
    const useCase = new CrearUsuarioUseCase(repositorio);

    await useCase.ejecutar({
      numeroDocumento: dto.numeroDocumento,
      tipoDocumento: dto.tipoDocumento,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      email: dto.email,
      password: dto.password,
      rol: Rol.ADMIN,
    });

    expect(repositorio.crear.mock.calls[0][0].rol).toBe(Rol.ADMIN);
  });
});
