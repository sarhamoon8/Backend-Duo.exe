import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// RF-08 (historial de medicamentos de uso habitual, recordatorios y
// alertas de vencimiento), de punta a punta contra la base de datos real.
describe('Recordatorios de medicamentos (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const passwordDemo = 'Clave123456!';
  const emailPaciente = `paciente.record.e2e.${sufijo}@example.com`;
  const emailOtro = `otro.record.e2e.${sufijo}@example.com`;

  let entidadId: string;
  let puntoId: string;
  let medicamentoVenceProntoId: string;
  let medicamentoVenceLejosId: string;
  let tokenPaciente: string;
  let tokenOtro: string;

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
      data: { nombre: `Entidad Record E2E ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Record E2E ${sufijo}`,
        direccion: 'Calle de prueba',
        ciudad: 'Fusagasugá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const venceProntoEn3Dias = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const venceLejosEn60Dias = new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000,
    );

    const medVenceProntoCreado = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-RECP-E2E-${sufijo}`,
        nombreGenerico: 'Loratadina',
        concentracion: '10mg',
        presentacion: 'Tableta',
        laboratorioFabricante: 'Lab E2E',
      },
    });
    medicamentoVenceProntoId = medVenceProntoCreado.id;
    await prisma.inventario.create({
      data: {
        puntoId,
        medicamentoId: medicamentoVenceProntoId,
        lote: `LOTE-RECP-E2E-${sufijo}`,
        stockActual: 10,
        fechaVencimiento: venceProntoEn3Dias,
      },
    });

    const medVenceLejosCreado = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-RECL-E2E-${sufijo}`,
        nombreGenerico: 'Omeprazol',
        concentracion: '20mg',
        presentacion: 'Cápsula',
        laboratorioFabricante: 'Lab E2E',
      },
    });
    medicamentoVenceLejosId = medVenceLejosCreado.id;
    await prisma.inventario.create({
      data: {
        puntoId,
        medicamentoId: medicamentoVenceLejosId,
        lote: `LOTE-RECL-E2E-${sufijo}`,
        stockActual: 10,
        fechaVencimiento: venceLejosEn60Dias,
      },
    });

    const passwordHash = await bcrypt.hash(passwordDemo, 10);
    await prisma.usuario.create({
      data: {
        numeroDocumento: `E2E-REC-OTRO-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Otro',
        apellidos: 'E2E',
        email: emailOtro,
        password: passwordHash,
        rol: 'PACIENTE',
      },
    });

    const registroPaciente = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-REC-PAC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Record E2E',
        email: emailPaciente,
        password: passwordDemo,
        aceptaTerminos: true,
      });
    tokenPaciente = registroPaciente.body.accessToken;

    const loginOtro = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailOtro, password: passwordDemo });
    tokenOtro = loginOtro.body.accessToken;
  });

  afterAll(async () => {
    await prisma.recordatorio.deleteMany({
      where: {
        medicamentoId: { in: [medicamentoVenceProntoId, medicamentoVenceLejosId] },
      },
    });
    await prisma.inventario.deleteMany({ where: { puntoId } });
    await prisma.medicamento.deleteMany({
      where: { id: { in: [medicamentoVenceProntoId, medicamentoVenceLejosId] } },
    });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({
      where: { email: { in: [emailPaciente, emailOtro] } },
    });
    await app.close();
  });

  let recordatorioVenceProntoId: string;
  let recordatorioVenceLejosId: string;

  it('el paciente crea un recordatorio para un medicamento próximo a vencer', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/recordatorios')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({
        medicamentoId: medicamentoVenceProntoId,
        mensaje: 'Tomar en la mañana',
        horaRecordatorio: '08:00',
      })
      .expect(201);

    expect(respuesta.body.activo).toBe(true);
    recordatorioVenceProntoId = respuesta.body.id;
  });

  it('el paciente crea un recordatorio para un medicamento que vence lejos', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/recordatorios')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({
        medicamentoId: medicamentoVenceLejosId,
        mensaje: 'Tomar en la noche',
        horaRecordatorio: '20:00',
      })
      .expect(201);

    recordatorioVenceLejosId = respuesta.body.id;
  });

  it('rechaza una hora con formato inválido (400)', () => {
    return request(app.getHttpServer())
      .post('/recordatorios')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({
        medicamentoId: medicamentoVenceLejosId,
        mensaje: 'Hora inválida',
        horaRecordatorio: '25:99',
      })
      .expect(400);
  });

  it('mis-recordatorios lista ambos recordatorios', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/recordatorios/mis-recordatorios')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const ids = (respuesta.body as { id: string }[]).map((r) => r.id);
    expect(ids).toContain(recordatorioVenceProntoId);
    expect(ids).toContain(recordatorioVenceLejosId);
  });

  it('alertas-vencimiento solo incluye el medicamento que vence dentro del umbral', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/recordatorios/alertas-vencimiento')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const medicamentoIds = (
      respuesta.body as { medicamentoId: string }[]
    ).map((a) => a.medicamentoId);
    expect(medicamentoIds).toContain(medicamentoVenceProntoId);
    expect(medicamentoIds).not.toContain(medicamentoVenceLejosId);
  });

  it('desactivar el recordatorio lo saca de las alertas de vencimiento', async () => {
    await request(app.getHttpServer())
      .patch(`/recordatorios/${recordatorioVenceProntoId}`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ activo: false })
      .expect(200)
      .expect((res) => {
        expect(res.body.activo).toBe(false);
      });

    const respuesta = await request(app.getHttpServer())
      .get('/recordatorios/alertas-vencimiento')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const medicamentoIds = (
      respuesta.body as { medicamentoId: string }[]
    ).map((a) => a.medicamentoId);
    expect(medicamentoIds).not.toContain(medicamentoVenceProntoId);
  });

  it('otro usuario no puede modificar el recordatorio ajeno (403)', () => {
    return request(app.getHttpServer())
      .patch(`/recordatorios/${recordatorioVenceLejosId}`)
      .set('Authorization', `Bearer ${tokenOtro}`)
      .send({ activo: false })
      .expect(403);
  });

  it('otro usuario no puede eliminar el recordatorio ajeno (403)', () => {
    return request(app.getHttpServer())
      .delete(`/recordatorios/${recordatorioVenceLejosId}`)
      .set('Authorization', `Bearer ${tokenOtro}`)
      .expect(403);
  });

  it('el dueño elimina su propio recordatorio', async () => {
    await request(app.getHttpServer())
      .delete(`/recordatorios/${recordatorioVenceLejosId}`)
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const respuesta = await request(app.getHttpServer())
      .get('/recordatorios/mis-recordatorios')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    const ids = (respuesta.body as { id: string }[]).map((r) => r.id);
    expect(ids).not.toContain(recordatorioVenceLejosId);
  });
});
