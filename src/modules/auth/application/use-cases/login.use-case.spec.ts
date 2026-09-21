import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { LoginDto } from '../dto/login.dto';

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

function crearUsuario(email: string, passwordHash: string): Usuario {
  return new Usuario(
    'id-1',
    '1000000001',
    'CC',
    'Ana',
    'Prueba',
    email,
    passwordHash,
    null,
    Rol.PACIENTE,
    new Date(),
  );
}

describe('LoginUseCase', () => {
  const dto: LoginDto = { email: 'ana@example.com', password: 'clave123' };
  const jwtServiceFalso = {
    signAsync: jest.fn().mockResolvedValue('token-firmado'),
  } as unknown as JwtService;

  it('rechaza el login si el usuario no existe, sin distinguir el motivo', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest.fn().mockResolvedValue(null),
    });
    const useCase = new LoginUseCase(repositorio, jwtServiceFalso);

    await expect(useCase.ejecutar(dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza el login si la contraseña no coincide', async () => {
    const hashReal = await bcrypt.hash('otra-clave', 10);
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest
        .fn()
        .mockResolvedValue(crearUsuario(dto.email, hashReal)),
    });
    const useCase = new LoginUseCase(repositorio, jwtServiceFalso);

    await expect(useCase.ejecutar(dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('emite un token cuando las credenciales son correctas', async () => {
    const hashReal = await bcrypt.hash(dto.password, 10);
    const repositorio = crearRepositorioFalso({
      buscarPorEmail: jest
        .fn()
        .mockResolvedValue(crearUsuario(dto.email, hashReal)),
    });
    const useCase = new LoginUseCase(repositorio, jwtServiceFalso);

    const resultado = await useCase.ejecutar(dto);

    expect(resultado.accessToken).toBe('token-firmado');
    expect(jwtServiceFalso.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'id-1', email: dto.email, rol: Rol.PACIENTE }),
    );
  });
});
