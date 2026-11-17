import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// RF-07 (reserva de medicamentos), de punta a punta contra la base de
// datos real. Mismo patrón que medicamentos-inventario.e2e-spec.ts.
describe('Reservas de medicamentos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const passwordDemo = 'Clave123456!';
  const emailAdmin = `admin.reserva.e2e.${sufijo}@example.com`;
  const emailFuncionario = `funcionario.reserva.e2e.${sufijo}@example.com`;
  const emailPaciente = `paciente.reserva.e2e.${sufijo}@example.com`;

  let entidadId: string;
  let puntoId: string;
  let medicamentoId: string;
  let tokenAdmin: string;
  let tokenFuncionario: string;
  let tokenPaciente: string;

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
      data: { nombre: `Entidad Reserva E2E ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Reserva E2E ${sufijo}`,
        direccion: 'Calle de prueba',
        ciudad: 'Fusagasugá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const medicamento = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-RES-E2E-${sufijo}`,
        nombreGenerico: 'Ibuprofeno',
        concentracion: '400mg',
        presentacion: 'Tableta',
        laboratorioFabricante: 'Lab E2E',
      },
    });
    medicamentoId = medicamento.id;

    await prisma.inventario.create({
      data: {
        puntoId,
        medicamentoId,
        lote: `LOTE-RES-E2E-${sufijo}`,
        stockActual: 10,
        fechaVencimiento: new Date('2027-01-01'),
      },
    });

    const passwordHash = await bcrypt.hash(passwordDemo, 10);
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-RES-ADMIN-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Admin',
        apellidos: 'E2E',
        email: emailAdmin,
        password: passwordHash,
        rol: 'ADMIN',
      },
    });
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-RES-FUNC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Funcionario',
        apellidos: 'E2E',
        email: emailFuncionario,
        password: passwordHash,
        rol: 'FUNCIONARIO',
      },
    });

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailAdmin, password: passwordDemo });
    tokenAdmin = loginAdmin.body.accessToken;

    const loginFuncionario = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailFuncionario, password: passwordDemo });
    tokenFuncionario = loginFuncionario.body.accessToken;

    const registroPaciente = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-RES-PAC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Reserva E2E',
        email: emailPaciente,
        password: passwordDemo,
        aceptaTerminos: true,
      });
    tokenPaciente = registroPaciente.body.accessToken;
  });

  afterAll(async () => {
    await prisma.reserva.deleteMany({ where: { puntoId } });
    await prisma.inventario.deleteMany({ where: { puntoId } });
    await prisma.medicamento.deleteMany({ where: { id: medicamentoId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({
      where: { email: { in: [emailAdmin, emailFuncionario, emailPaciente] } },
    });
    await app.close();
  });

  let reservaId: string;

  it('rechaza reservar más cantidad de la disponible (400)', () => {
    return request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ puntoId, medicamentoId, cantidad: 999 })
      .expect(400);
  });

  it('el paciente reserva un medicamento disponible', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ puntoId, medicamentoId, cantidad: 3 })
      .expect(201);

    expect(respuesta.body.estado).toBe('ACTIVA');
    expect(respuesta.body.cantidadReservada).toBe(3);
    reservaId = respuesta.body.id;
  });

  it('el stock reservado queda apartado en el inventario', async () => {
    const respuesta = await request(app.getHttpServer())
      .get(`/inventario?puntoId=${puntoId}&medicamentoId=${medicamentoId}`)
      .expect(200);

    const lote = (
      respuesta.body as { lote: string; stockReservado: number }[]
    ).find((i) => i.lote === `LOTE-RES-E2E-${sufijo}`);
    expect(lote?.stockReservado).toBe(3);
  });

  it('la reserva aparece en mis-reservas', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/reservas/mis-reservas')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const ids = (respuesta.body as { id: string }[]).map((r) => r.id);
    expect(ids).toContain(reservaId);
  });

  it('un PACIENTE no puede reclamar una reserva (403)', () => {
    return request(app.getHttpServer())
      .patch(`/reservas/${reservaId}/reclamar`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(403);
  });

  it('el FUNCIONARIO reclama (entrega) la reserva y descuenta el stock real', async () => {
    const respuesta = await request(app.getHttpServer())
      .patch(`/reservas/${reservaId}/reclamar`)
      .set('Authorization', `Bearer ${tokenFuncionario}`)
      .expect(200);

    expect(respuesta.body.estado).toBe('RECLAMADA');

    const inventario = await request(app.getHttpServer()).get(
      `/inventario?puntoId=${puntoId}&medicamentoId=${medicamentoId}`,
    );
    const lote = (
      inventario.body as {
        lote: string;
        stockActual: number;
        stockReservado: number;
      }[]
    ).find((i) => i.lote === `LOTE-RES-E2E-${sufijo}`);
    expect(lote?.stockActual).toBe(7);
    expect(lote?.stockReservado).toBe(0);
  });

  it('una reserva ya RECLAMADA no puede cancelarse (400)', () => {
    return request(app.getHttpServer())
      .patch(`/reservas/${reservaId}/cancelar`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(400);
  });

  it('el paciente puede cancelar una reserva propia ACTIVA y libera el stock', async () => {
    const creada = await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ puntoId, medicamentoId, cantidad: 2 })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/reservas/${creada.body.id}/cancelar`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.estado).toBe('CANCELADA');
      });

    const inventario = await request(app.getHttpServer()).get(
      `/inventario?puntoId=${puntoId}&medicamentoId=${medicamentoId}`,
    );
    const lote = (
      inventario.body as { lote: string; stockReservado: number }[]
    ).find((i) => i.lote === `LOTE-RES-E2E-${sufijo}`);
    expect(lote?.stockReservado).toBe(0);
  });
});
