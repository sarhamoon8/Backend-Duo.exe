import { ActualizarPerfilSaludUseCase } from './actualizar-perfil-salud.use-case';
import { PerfilSaludRepository } from '../../domain/perfil-salud.repository';
import { PerfilSalud } from '../../domain/perfil-salud.entity';
import { ActualizarPerfilSaludDto } from '../dto/actualizar-perfil-salud.dto';

function crearPerfilSaludRepoFalso(
  overrides: Partial<PerfilSaludRepository> = {},
): jest.Mocked<PerfilSaludRepository> {
  return {
    buscarPorUsuario: jest.fn(),
    actualizar: jest.fn(),
    ...overrides,
  } as jest.Mocked<PerfilSaludRepository>;
}

describe('ActualizarPerfilSaludUseCase', () => {
  it('delega el upsert al repositorio con el usuario autenticado', async () => {
    const dto: ActualizarPerfilSaludDto = {
      grupoSanguineo: 'O+',
      alergias: 'Penicilina',
    };
    const actualizado = new PerfilSalud(
      'perfil-1',
      'usuario-1',
      'O+',
      'Penicilina',
      null,
      null,
      null,
      new Date(),
    );
    const repo = crearPerfilSaludRepoFalso({
      actualizar: jest.fn().mockResolvedValue(actualizado),
    });
    const useCase = new ActualizarPerfilSaludUseCase(repo);

    const resultado = await useCase.ejecutar(dto, 'usuario-1');

    expect(repo.actualizar).toHaveBeenCalledWith('usuario-1', dto);
    expect(resultado).toBe(actualizado);
  });
});
