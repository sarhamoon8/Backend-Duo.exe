import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// RF-05: cada evento relevante de un turno (creado, cancelado) debe quedar
// registrado como una notificación del usuario, sin importar si el envío
// de correo en sí mismo tuvo éxito (ver EnviarNotificacionUseCase: nunca
// lanza, siempre persiste ENVIADA o FALLIDA). De punta a punta contra la
// base de datos real, mismo patrón que turnos-flow.e2e-spec.ts.
describe('Notificaciones (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const emailPaciente = `paciente.notif.e2e.${sufijo}@example.com`;
  const emailOtroPaciente = `otro.notif.e2e.${sufijo}@example.com`;
  const passwordDemo = 'clave123456';

  let entidadId: string;
  let puntoId: string;
  let servicioId: string;
  let tokenPaciente: string;
  let tokenOtroPaciente: string;
  let turnoId: string;
  let notificacionTurnoCreadoId: string;

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
      data: { nombre: `Entidad Notif E2E ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Notif E2E ${sufijo}`,
        direccion: 'Calle de prueba',
        ciudad: 'Fusagasugá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const servicio = await prisma.servicio.create({
      data: {
        codigoServicio: `NOTIF-E2E-${sufijo}`,
        nombre: 'Servicio de prueba notificaciones',
        tiempoPromedioMin: 5,
        entidadId,
      },
    });
    servicioId = servicio.id;

    const registroPaciente = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-PAC-NOTIF-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Notif E2E',
        email: emailPaciente,
        password: passwordDemo,
      });
    tokenPaciente = registroPaciente.body.accessToken;

    const registroOtroPaciente = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-PAC-OTRO-NOTIF-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Otro',
        apellidos: 'Notif E2E',
        email: emailOtroPaciente,
        password: passwordDemo,
      });
    tokenOtroPaciente = registroOtroPaciente.body.accessToken;
  });

  afterAll(async () => {
    await prisma.notificacion.deleteMany({
      where: { usuario: { email: { in: [emailPaciente, emailOtroPaciente] } } },
    });
    await prisma.turno.deleteMany({ where: { puntoId } });
    await prisma.servicio.deleteMany({ where: { entidadId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({
      where: { email: { in: [emailPaciente, emailOtroPaciente] } },
    });
    await app.close();
  });

  it('crear un turno genera una notificación TURNO_CREADO para el paciente', async () => {
    const turno = await request(app.getHttpServer())
      .post('/turnos')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ servicioId, puntoId })
      .expect(201);
    turnoId = turno.body.id;

    const respuesta = await request(app.getHttpServer())
      .get('/notificaciones/mis-notificaciones')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const notificacion = (
      respuesta.body as { id: string; tipo: string; estadoEnvio: string; leida: boolean }[]
    ).find((n) => n.tipo === 'TURNO_CREADO');
    expect(notificacion).toBeDefined();
    expect(['ENVIADA', 'FALLIDA']).toContain(notificacion?.estadoEnvio);
    expect(notificacion?.leida).toBe(false);
    notificacionTurnoCreadoId = notificacion!.id;
  });

  it('otro usuario no ve las notificaciones ajenas en su propia lista', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/notificaciones/mis-notificaciones')
      .set('Authorization', `Bearer ${tokenOtroPaciente}`)
      .expect(200);

    const ids = (respuesta.body as { id: string }[]).map((n) => n.id);
    expect(ids).not.toContain(notificacionTurnoCreadoId);
  });

  it('un usuario no puede marcar como leída la notificación de otro (403)', () => {
    return request(app.getHttpServer())
      .patch(`/notificaciones/${notificacionTurnoCreadoId}/leida`)
      .set('Authorization', `Bearer ${tokenOtroPaciente}`)
      .expect(403);
  });

  it('marcar una notificación inexistente responde 404', () => {
    return request(app.getHttpServer())
      .patch('/notificaciones/00000000-0000-0000-0000-000000000000/leida')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(404);
  });

  it('el propio paciente marca su notificación como leída', async () => {
    const respuesta = await request(app.getHttpServer())
      .patch(`/notificaciones/${notificacionTurnoCreadoId}/leida`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    expect(respuesta.body.leida).toBe(true);
  });

  it('cancelar el turno genera una notificación TURNO_CANCELADO adicional', async () => {
    await request(app.getHttpServer())
      .patch(`/turnos/${turnoId}/cancelar`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const respuesta = await request(app.getHttpServer())
      .get('/notificaciones/mis-notificaciones')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const tipos = (respuesta.body as { tipo: string }[]).map((n) => n.tipo);
    expect(tipos).toContain('TURNO_CREADO');
    expect(tipos).toContain('TURNO_CANCELADO');
  });
});
