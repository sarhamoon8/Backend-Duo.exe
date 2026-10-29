import { CrearEntidadMedicaUseCase } from './crear-entidad-medica.use-case';
import { EntidadMedicaRepository } from '../../domain/entidad-medica.repository';
import { EntidadMedica } from '../../domain/entidad-medica.entity';
import { CrearEntidadMedicaDto } from '../dto/crear-entidad-medica.dto';

function crearRepoFalso(
  overrides: Partial<EntidadMedicaRepository> = {},
): jest.Mocked<EntidadMedicaRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<EntidadMedicaRepository>;
}

describe('CrearEntidadMedicaUseCase', () => {
  it('crea la entidad médica con el nombre del dto', async () => {
    const dto: CrearEntidadMedicaDto = { nombre: 'Sanitas EPS' };
    const entidadCreada = new EntidadMedica('entidad-1', dto.nombre);
    const repo = crearRepoFalso({
      crear: jest.fn().mockResolvedValue(entidadCreada),
    });
    const useCase = new CrearEntidadMedicaUseCase(repo);

    const resultado = await useCase.ejecutar(dto);

    expect(repo.crear).toHaveBeenCalledWith({ nombre: dto.nombre });
    expect(resultado).toBe(entidadCreada);
  });
});
