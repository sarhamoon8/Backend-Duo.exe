import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// Prueba de extremo a extremo contra la base de datos real (la misma que
// usa `docker compose up`): levanta la aplicación completa, tal como la
// arranca src/main.ts (mismos pipes/filtros globales), y ejercita el
// núcleo del producto: registro, login, guards de autorización, y el
// ciclo de vida completo de un turno.
//
// Los datos de prueba se crean con un sufijo único por corrida (para no
// chocar con el seed de demo ni con corridas anteriores) y se borran al
// final, sin depender de `npm run db:seed`.
describe('Flujo de autenticación y turnos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const emailPaciente = `paciente.e2e.${sufijo}@example.com`;
  const emailFuncionario = `funcionario.e2e.${sufijo}@example.com`;
  const passwordDemo = 'clave123456';

  let entidadId: string;
  let puntoId: string;
  let servicioId: string;
  let ventanillaId: string;
  let tokenPaciente: string;
  let tokenFuncionario: string;
  let turnoId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Misma configuración que main.ts, para probar lo que de verdad se
    // despliega y no una versión "desnuda" de la app.
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

    // Fixtures mínimas para poder crear un turno: entidad → punto →
    // servicio → ventanilla, más un usuario FUNCIONARIO (el registro
    // público solo crea PACIENTE, así que este se inserta directo).
    const entidad = await prisma.entidadMedica.create({
      data: { nombre: `Entidad E2E ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede E2E ${sufijo}`,
        direccion: 'Calle de prueba',
        ciudad: 'Fusagasugá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const servicio = await prisma.servicio.create({
      data: {
        codigoServicio: `E2E-${sufijo}`,
        nombre: 'Servicio de prueba e2e',
        tiempoPromedioMin: 5,
        entidadId,
      },
    });
    servicioId = servicio.id;

    const ventanilla = await prisma.ventanilla.create({
      data: { puntoId, numeroModulo: 'E2E-1' },
    });
    ventanillaId = ventanilla.id;

    const passwordHash = await bcrypt.hash(passwordDemo, 10);
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-FUNC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Funcionario',
        apellidos: 'E2E',
        email: emailFuncionario,
        password: passwordHash,
        rol: 'FUNCIONARIO',
      },
    });
  });

  afterAll(async () => {
    // Limpieza en orden inverso a las relaciones (hijos antes que padres).
    await prisma.turno.deleteMany({ where: { puntoId } });
    await prisma.ventanilla.deleteMany({ where: { puntoId } });
    await prisma.servicio.deleteMany({ where: { entidadId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({
      where: { email: { in: [emailPaciente, emailFuncionario] } },
    });
    await app.close();
  });

  describe('Registro y login', () => {
    it('registra un nuevo paciente y devuelve un token', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          numeroDocumento: `E2E-PAC-${sufijo}`,
          tipoDocumento: 'CC',
          nombres: 'Paciente',
          apellidos: 'E2E',
          email: emailPaciente,
          password: passwordDemo,
        })
        .expect(201);

      expect(respuesta.body.accessToken).toEqual(expect.any(String));
      tokenPaciente = respuesta.body.accessToken;
    });

    it('rechaza un segundo registro con el mismo email (409)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          numeroDocumento: `E2E-PAC-OTRO-${sufijo}`,
          tipoDocumento: 'CC',
          nombres: 'Paciente',
          apellidos: 'Duplicado',
          email: emailPaciente,
          password: passwordDemo,
        })
        .expect(409);
    });

    it('rechaza campos no declarados en el DTO (ValidationPipe)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          numeroDocumento: `E2E-EXTRA-${sufijo}`,
          tipoDocumento: 'CC',
          nombres: 'Paciente',
          apellidos: 'Extra',
          email: `extra.${sufijo}@example.com`,
          password: passwordDemo,
          rol: 'ADMIN', // no existe en RegisterDto: forbidNonWhitelisted debe rechazarlo
        })
        .expect(400);
    });

    it('inicia sesión con las credenciales correctas', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: emailPaciente, password: passwordDemo })
        .expect(201);

      expect(respuesta.body.accessToken).toEqual(expect.any(String));
    });

    it('rechaza el login con contraseña incorrecta (401)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: emailPaciente, password: 'contraseña-incorrecta' })
        .expect(401);
    });

    it('inicia sesión como el funcionario de prueba', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: emailFuncionario, password: passwordDemo })
        .expect(201);

      tokenFuncionario = respuesta.body.accessToken;
    });
  });

  describe('Guards de autenticación y autorización', () => {
    it('GET /usuarios sin token responde 401', () => {
      return request(app.getHttpServer()).get('/usuarios').expect(401);
    });

    it('GET /usuarios con un token de PACIENTE responde 403', () => {
      return request(app.getHttpServer())
        .get('/usuarios')
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .expect(403);
    });
  });

  describe('Ciclo de vida de un turno', () => {
    it('el paciente crea un turno y queda en posición 1', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/turnos')
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .send({ servicioId, puntoId })
        .expect(201);

      expect(respuesta.body.estado).toBe('PENDIENTE');
      expect(respuesta.body.posicion).toBe(1);
      expect(respuesta.body.codigoAlfanumerico).toEqual(expect.any(String));
      turnoId = respuesta.body.id;
    });

    it('el paciente ve el turno en GET /turnos/mis-turnos', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/turnos/mis-turnos')
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((t) => t.id);
      expect(ids).toContain(turnoId);
    });

    it('un PACIENTE no puede ver la fila de un punto (403)', () => {
      return request(app.getHttpServer())
        .get(`/turnos?puntoId=${puntoId}`)
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .expect(403);
    });

    it('el funcionario ve la fila del punto', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/turnos?puntoId=${puntoId}`)
        .set('Authorization', `Bearer ${tokenFuncionario}`)
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((t) => t.id);
      expect(ids).toContain(turnoId);
    });

    it('avanzar sin ventanillaId responde 400', () => {
      return request(app.getHttpServer())
        .patch(`/turnos/${turnoId}/avanzar`)
        .set('Authorization', `Bearer ${tokenFuncionario}`)
        .send({})
        .expect(400);
    });

    it('el funcionario llama el turno (PENDIENTE -> EN_CURSO)', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch(`/turnos/${turnoId}/avanzar`)
        .set('Authorization', `Bearer ${tokenFuncionario}`)
        .send({ ventanillaId })
        .expect(200);

      expect(respuesta.body.estado).toBe('EN_CURSO');
      expect(respuesta.body.ventanillaId).toBe(ventanillaId);
      expect(respuesta.body.horaLlamado).toEqual(expect.any(String));
    });

    it('el funcionario finaliza la atención (EN_CURSO -> ATENDIDO)', async () => {
      const respuesta = await request(app.getHttpServer())
        .patch(`/turnos/${turnoId}/avanzar`)
        .set('Authorization', `Bearer ${tokenFuncionario}`)
        .send({})
        .expect(200);

      expect(respuesta.body.estado).toBe('ATENDIDO');
      expect(respuesta.body.horaFinalizacion).toEqual(expect.any(String));
    });

    it('ya no se puede cancelar un turno ATENDIDO (400, regla de negocio)', () => {
      return request(app.getHttpServer())
        .patch(`/turnos/${turnoId}/cancelar`)
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .expect(400);
    });
  });
});
