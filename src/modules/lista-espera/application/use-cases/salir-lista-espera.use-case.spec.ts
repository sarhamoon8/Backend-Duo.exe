import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SalirListaEsperaUseCase } from './salir-lista-espera.use-case';
import { ListaEsperaRepository } from '../../domain/lista-espera.repository';
import { ListaEspera } from '../../domain/lista-espera.entity';
import { Rol } from '../../../usuarios/domain/rol.enum';

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

const entrada = new ListaEspera('espera-1', 'usuario-1', 'servicio-1', 'punto-1', new Date());

describe('SalirListaEsperaUseCase', () => {
  it('rechaza si la inscripción no existe', async () => {
    const repo = crearListaEsperaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const useCase = new SalirListaEsperaUseCase(repo);

    await expect(
      useCase.ejecutar('inexistente', { id: 'usuario-1', rol: Rol.PACIENTE }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.eliminar).not.toHaveBeenCalled();
  });

  it('rechaza si un paciente intenta retirar la inscripción de otro usuario', async () => {
    const repo = crearListaEsperaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(entrada),
    });
    const useCase = new SalirListaEsperaUseCase(repo);

    await expect(
      useCase.ejecutar('espera-1', { id: 'otro-usuario', rol: Rol.PACIENTE }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.eliminar).not.toHaveBeenCalled();
  });

  it('permite que el propio paciente salga de su inscripción', async () => {
    const repo = crearListaEsperaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(entrada),
    });
    const useCase = new SalirListaEsperaUseCase(repo);

    await useCase.ejecutar('espera-1', { id: 'usuario-1', rol: Rol.PACIENTE });

    expect(repo.eliminar).toHaveBeenCalledWith('espera-1');
  });

  it('permite que el personal (FUNCIONARIO/ADMIN) retire la inscripción de cualquier usuario', async () => {
    const repo = crearListaEsperaRepoFalso({
      buscarPorId: jest.fn().mockResolvedValue(entrada),
    });
    const useCase = new SalirListaEsperaUseCase(repo);

    await useCase.ejecutar('espera-1', { id: 'funcionario-1', rol: Rol.FUNCIONARIO });

    expect(repo.eliminar).toHaveBeenCalledWith('espera-1');
  });
});
