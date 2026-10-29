import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// RF-04: lista de espera por servicio+punto y su reasignación automática
// cuando se libera un turno PENDIENTE. De punta a punta contra la base de
// datos real, mismo patrón que turnos-flow.e2e-spec.ts.
describe('Lista de espera y reasignación automática (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const emailPaciente1 = `paciente1.espera.e2e.${sufijo}@example.com`;
  const emailPaciente2 = `paciente2.espera.e2e.${sufijo}@example.com`;
  const emailPaciente3 = `paciente3.espera.e2e.${sufijo}@example.com`;
  const emailFuncionario = `funcionario.espera.e2e.${sufijo}@example.com`;
  const passwordDemo = 'clave123456';

  let entidadId: string;
  let puntoId: string;
  let servicioId: string;
  let tokenPaciente1: string;
  let tokenPaciente2: string;
  let tokenPaciente3: string;
  let tokenFuncionario: string;
  let entradaPaciente1Id: string;
  let entradaPaciente2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    const entidad = await prisma.entidadMedica.create({
      data: { nombre: `Entidad Espera E2E ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Espera E2E ${sufijo}`,
        direccion: 'Calle de prueba',
        ciudad: 'Fusagasugá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const servicio = await prisma.servicio.create({
      data: {
        codigoServicio: `ESPERA-E2E-${sufijo}`,
        nombre: 'Servicio de prueba lista de espera',
        tiempoPromedioMin: 5,
        entidadId,
      },
    });
    servicioId = servicio.id;

    const passwordHash = await bcrypt.hash(passwordDemo, 10);
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-FUNC-ESPERA-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Funcionario',
        apellidos: 'E2E',
        email: emailFuncionario,
        password: passwordHash,
        rol: 'FUNCIONARIO',
      },
    });

    const loginFuncionario = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailFuncionario, password: passwordDemo });
    tokenFuncionario = loginFuncionario.body.accessToken;

    const registrar = async (
      numeroDocumento: string,
      email: string,
    ): Promise<string> => {
      const respuesta = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          numeroDocumento,
          tipoDocumento: 'CC',
          nombres: 'Paciente',
          apellidos: 'Espera E2E',
          email,
          password: passwordDemo,
        });
      return respuesta.body.accessToken;
    };

    tokenPaciente1 = await registrar(`E2E-PAC1-ESPERA-${sufijo}`, emailPaciente1);
    tokenPaciente2 = await registrar(`E2E-PAC2-ESPERA-${sufijo}`, emailPaciente2);
    tokenPaciente3 = await registrar(`E2E-PAC3-ESPERA-${sufijo}`, emailPaciente3);
  });

  afterAll(async () => {
    await prisma.notificacion.deleteMany({
      where: {
        usuario: {
          email: { in: [emailPaciente1, emailPaciente2, emailPaciente3, emailFuncionario] },
        },
      },
    });
    await prisma.listaEspera.deleteMany({ where: { puntoId } });
    await prisma.turno.deleteMany({ where: { puntoId } });
    await prisma.servicio.deleteMany({ where: { entidadId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({
      where: {
        email: { in: [emailPaciente1, emailPaciente2, emailPaciente3, emailFuncionario] },
      },
    });
    await app.close();
  });

  describe('Inscripción y consulta', () => {
    it('el paciente 1 se une a la lista de espera y queda en posición 1', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/lista-espera')
        .set('Authorization', `Bearer ${tokenPaciente1}`)
        .send({ servicioId, puntoId })
        .expect(201);

      expect(respuesta.body.posicion).toBe(1);
      entradaPaciente1Id = respuesta.body.id;
    });

    it('el paciente 2 se une a la misma fila y queda en posición 2', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/lista-espera')
        .set('Authorization', `Bearer ${tokenPaciente2}`)
        .send({ servicioId, puntoId })
        .expect(201);

      expect(respuesta.body.posicion).toBe(2);
      entradaPaciente2Id = respuesta.body.id;
    });

    it('el paciente 1 ve su propia inscripción en mis-inscripciones', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/lista-espera/mis-inscripciones')
        .set('Authorization', `Bearer ${tokenPaciente1}`)
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((e) => e.id);
      expect(ids).toContain(entradaPaciente1Id);
    });

    it('un PACIENTE no puede ver la lista de espera completa de un punto (403)', () => {
      return request(app.getHttpServer())
        .get(`/lista-espera?servicioId=${servicioId}&puntoId=${puntoId}`)
        .set('Authorization', `Bearer ${tokenPaciente1}`)
        .expect(403);
    });

    it('el funcionario ve la fila completa en orden de llegada', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/lista-espera?servicioId=${servicioId}&puntoId=${puntoId}`)
        .set('Authorization', `Bearer ${tokenFuncionario}`)
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((e) => e.id);
      expect(ids.indexOf(entradaPaciente1Id)).toBeLessThan(
        ids.indexOf(entradaPaciente2Id),
      );
    });
  });

  describe('Salida de la lista de espera', () => {
    it('un paciente no puede retirar la inscripción de otro (403)', () => {
      return request(app.getHttpServer())
        .delete(`/lista-espera/${entradaPaciente1Id}`)
        .set('Authorization', `Bearer ${tokenPaciente2}`)
        .expect(403);
    });

    it('el paciente 1 puede retirarse voluntariamente', async () => {
      await request(app.getHttpServer())
        .delete(`/lista-espera/${entradaPaciente1Id}`)
        .set('Authorization', `Bearer ${tokenPaciente1}`)
        .expect(200);

      const respuesta = await request(app.getHttpServer())
        .get('/lista-espera/mis-inscripciones')
        .set('Authorization', `Bearer ${tokenPaciente1}`)
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((e) => e.id);
      expect(ids).not.toContain(entradaPaciente1Id);
    });

    it('el paciente 2 ahora queda en posición 1 (el 1 ya no cuenta)', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/lista-espera/mis-inscripciones')
        .set('Authorization', `Bearer ${tokenPaciente2}`)
        .expect(200);

      const entrada = (respuesta.body as { id: string; posicion: number }[]).find(
        (e) => e.id === entradaPaciente2Id,
      );
      expect(entrada?.posicion).toBe(1);
    });
  });

  describe('Reasignación automática al cancelar un turno PENDIENTE', () => {
    let turnoPaciente3Id: string;

    it('el paciente 3 solicita un turno en el mismo servicio+punto', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/turnos')
        .set('Authorization', `Bearer ${tokenPaciente3}`)
        .send({ servicioId, puntoId })
        .expect(201);

      expect(respuesta.body.estado).toBe('PENDIENTE');
      turnoPaciente3Id = respuesta.body.id;
    });

    it('al cancelar el turno del paciente 3, se promueve automáticamente al paciente 2', async () => {
      await request(app.getHttpServer())
        .patch(`/turnos/${turnoPaciente3Id}/cancelar`)
        .set('Authorization', `Bearer ${tokenPaciente3}`)
        .expect(200);

      const misTurnosPaciente2 = await request(app.getHttpServer())
        .get('/turnos/mis-turnos')
        .set('Authorization', `Bearer ${tokenPaciente2}`)
        .expect(200);

      const turnoPromovido = (
        misTurnosPaciente2.body as { servicioId: string; puntoId: string; estado: string }[]
      ).find((t) => t.servicioId === servicioId && t.puntoId === puntoId);
      expect(turnoPromovido).toBeDefined();
      expect(turnoPromovido?.estado).toBe('PENDIENTE');
    });

    it('la inscripción del paciente 2 ya no aparece en la lista de espera (fue promovida)', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/lista-espera/mis-inscripciones')
        .set('Authorization', `Bearer ${tokenPaciente2}`)
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((e) => e.id);
      expect(ids).not.toContain(entradaPaciente2Id);
    });
  });
});
