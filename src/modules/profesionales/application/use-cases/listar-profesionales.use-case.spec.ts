import { ListarProfesionalesUseCase } from './listar-profesionales.use-case';
import { ProfesionalRepository } from '../../domain/profesional.repository';

describe('ListarProfesionalesUseCase', () => {
  it('delega el filtro al repositorio', async () => {
    const repositorio = {
      crear: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorRegistroMedico: jest.fn(),
      listar: jest.fn().mockResolvedValue([]),
    } as jest.Mocked<ProfesionalRepository>;
    const useCase = new ListarProfesionalesUseCase(repositorio);

    await useCase.ejecutar({ puntoId: 'p-1', especialidad: 'Pediatría' });

    expect(repositorio.listar).toHaveBeenCalledWith({
      puntoId: 'p-1',
      especialidad: 'Pediatría',
    });
  });
});
