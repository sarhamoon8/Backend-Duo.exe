import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// RF-06 (consultar medicamentos y disponibilidad), de punta a punta contra
// la base de datos real. Mismo patrón que turnos-flow.e2e-spec.ts: datos
// con sufijo único por corrida, limpiados al final.
describe('Catálogo de medicamentos e inventario (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const emailAdmin = `admin.e2e.${sufijo}@example.com`;
  const emailPaciente = `paciente.medic.e2e.${sufijo}@example.com`;
  const passwordDemo = 'clave123456';

  let entidadId: string;
  let puntoId: string;
  let tokenAdmin: string;
  let tokenFuncionario: string;
  let tokenPaciente: string;
  let medicamentoId: string;

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
      data: { nombre: `Entidad Medic E2E ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Medic E2E ${sufijo}`,
        direccion: 'Calle de prueba',
        ciudad: 'Fusagasugá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const passwordHash = await bcrypt.hash(passwordDemo, 10);
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-ADMIN-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Admin',
        apellidos: 'E2E',
        email: emailAdmin,
        password: passwordHash,
        rol: 'ADMIN',
      },
    });
    const emailFuncionario = `funcionario.medic.e2e.${sufijo}@example.com`;
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-FUNC-MEDIC-${sufijo}`,
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
        numeroDocumento: `E2E-PAC-MEDIC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Medic E2E',
        email: emailPaciente,
        password: passwordDemo,
      });
    tokenPaciente = registroPaciente.body.accessToken;
  });

  afterAll(async () => {
    await prisma.inventario.deleteMany({ where: { puntoId } });
    await prisma.medicamento.deleteMany({
      where: { codigoNacional: { startsWith: `CN-E2E-${sufijo}` } },
    });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({
      where: { email: { in: [emailAdmin, emailPaciente] } },
    });
    await app.close();
  });

  describe('Catálogo de medicamentos', () => {
    it('un PACIENTE no puede crear un medicamento (403)', () => {
      return request(app.getHttpServer())
        .post('/medicamentos')
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .send({
          codigoNacional: `CN-E2E-${sufijo}-1`,
          nombreGenerico: 'Acetaminofén',
          concentracion: '500mg',
          presentacion: 'Tableta',
          laboratorioFabricante: 'Lab E2E',
        })
        .expect(403);
    });

    it('el ADMIN crea un medicamento en el catálogo', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/medicamentos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigoNacional: `CN-E2E-${sufijo}-1`,
          nombreGenerico: 'Acetaminofén',
          concentracion: '500mg',
          presentacion: 'Tableta',
          laboratorioFabricante: 'Lab E2E',
        })
        .expect(201);

      expect(respuesta.body.nombreGenerico).toBe('Acetaminofén');
      medicamentoId = respuesta.body.id;
    });

    it('rechaza un segundo medicamento con el mismo código nacional (409)', () => {
      return request(app.getHttpServer())
        .post('/medicamentos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          codigoNacional: `CN-E2E-${sufijo}-1`,
          nombreGenerico: 'Otro nombre',
          concentracion: '250mg',
          presentacion: 'Jarabe',
          laboratorioFabricante: 'Otro lab',
        })
        .expect(409);
    });

    it('cualquiera puede listar el catálogo sin token (público)', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/medicamentos')
        .expect(200);

      const ids = (respuesta.body as { id: string }[]).map((m) => m.id);
      expect(ids).toContain(medicamentoId);
    });

    it('cualquiera puede obtener un medicamento por id sin token (público)', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/medicamentos/${medicamentoId}`)
        .expect(200);

      expect(respuesta.body.id).toBe(medicamentoId);
    });

    it('obtener un medicamento inexistente responde 404', () => {
      return request(app.getHttpServer())
        .get('/medicamentos/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('Inventario por punto', () => {
    it('un PACIENTE no puede registrar inventario (403)', () => {
      return request(app.getHttpServer())
        .post('/inventario')
        .set('Authorization', `Bearer ${tokenPaciente}`)
        .send({
          puntoId,
          medicamentoId,
          lote: `LOTE-E2E-${sufijo}`,
          stockActual: 50,
          fechaVencimiento: '2027-01-01',
        })
        .expect(403);
    });

    it('el FUNCIONARIO registra un lote y la disponibilidad se calcula sin stock reservado', async () => {
      const respuesta = await request(app.getHttpServer())
        .post('/inventario')
        .set('Authorization', `Bearer ${tokenFuncionario}`)
        .send({
          puntoId,
          medicamentoId,
          lote: `LOTE-E2E-${sufijo}`,
          stockActual: 50,
          fechaVencimiento: '2027-01-01',
        })
        .expect(201);

      expect(respuesta.body.stockActual).toBe(50);
      expect(respuesta.body.stockReservado).toBe(0);
      expect(respuesta.body.cantidadDisponible).toBe(50);
      expect(respuesta.body.disponible).toBe(true);
    });

    it('cualquiera puede consultar la disponibilidad por punto sin token (público)', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/inventario?puntoId=${puntoId}`)
        .expect(200);

      const lotes = (respuesta.body as { lote: string }[]).map((i) => i.lote);
      expect(lotes).toContain(`LOTE-E2E-${sufijo}`);
    });

    it('filtra la disponibilidad por medicamentoId', async () => {
      const respuesta = await request(app.getHttpServer())
        .get(`/inventario?puntoId=${puntoId}&medicamentoId=${medicamentoId}`)
        .expect(200);

      expect(
        (respuesta.body as { medicamentoId: string }[]).every(
          (i) => i.medicamentoId === medicamentoId,
        ),
      ).toBe(true);
    });
  });
});
