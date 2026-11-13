import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { Cita } from '../../domain/cita.entity';
import { CitaRepository } from '../../domain/cita.repository';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { HorarioProfesional } from '../../domain/horario-profesional.entity';
import { HorarioRepository } from '../../domain/horario.repository';
import { AgendarCitaUseCase } from './agendar-cita.use-case';

// Hoy (para las pruebas) es lunes 16/11/2026 08:00 en Colombia.
const AHORA = new Date('2026-11-16T13:00:00.000Z');
// Martes 17/11/2026, 09:00 Colombia.
const FECHA_HORA = '2026-11-17T14:00:00.000Z';

const doctor = (id: string, apellidos: string) =>
  new Profesional(id, `RM-${id}`, 'Nombre', apellidos, 'Cardiología', true, 'p1');

describe('AgendarCitaUseCase', () => {
  let profesionales: jest.Mocked<ProfesionalRepository>;
  let horarios: jest.Mocked<HorarioRepository>;
  let citas: jest.Mocked<CitaRepository>;
  let useCase: AgendarCitaUseCase;

  const dto = { puntoId: 'p1', especialidad: 'Cardiología', fechaHora: FECHA_HORA };
  const citaCreada = (profesionalId: string) =>
    new Cita('c1', 'u1', profesionalId, 'p1', 'Cardiología', new Date(FECHA_HORA), EstadoCita.PROGRAMADA, AHORA);

  beforeEach(() => {
    profesionales = {
      crear: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorRegistroMedico: jest.fn(),
      listar: jest.fn().mockResolvedValue([doctor('d1', 'Álvarez'), doctor('d2', 'Benítez')]),
    } as jest.Mocked<ProfesionalRepository>;
    horarios = {
      listarPorProfesionales: jest.fn().mockResolvedValue([
        new HorarioProfesional('d1', 2, '08:00', '12:00', 30),
        new HorarioProfesional('d2', 2, '08:00', '12:00', 30),
      ]),
    } as jest.Mocked<HorarioRepository>;
    citas = {
      crear: jest.fn().mockImplementation((n: { profesionalId: string }) => Promise.resolve(citaCreada(n.profesionalId))),
      buscarPorId: jest.fn(),
      listarPorPaciente: jest.fn(),
      ocupadasEntre: jest.fn().mockResolvedValue([]),
      pacienteTieneCitaEn: jest.fn().mockResolvedValue(false),
      cancelar: jest.fn(),
      reprogramar: jest.fn(),
    } as jest.Mocked<CitaRepository>;
    useCase = new AgendarCitaUseCase(profesionales, horarios, citas);
  });

  it('asigna automáticamente un doctor disponible de la sede y especialidad', async () => {
    const resultado = await useCase.ejecutar(dto, 'u1', AHORA);

    expect(resultado.profesional.id).toBe('d1');
    expect(profesionales.listar).toHaveBeenCalledWith({ puntoId: 'p1', especialidad: 'Cardiología' });
    expect(citas.crear).toHaveBeenCalledWith({
      pacienteId: 'u1',
      profesionalId: 'd1',
      puntoId: 'p1',
      especialidad: 'Cardiología',
      fechaHora: new Date(FECHA_HORA),
    });
  });

  it('salta al doctor que ya tiene la hora ocupada', async () => {
    citas.ocupadasEntre.mockResolvedValue([{ profesionalId: 'd1', fechaHora: new Date(FECHA_HORA) }]);

    const resultado = await useCase.ejecutar(dto, 'u1', AHORA);

    expect(resultado.profesional.id).toBe('d2');
  });

  it('prueba con el siguiente doctor si otro paciente le gana la hora', async () => {
    citas.crear.mockResolvedValueOnce(null);

    const resultado = await useCase.ejecutar(dto, 'u1', AHORA);

    expect(citas.crear).toHaveBeenCalledTimes(2);
    expect(resultado.profesional.id).toBe('d2');
  });

  it('responde conflicto si ningún doctor tiene esa hora libre', async () => {
    citas.ocupadasEntre.mockResolvedValue([
      { profesionalId: 'd1', fechaHora: new Date(FECHA_HORA) },
      { profesionalId: 'd2', fechaHora: new Date(FECHA_HORA) },
    ]);

    await expect(useCase.ejecutar(dto, 'u1', AHORA)).rejects.toThrow(ConflictException);
    expect(citas.crear).not.toHaveBeenCalled();
  });

  it('responde conflicto si todos los intentos de guardado pierden la carrera', async () => {
    citas.crear.mockResolvedValue(null);

    await expect(useCase.ejecutar(dto, 'u1', AHORA)).rejects.toThrow(ConflictException);
  });

  it('rechaza una hora fuera del horario de los doctores', async () => {
    await expect(
      useCase.ejecutar({ ...dto, fechaHora: '2026-11-17T22:00:00.000Z' }, 'u1', AHORA), // 17:00 Colombia
    ).rejects.toThrow(ConflictException);
  });

  it('responde 404 si no hay doctores de esa especialidad en la sede', async () => {
    profesionales.listar.mockResolvedValue([]);

    await expect(useCase.ejecutar(dto, 'u1', AHORA)).rejects.toThrow(NotFoundException);
  });

  it('rechaza si el paciente ya tiene otra cita a esa hora', async () => {
    citas.pacienteTieneCitaEn.mockResolvedValue(true);

    await expect(useCase.ejecutar(dto, 'u1', AHORA)).rejects.toThrow(ConflictException);
  });

  it('rechaza horas pasadas, con poca anticipación o demasiado lejanas', async () => {
    await expect(
      useCase.ejecutar({ ...dto, fechaHora: '2026-11-16T12:00:00.000Z' }, 'u1', AHORA),
    ).rejects.toThrow(BadRequestException);
    await expect(
      useCase.ejecutar({ ...dto, fechaHora: '2026-11-16T13:10:00.000Z' }, 'u1', AHORA),
    ).rejects.toThrow(BadRequestException);
    await expect(
      useCase.ejecutar({ ...dto, fechaHora: '2027-03-17T14:00:00.000Z' }, 'u1', AHORA),
    ).rejects.toThrow(BadRequestException);
    await expect(
      useCase.ejecutar({ ...dto, fechaHora: 'no-es-fecha' }, 'u1', AHORA),
    ).rejects.toThrow(BadRequestException);
  });
});
