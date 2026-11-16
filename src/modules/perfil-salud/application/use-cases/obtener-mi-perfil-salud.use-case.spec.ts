import { ObtenerMiPerfilSaludUseCase } from './obtener-mi-perfil-salud.use-case';
import { PerfilSaludRepository } from '../../domain/perfil-salud.repository';
import { PerfilSalud } from '../../domain/perfil-salud.entity';

function crearPerfilSaludRepoFalso(
  overrides: Partial<PerfilSaludRepository> = {},
): jest.Mocked<PerfilSaludRepository> {
  return {
    buscarPorUsuario: jest.fn(),
    actualizar: jest.fn(),
    ...overrides,
  } as jest.Mocked<PerfilSaludRepository>;
}

describe('ObtenerMiPerfilSaludUseCase', () => {
  it('devuelve null si el usuario no tiene perfil registrado', async () => {
    const repo = crearPerfilSaludRepoFalso({
      buscarPorUsuario: jest.fn().mockResolvedValue(null),
    });
    const useCase = new ObtenerMiPerfilSaludUseCase(repo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(resultado).toBeNull();
  });

  it('devuelve el perfil del usuario cuando existe', async () => {
    const perfil = new PerfilSalud(
      'perfil-1',
      'usuario-1',
      'O+',
      'Penicilina',
      null,
      'Contacto',
      '3000000000',
      new Date(),
    );
    const repo = crearPerfilSaludRepoFalso({
      buscarPorUsuario: jest.fn().mockResolvedValue(perfil),
    });
    const useCase = new ObtenerMiPerfilSaludUseCase(repo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(resultado).toBe(perfil);
  });
});
