import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Rol } from '../../usuarios/domain/rol.enum';
import { Cita } from './cita.entity';
import { EstadoCita } from './estado-cita.enum';
import {
  mensajeCitaAgendada,
  mensajeCitaCancelada,
  mensajeCitaReprogramada,
} from './mensajes-cita';
import { validarPermisoSobreCita, validarVentanaDeAgenda } from './reglas-cita';

const AHORA = new Date('2026-11-16T13:00:00.000Z');
const cita = new Cita(
  'c1',
  'u1',
  'd1',
  'p1',
  'Cardiología',
  new Date('2026-11-17T14:30:00.000Z'),
  EstadoCita.PROGRAMADA,
  AHORA,
);

describe('validarVentanaDeAgenda', () => {
  it('acepta una hora dentro de la ventana permitida', () => {
    expect(() =>
      validarVentanaDeAgenda(new Date('2026-11-17T14:00:00.000Z'), AHORA),
    ).not.toThrow();
  });

  it('rechaza fechas inválidas, pasadas, con poca anticipación o muy lejanas', () => {
    for (const fecha of [
      new Date('no-es-fecha'),
      new Date('2026-11-16T12:00:00.000Z'),
      new Date('2026-11-16T13:10:00.000Z'),
      new Date('2027-03-17T14:00:00.000Z'),
    ]) {
      expect(() => validarVentanaDeAgenda(fecha, AHORA)).toThrow(
        BadRequestException,
      );
    }
  });
});

describe('validarPermisoSobreCita', () => {
  it('permite al dueño y al personal, y niega a otro paciente', () => {
    expect(() =>
      validarPermisoSobreCita(cita, { id: 'u1', rol: Rol.PACIENTE }, 'cancelar'),
    ).not.toThrow();
    expect(() =>
      validarPermisoSobreCita(cita, { id: 'x', rol: Rol.FUNCIONARIO }, 'cancelar'),
    ).not.toThrow();
    expect(() =>
      validarPermisoSobreCita(cita, { id: 'x', rol: Rol.ADMIN }, 'cancelar'),
    ).not.toThrow();
    expect(() =>
      validarPermisoSobreCita(cita, { id: 'x', rol: Rol.PACIENTE }, 'cancelar'),
    ).toThrow(ForbiddenException);
  });
});

describe('mensajes de citas', () => {
  const doctor = { nombres: 'Mateo', apellidos: 'Salazar Luna' };
  const fecha = new Date('2026-11-17T14:30:00.000Z'); // 9:30 a. m. en Colombia

  it('incluyen especialidad, fecha en hora de Colombia y doctor', () => {
    const agendada = mensajeCitaAgendada('Cardiología', fecha, doctor);
    expect(agendada).toContain('Cardiología');
    expect(agendada).toContain('noviembre');
    expect(agendada).toContain('Dr(a). Mateo Salazar Luna');
    expect(agendada).toMatch(/9:30/);
  });

  it('el mensaje de cancelación y el de reprogramación describen la cita', () => {
    expect(mensajeCitaCancelada('Pediatría', fecha)).toContain('cancelada');
    expect(mensajeCitaReprogramada('Pediatría', fecha, doctor)).toContain(
      'reprogramada',
    );
  });
});
