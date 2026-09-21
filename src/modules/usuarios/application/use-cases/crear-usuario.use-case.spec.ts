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
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<UsuarioRepository>;
}

describe('CrearUsuarioUseCase', () => {
  const dto: CrearUsuarioDto = {
    nombre: 'Ana',
    email: 'ana@example.com',
    password: 'clave123',
  };

  it('rechaza el registro si el email ya existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(
        new Usuario('id-1', 'Ana', dto.email, 'hash', Rol.PACIENTE, new Date()),
      ),
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
      crear: jest.fn().mockImplementation((usuario) =>
        Promise.resolve(
          new Usuario(
            'id-1',
            usuario.nombre,
            usuario.email,
            usuario.password,
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
      crear: jest.fn().mockImplementation((usuario) =>
        Promise.resolve(
          new Usuario(
            'id-1',
            usuario.nombre,
            usuario.email,
            usuario.password,
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
      crear: jest.fn().mockImplementation((usuario) =>
        Promise.resolve(
          new Usuario(
            'id-1',
            usuario.nombre,
            usuario.email,
            usuario.password,
            usuario.rol,
            new Date(),
          ),
        ),
      ),
    });
    const useCase = new CrearUsuarioUseCase(repositorio);

    await useCase.ejecutar({
      nombre: dto.nombre,
      email: dto.email,
      password: dto.password,
      rol: Rol.ADMIN,
    });

    expect(repositorio.crear.mock.calls[0][0].rol).toBe(Rol.ADMIN);
  });
});
