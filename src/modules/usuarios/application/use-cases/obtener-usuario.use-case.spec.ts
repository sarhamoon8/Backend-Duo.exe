import { NotFoundException } from '@nestjs/common';
import { ObtenerUsuarioUseCase } from './obtener-usuario.use-case';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { Usuario } from '../../domain/usuario.entity';
import { Rol } from '../../domain/rol.enum';

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

describe('ObtenerUsuarioUseCase', () => {
  it('devuelve el usuario cuando existe', async () => {
    const repo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(usuario),
    });
    const useCase = new ObtenerUsuarioUseCase(repo);

    await expect(useCase.ejecutar('usuario-1')).resolves.toBe(usuario);
  });

  it('lanza NotFoundException cuando el usuario no existe', async () => {
    const repo = crearUsuarioRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerUsuarioUseCase(repo);

    await expect(useCase.ejecutar('inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
