import { ListarProfesionalesUseCase } from './listar-profesionales.use-case';
import { ProfesionalRepository } from '../../domain/profesional.repository';
import { Profesional } from '../../domain/profesional.entity';

function crearProfesionalRepoFalso(
  overrides: Partial<ProfesionalRepository> = {},
): jest.Mocked<ProfesionalRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorRegistroMedico: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<ProfesionalRepository>;
}

const profesional = new Profesional(
  'prof-1',
  'RM-001',
  'Ana',
  'Pérez',
  'Medicina General',
  true,
  'punto-1',
);

describe('ListarProfesionalesUseCase', () => {
  it('delega al repositorio sin filtro', async () => {
    const repo = crearProfesionalRepoFalso({
      listar: jest.fn().mockResolvedValue([profesional]),
    });
    const useCase = new ListarProfesionalesUseCase(repo);

    const resultado = await useCase.ejecutar();

    expect(repo.listar).toHaveBeenCalledWith(undefined);
    expect(resultado).toEqual([profesional]);
  });

  it('delega al repositorio con el filtro recibido', async () => {
    const filtro = { puntoId: 'punto-1', especialidad: 'Pediatría' };
    const repo = crearProfesionalRepoFalso({
      listar: jest.fn().mockResolvedValue([]),
    });
    const useCase = new ListarProfesionalesUseCase(repo);

    await useCase.ejecutar(filtro);

    expect(repo.listar).toHaveBeenCalledWith(filtro);
  });
});
