import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Profesional } from '../../../profesionales/domain/profesional.entity';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { EnviarNotificacionUseCase } from '../../../notificaciones/application/use-cases/enviar-notificacion.use-case';
import { TipoNotificacion } from '../../../notificaciones/domain/tipo-notificacion.enum';
import { Cita } from '../../domain/cita.entity';
import { CitaRepository } from '../../domain/cita.repository';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { AsignadorDeDoctorService } from '../services/asignador-de-doctor.service';
import { ReprogramarCitaUseCase } from './reprogramar-cita.use-case';

const AHORA = new Date('2026-11-16T13:00:00.000Z');
const ACTUAL = '2026-11-17T14:00:00.000Z';
const NUEVA = '2026-11-18T14:00:00.000Z';
const paciente = { id: 'u1', rol: Rol.PACIENTE };

const cita = (estado = EstadoCita.PROGRAMADA, fechaHora = ACTUAL) =>
  new Cita('c1', 'u1', 'd1', 'p1', 'Cardiología', new Date(fechaHora), estado, AHORA);
const doctor = (id: string) =>
  new Profesional(id, `RM-${id}`, 'Nombre', id, 'Cardiología', true, 'p1');

describe('ReprogramarCitaUseCase', () => {
  let citas: jest.Mocked<CitaRepository>;
  let asignador: jest.Mocked<AsignadorDeDoctorService>;
  let notificaciones: jest.Mocked<EnviarNotificacionUseCase>;
  let useCase: ReprogramarCitaUseCase;

  beforeEach(() => {
    citas = {
      buscarPorId: jest.fn().mockResolvedValue(cita()),
      pacienteTieneCitaEn: jest.fn().mockResolvedValue(false),
      reprogramar: jest.fn().mockImplementation((id: string, pid: string) =>
        Promise.resolve(new Cita(id, 'u1', pid, 'p1', 'Cardiología', new Date(NUEVA), EstadoCita.PROGRAMADA, AHORA))),
    } as unknown as jest.Mocked<CitaRepository>;
    asignador = {
      candidatos: jest.fn().mockResolvedValue({ hayDoctores: true, candidatos: [doctor('d2'), doctor('d1')] }),
    } as unknown as jest.Mocked<AsignadorDeDoctorService>;
    notificaciones = { ejecutar: jest.fn() } as unknown as jest.Mocked<EnviarNotificacionUseCase>;
    useCase = new ReprogramarCitaUseCase(citas, asignador, notificaciones);
  });

  const ejecutar = (usuario = paciente, fechaHora = NUEVA) =>
    useCase.ejecutar('c1', { fechaHora }, usuario, AHORA);

  it('conserva al mismo doctor si está libre y avisa al paciente', async () => {
    const resultado = await ejecutar();

    expect(citas.reprogramar).toHaveBeenCalledWith('c1', 'd1', new Date(NUEVA));
    expect(resultado.profesional.id).toBe('d1');
    expect(notificaciones.ejecutar).toHaveBeenCalledWith(
      'u1',
      TipoNotificacion.CITA_REPROGRAMADA,
      'Cita reprogramada',
      expect.any(String),
    );
  });

  it('asigna otro doctor si el suyo no está disponible', async () => {
    asignador.candidatos.mockResolvedValue({ hayDoctores: true, candidatos: [doctor('d2')] });

    const resultado = await ejecutar();

    expect(resultado.profesional.id).toBe('d2');
  });

  it('prueba con el siguiente candidato si le ganan la hora', async () => {
    citas.reprogramar.mockResolvedValueOnce(null);

    const resultado = await ejecutar();

    expect(citas.reprogramar).toHaveBeenCalledTimes(2);
    expect(resultado.profesional.id).toBe('d2');
  });

  it('responde 409 si ningún doctor puede a esa hora', async () => {
    citas.reprogramar.mockResolvedValue(null);

    await expect(ejecutar()).rejects.toThrow(ConflictException);
    expect(notificaciones.ejecutar).not.toHaveBeenCalled();
  });

  it('responde 404 si la cita no existe', async () => {
    citas.buscarPorId.mockResolvedValue(null);

    await expect(ejecutar()).rejects.toThrow(NotFoundException);
  });

  it('un paciente no puede reprogramar la cita de otro', async () => {
    await expect(ejecutar({ id: 'otro', rol: Rol.PACIENTE })).rejects.toThrow(ForbiddenException);
  });

  it('el personal puede reprogramar la cita de un paciente', async () => {
    await expect(ejecutar({ id: 'otro', rol: Rol.FUNCIONARIO })).resolves.toBeDefined();
  });

  it('solo reprograma citas programadas', async () => {
    citas.buscarPorId.mockResolvedValue(cita(EstadoCita.CANCELADA));

    await expect(ejecutar()).rejects.toThrow(BadRequestException);
  });

  it('no reprograma una cita que ya pasó', async () => {
    citas.buscarPorId.mockResolvedValue(cita(EstadoCita.PROGRAMADA, '2026-11-15T14:00:00.000Z'));

    await expect(ejecutar()).rejects.toThrow('ya pasó');
  });

  it('valida la ventana de agenda de la nueva hora', async () => {
    await expect(ejecutar(paciente, 'no-es-fecha')).rejects.toThrow(BadRequestException);
    await expect(ejecutar(paciente, '2026-11-16T13:10:00.000Z')).rejects.toThrow(BadRequestException);
  });

  it('exige una hora distinta a la actual', async () => {
    citas.buscarPorId.mockResolvedValue(cita(EstadoCita.PROGRAMADA, NUEVA));

    await expect(ejecutar()).rejects.toThrow('hora diferente');
  });

  it('responde 409 si el paciente ya tiene otra cita a esa hora', async () => {
    citas.pacienteTieneCitaEn.mockResolvedValue(true);

    await expect(ejecutar()).rejects.toThrow(ConflictException);
    expect(citas.reprogramar).not.toHaveBeenCalled();
  });
});
