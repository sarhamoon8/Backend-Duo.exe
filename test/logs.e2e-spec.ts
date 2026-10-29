import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// Bitácora de peticiones HTTP (LoggingInterceptor + GET /logs). A
// propósito NO se borran las filas de LogPeticion en el afterAll: son
// justamente lo que el profesor pidió revisar ("permanencia" en base de
// datos), así que deben sobrevivir a esta corrida como a cualquier otra.
describe('Bitácora de peticiones (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const emailAdmin = `admin.logs.e2e.${sufijo}@example.com`;
  const emailPaciente = `paciente.logs.e2e.${sufijo}@example.com`;
  const passwordDemo = 'clave123456';

  let tokenAdmin: string;
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

    const passwordHash = await bcrypt.hash(passwordDemo, 10);
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-ADMIN-LOGS-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Admin',
        apellidos: 'Logs E2E',
        email: emailAdmin,
        password: passwordHash,
        rol: 'ADMIN',
      },
    });

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailAdmin, password: passwordDemo });
    tokenAdmin = loginAdmin.body.accessToken;

    const registroPaciente = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-PAC-LOGS-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Logs E2E',
        email: emailPaciente,
        password: passwordDemo,
      });
    tokenPaciente = registroPaciente.body.accessToken;

    // Una petición pública cualquiera, para asegurar que hay al menos una
    // fila nueva en la bitácora antes de consultarla.
    await request(app.getHttpServer()).get('/servicios');
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { email: { in: [emailAdmin, emailPaciente] } },
    });
    await app.close();
  });

  it('GET /logs sin token responde 401', () => {
    return request(app.getHttpServer()).get('/logs').expect(401);
  });

  it('un PACIENTE no puede ver la bitácora (403)', () => {
    return request(app.getHttpServer())
      .get('/logs')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(403);
  });

  it('el ADMIN ve la bitácora, con las peticiones ya persistidas en base de datos', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/logs?limite=200')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);

    expect(Array.isArray(respuesta.body)).toBe(true);
    expect(respuesta.body.length).toBeGreaterThan(0);

    const entrada = respuesta.body[0];
    expect(typeof entrada.metodo).toBe('string');
    expect(typeof entrada.ruta).toBe('string');
    expect(typeof entrada.codigoEstado).toBe('number');
    expect(typeof entrada.duracionMs).toBe('number');
  });
});
