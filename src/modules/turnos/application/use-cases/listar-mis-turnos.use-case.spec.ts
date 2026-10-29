import { ListarMisTurnosUseCase } from './listar-mis-turnos.use-case';
import { TurnoRepository } from '../../domain/turno.repository';
import { Turno } from '../../domain/turno.entity';
import { EstadoTurno } from '../../domain/estado-turno.enum';

function crearTurnoRepoFalso(
  overrides: Partial<TurnoRepository> = {},
): jest.Mocked<TurnoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    listarPorPunto: jest.fn(),
    listarPorUsuario: jest.fn(),
    actualizarEstado: jest.fn(),
    iniciarAtencion: jest.fn(),
    finalizarAtencion: jest.fn(),
    contarPendientesAntes: jest.fn(),
    ...overrides,
  } as jest.Mocked<TurnoRepository>;
}

const turno = new Turno(
  'turno-1',
  'usuario-1',
  'servicio-1',
  'punto-1',
  null,
  'T-ABC123',
  EstadoTurno.PENDIENTE,
  false,
  null,
  null,
  new Date(),
);

describe('ListarMisTurnosUseCase', () => {
  it('delega en turnoRepository.listarPorUsuario con el id del usuario', async () => {
    const repo = crearTurnoRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([turno]),
    });
    const useCase = new ListarMisTurnosUseCase(repo);

    const resultado = await useCase.ejecutar('usuario-1');

    expect(repo.listarPorUsuario).toHaveBeenCalledWith('usuario-1');
    expect(resultado).toEqual([turno]);
  });

  it('devuelve una lista vacía si el usuario no tiene turnos', async () => {
    const repo = crearTurnoRepoFalso({
      listarPorUsuario: jest.fn().mockResolvedValue([]),
    });
    const useCase = new ListarMisTurnosUseCase(repo);

    await expect(useCase.ejecutar('usuario-1')).resolves.toEqual([]);
  });
});
