import { ListarUsuariosUseCase } from './listar-usuarios.use-case';
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

describe('ListarUsuariosUseCase', () => {
  it('delega en usuarioRepository.listar', async () => {
    const repo = crearUsuarioRepoFalso({
      listar: jest.fn().mockResolvedValue([usuario]),
    });
    const useCase = new ListarUsuariosUseCase(repo);

    await expect(useCase.ejecutar()).resolves.toEqual([usuario]);
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });
});
