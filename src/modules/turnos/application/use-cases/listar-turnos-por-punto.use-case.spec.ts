import { ListarTurnosPorPuntoUseCase } from './listar-turnos-por-punto.use-case';
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

describe('ListarTurnosPorPuntoUseCase', () => {
  it('delega en turnoRepository.listarPorPunto con el puntoId', async () => {
    const repo = crearTurnoRepoFalso({
      listarPorPunto: jest.fn().mockResolvedValue([turno]),
    });
    const useCase = new ListarTurnosPorPuntoUseCase(repo);

    const resultado = await useCase.ejecutar('punto-1');

    expect(repo.listarPorPunto).toHaveBeenCalledWith('punto-1', undefined);
    expect(resultado).toEqual([turno]);
  });

  it('pasa el servicioId opcional como filtro adicional', async () => {
    const repo = crearTurnoRepoFalso({
      listarPorPunto: jest.fn().mockResolvedValue([turno]),
    });
    const useCase = new ListarTurnosPorPuntoUseCase(repo);

    await useCase.ejecutar('punto-1', 'servicio-1');

    expect(repo.listarPorPunto).toHaveBeenCalledWith('punto-1', 'servicio-1');
  });
});
