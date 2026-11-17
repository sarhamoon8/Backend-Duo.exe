import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// RF-10 (perfil de salud básico, autorreportado), de punta a punta contra
// la base de datos real.
describe('Perfil de salud (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const passwordDemo = 'Clave123456!';
  const emailPaciente = `paciente.perfil.e2e.${sufijo}@example.com`;

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

    const registroPaciente = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-PERFIL-PAC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Perfil E2E',
        email: emailPaciente,
        password: passwordDemo,
        aceptaTerminos: true,
      });
    tokenPaciente = registroPaciente.body.accessToken;
  });

  afterAll(async () => {
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailPaciente },
    });
    if (usuario) {
      await prisma.perfilSalud.deleteMany({ where: { usuarioId: usuario.id } });
    }
    await prisma.usuario.deleteMany({ where: { email: emailPaciente } });
    await app.close();
  });

  it('rechaza consultar el perfil sin token (401)', () => {
    return request(app.getHttpServer()).get('/perfil-salud/mi-perfil').expect(401);
  });

  it('un usuario nuevo todavía no tiene perfil de salud (cuerpo vacío)', async () => {
    // NestJS responde un body vacío cuando el handler devuelve null (no
    // es un array/objeto serializado); lo documentamos acá para que sea
    // explícito qué espera el frontend en este caso.
    const respuesta = await request(app.getHttpServer())
      .get('/perfil-salud/mi-perfil')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    expect(respuesta.body).toEqual({});
  });

  it('el paciente registra su información básica de salud', async () => {
    const respuesta = await request(app.getHttpServer())
      .put('/perfil-salud/mi-perfil')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({
        grupoSanguineo: 'O+',
        alergias: 'Penicilina',
        contactoEmergenciaNombre: 'Familiar',
        contactoEmergenciaTelefono: '3000000000',
      })
      .expect(200);

    expect(respuesta.body.grupoSanguineo).toBe('O+');
    expect(respuesta.body.alergias).toBe('Penicilina');
  });

  it('una segunda actualización hace upsert sobre el mismo perfil (no duplica)', async () => {
    const respuesta = await request(app.getHttpServer())
      .put('/perfil-salud/mi-perfil')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .send({ condicionesCronicas: 'Hipertensión' })
      .expect(200);

    expect(respuesta.body.condicionesCronicas).toBe('Hipertensión');
    // El grupo sanguíneo y las alergias de la actualización anterior se
    // mantienen: cada PUT solo toca los campos que envía.
    expect(respuesta.body.grupoSanguineo).toBe('O+');

    const consulta = await request(app.getHttpServer())
      .get('/perfil-salud/mi-perfil')
      .set('Authorization', `Bearer ${tokenPaciente}`)
      .expect(200);

    expect(consulta.body.id).toBe(respuesta.body.id);
  });
});
