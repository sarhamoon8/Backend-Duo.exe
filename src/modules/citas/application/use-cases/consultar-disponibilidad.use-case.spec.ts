import { BadRequestException } from '@nestjs/common';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { CitaRepository } from '../../domain/cita.repository';
import { HorarioProfesional } from '../../domain/horario-profesional.entity';
import { HorarioRepository } from '../../domain/horario.repository';
import { ConsultarDisponibilidadUseCase } from './consultar-disponibilidad.use-case';

// Lunes 16/11/2026 08:00 Colombia. El martes 17 es día 2 de la semana.
const AHORA = new Date('2026-11-16T13:00:00.000Z');
const dto = { puntoId: 'p1', especialidad: 'Cardiología', fecha: '2026-11-17' };
const doctor = (id: string, apellidos: string) =>
  new Profesional(id, `RM-${id}`, 'Nombre', apellidos, 'Cardiología', true, 'p1');

describe('ConsultarDisponibilidadUseCase', () => {
  let profesionales: jest.Mocked<ProfesionalRepository>;
  let horarios: jest.Mocked<HorarioRepository>;
  let citas: jest.Mocked<CitaRepository>;
  let useCase: ConsultarDisponibilidadUseCase;

  beforeEach(() => {
    profesionales = {
      listar: jest.fn().mockResolvedValue([doctor('d1', 'Álvarez'), doctor('d2', 'Benítez')]),
    } as unknown as jest.Mocked<ProfesionalRepository>;
    horarios = {
      listarPorProfesionales: jest.fn().mockResolvedValue([
        new HorarioProfesional('d1', 2, '08:00', '10:00', 30),
        new HorarioProfesional('d2', 2, '08:00', '09:00', 30),
      ]),
    } as jest.Mocked<HorarioRepository>;
    citas = { ocupadasEntre: jest.fn().mockResolvedValue([]) } as unknown as jest.Mocked<CitaRepository>;
    useCase = new ConsultarDisponibilidadUseCase(profesionales, horarios, citas);
  });

  it('rechaza una fecha inválida', async () => {
    await expect(
      useCase.ejecutar({ ...dto, fecha: '2026-02-31' }, AHORA),
    ).rejects.toThrow(BadRequestException);
  });

  it('devuelve sin franjas si la sede no tiene doctores', async () => {
    profesionales.listar.mockResolvedValue([]);

    const respuesta = await useCase.ejecutar(dto, AHORA);

    expect(respuesta.franjas).toEqual([]);
    expect(respuesta.fecha).toBe('2026-11-17');
    expect(horarios.listarPorProfesionales).not.toHaveBeenCalled();
  });

  it('lista las horas con cuántos doctores hay libres en cada una', async () => {
    const respuesta = await useCase.ejecutar(dto, AHORA);

    expect(respuesta.franjas.map((f) => [f.hora, f.doctoresDisponibles])).toEqual([
      ['08:00', 2],
      ['08:30', 2],
      ['09:00', 1],
      ['09:30', 1],
    ]);
    expect(respuesta.franjas[0]?.fechaHora.toISOString()).toBe('2026-11-17T13:00:00.000Z');
  });

  it('omite las horas en que todos los doctores están ocupados', async () => {
    citas.ocupadasEntre.mockResolvedValue([
      { profesionalId: 'd1', fechaHora: new Date('2026-11-17T13:00:00.000Z') },
      { profesionalId: 'd2', fechaHora: new Date('2026-11-17T13:00:00.000Z') },
    ]);

    const respuesta = await useCase.ejecutar(dto, AHORA);

    expect(respuesta.franjas.map((f) => f.hora)).not.toContain('08:00');
  });

  it('omite las horas con menos de 30 minutos de anticipación', async () => {
    // 08:10 Colombia del martes: el límite es 08:40, así que 08:00 y 08:30 ya no.
    const respuesta = await useCase.ejecutar(dto, new Date('2026-11-17T13:10:00.000Z'));

    expect(respuesta.franjas.map((f) => f.hora)).toEqual(['09:00', '09:30']);
  });
});
