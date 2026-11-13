import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { Cita } from '../../domain/cita.entity';
import { CitaRepository } from '../../domain/cita.repository';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { CancelarCitaUseCase } from './cancelar-cita.use-case';

const AHORA = new Date('2026-11-16T13:00:00.000Z');
const cita = (estado: EstadoCita, fechaHora: string) =>
  new Cita('c1', 'u1', 'd1', 'p1', 'Cardiología', new Date(fechaHora), estado, AHORA);

describe('CancelarCitaUseCase', () => {
  let citas: jest.Mocked<CitaRepository>;
  let useCase: CancelarCitaUseCase;

  beforeEach(() => {
    citas = {
      crear: jest.fn(),
      buscarPorId: jest.fn().mockResolvedValue(cita(EstadoCita.PROGRAMADA, '2026-11-17T14:00:00.000Z')),
      listarPorPaciente: jest.fn(),
      ocupadasEntre: jest.fn(),
      pacienteTieneCitaEn: jest.fn(),
      cancelar: jest.fn().mockResolvedValue(cita(EstadoCita.CANCELADA, '2026-11-17T14:00:00.000Z')),
      reprogramar: jest.fn(),
    } as jest.Mocked<CitaRepository>;
    useCase = new CancelarCitaUseCase(citas);
  });

  it('el paciente cancela su propia cita', async () => {
    const resultado = await useCase.ejecutar('c1', { id: 'u1', rol: Rol.PACIENTE }, AHORA);

    expect(citas.cancelar).toHaveBeenCalledWith('c1');
    expect(resultado.estado).toBe(EstadoCita.CANCELADA);
  });

  it('el personal puede cancelar la cita de cualquier paciente', async () => {
    await useCase.ejecutar('c1', { id: 'otro', rol: Rol.FUNCIONARIO }, AHORA);

    expect(citas.cancelar).toHaveBeenCalledWith('c1');
  });

  it('un paciente no puede cancelar la cita de otro', async () => {
    await expect(
      useCase.ejecutar('c1', { id: 'otro', rol: Rol.PACIENTE }, AHORA),
    ).rejects.toThrow(ForbiddenException);
    expect(citas.cancelar).not.toHaveBeenCalled();
  });

  it('responde 404 si la cita no existe', async () => {
    citas.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.ejecutar('x', { id: 'u1', rol: Rol.PACIENTE }, AHORA),
    ).rejects.toThrow(NotFoundException);
  });

  it('no cancela citas ya canceladas, completadas o pasadas', async () => {
    citas.buscarPorId.mockResolvedValueOnce(cita(EstadoCita.CANCELADA, '2026-11-17T14:00:00.000Z'));
    await expect(
      useCase.ejecutar('c1', { id: 'u1', rol: Rol.PACIENTE }, AHORA),
    ).rejects.toThrow(BadRequestException);

    citas.buscarPorId.mockResolvedValueOnce(cita(EstadoCita.COMPLETADA, '2026-11-17T14:00:00.000Z'));
    await expect(
      useCase.ejecutar('c1', { id: 'u1', rol: Rol.PACIENTE }, AHORA),
    ).rejects.toThrow(BadRequestException);

    citas.buscarPorId.mockResolvedValueOnce(cita(EstadoCita.PROGRAMADA, '2026-11-15T14:00:00.000Z'));
    await expect(
      useCase.ejecutar('c1', { id: 'u1', rol: Rol.PACIENTE }, AHORA),
    ).rejects.toThrow(BadRequestException);
  });
});
