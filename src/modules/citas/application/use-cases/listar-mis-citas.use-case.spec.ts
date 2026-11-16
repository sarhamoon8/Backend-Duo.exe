import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { Cita } from '../../domain/cita.entity';
import { CitaRepository } from '../../domain/cita.repository';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { ListarMisCitasUseCase } from './listar-mis-citas.use-case';

const AHORA = new Date('2026-11-16T13:00:00.000Z');
const cita = (id: string, profesionalId: string) =>
  new Cita(id, 'u1', profesionalId, 'p1', 'Cardiología', new Date('2026-11-17T14:00:00.000Z'), EstadoCita.PROGRAMADA, AHORA);
const doctor = new Profesional('d1', 'RM-1', 'Ana', 'Álvarez', 'Cardiología', true, 'p1');

describe('ListarMisCitasUseCase', () => {
  let citas: jest.Mocked<CitaRepository>;
  let profesionales: jest.Mocked<ProfesionalRepository>;
  let useCase: ListarMisCitasUseCase;

  beforeEach(() => {
    citas = { listarPorPaciente: jest.fn() } as unknown as jest.Mocked<CitaRepository>;
    profesionales = { buscarPorId: jest.fn() } as unknown as jest.Mocked<ProfesionalRepository>;
    useCase = new ListarMisCitasUseCase(citas, profesionales);
  });

  it('devuelve cada cita con su profesional', async () => {
    citas.listarPorPaciente.mockResolvedValue([cita('c1', 'd1')]);
    profesionales.buscarPorId.mockResolvedValue(doctor);

    const resultado = await useCase.ejecutar('u1');

    expect(citas.listarPorPaciente).toHaveBeenCalledWith('u1');
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.profesional).toBe(doctor);
  });

  it('consulta una sola vez a cada profesional repetido', async () => {
    citas.listarPorPaciente.mockResolvedValue([cita('c1', 'd1'), cita('c2', 'd1')]);
    profesionales.buscarPorId.mockResolvedValue(doctor);

    const resultado = await useCase.ejecutar('u1');

    expect(profesionales.buscarPorId).toHaveBeenCalledTimes(1);
    expect(resultado.map((r) => r.profesional)).toEqual([doctor, doctor]);
  });

  it('deja el profesional en null si ya no existe', async () => {
    citas.listarPorPaciente.mockResolvedValue([cita('c1', 'd9')]);
    profesionales.buscarPorId.mockResolvedValue(null);

    const resultado = await useCase.ejecutar('u1');

    expect(resultado[0]?.profesional).toBeNull();
  });

  it('devuelve lista vacía si no hay citas', async () => {
    citas.listarPorPaciente.mockResolvedValue([]);

    expect(await useCase.ejecutar('u1')).toEqual([]);
    expect(profesionales.buscarPorId).not.toHaveBeenCalled();
  });
});
