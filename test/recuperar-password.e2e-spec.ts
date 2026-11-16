import { createHash } from 'node:crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PrismaExceptionFilter } from '../src/shared/infrastructure/filters/prisma-exception.filter';

// Recuperación de contraseña de punta a punta contra la base de datos real.
// El token en claro solo existe en el correo, así que la prueba inserta
// directamente el hash de un token conocido (igual que lo haría el sistema).
describe('Recuperar contraseña (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const sufijo = Date.now().toString();
  const email = `recuperar.e2e.${sufijo}@example.com`;
  const passwordInicial = 'ClaveInicial1!';
  const passwordNueva = 'ClaveNueva2@';
  const token = `token-e2e-${sufijo}-abcdefghijklmnopqrstuvwxyz`;
  const hash = (t: string) => createHash('sha256').update(t).digest('hex');
  let usuarioId: string;

  const login = (password: string) =>
    request(app.getHttpServer()).post('/auth/login').send({ email, password });

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

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        numeroDocumento: `E2E-REC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Ana',
        apellidos: 'Recupera',
        email,
        password: passwordInicial,
        aceptaTerminos: true,
      })
      .expect(201);
    usuarioId = (await prisma.usuario.findFirstOrThrow({ where: { email } }))
      .id;
  });

  afterAll(async () => {
    // Los tokens se borran en cascada con el usuario.
    await prisma.usuario.deleteMany({ where: { email } });
    await app.close();
  });

  it('el registro deja guardada la fecha de aceptación de términos', async () => {
    const usuario = await prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });

    expect(usuario.terminosAceptadosEn).toBeInstanceOf(Date);
  });

  it('pedir el enlace responde igual exista o no la cuenta (sin revelar cuáles existen)', async () => {
    const conCuenta = await request(app.getHttpServer())
      .post('/auth/olvide-contrasena')
      .send({ email })
      .expect(200);
    const sinCuenta = await request(app.getHttpServer())
      .post('/auth/olvide-contrasena')
      .send({ email: `nadie.${sufijo}@example.com` })
      .expect(200);

    expect(conCuenta.body).toEqual(sinCuenta.body);
    // Solo la cuenta real genera un token (guardado como hash).
    expect(await prisma.tokenRecuperacion.count({ where: { usuarioId } })).toBe(
      1,
    );
  });

  it('rechaza un correo con formato inválido (400)', () => {
    return request(app.getHttpServer())
      .post('/auth/olvide-contrasena')
      .send({ email: 'no-es-un-correo' })
      .expect(400);
  });

  it('rechaza un enlace inexistente (400)', () => {
    return request(app.getHttpServer())
      .post('/auth/restablecer-contrasena')
      .send({
        token: `inexistente-${sufijo}-abcdefghijklmnop`,
        password: passwordNueva,
      })
      .expect(400);
  });

  it('rechaza una contraseña que no cumple los requisitos y no gasta el enlace', async () => {
    await prisma.tokenRecuperacion.create({
      data: {
        usuarioId,
        tokenHash: hash(token),
        expiraEn: new Date(Date.now() + 3_600_000),
      },
    });

    const respuesta = await request(app.getHttpServer())
      .post('/auth/restablecer-contrasena')
      .send({ token, password: 'abc' })
      .expect(400);

    expect((respuesta.body.message as string[]).length).toBeGreaterThanOrEqual(
      4,
    );
    await login(passwordInicial).expect(201);
  });

  it('con el enlace válido cambia la contraseña: la anterior deja de servir y la nueva sí', async () => {
    await request(app.getHttpServer())
      .post('/auth/restablecer-contrasena')
      .send({ token, password: passwordNueva })
      .expect(200);

    await login(passwordInicial).expect(401);
    await login(passwordNueva).expect(201);
  });

  it('el enlace sirve una sola vez', () => {
    return request(app.getHttpServer())
      .post('/auth/restablecer-contrasena')
      .send({ token, password: 'OtraClave3#' })
      .expect(400);
  });

  it('un enlace vencido no sirve', async () => {
    const vencido = `vencido-${sufijo}-abcdefghijklmnopqrstuvwxyz`;
    await prisma.tokenRecuperacion.create({
      data: {
        usuarioId,
        tokenHash: hash(vencido),
        expiraEn: new Date(Date.now() - 1000),
      },
    });

    await request(app.getHttpServer())
      .post('/auth/restablecer-contrasena')
      .send({ token: vencido, password: 'OtraClave3#' })
      .expect(400);
    await login(passwordNueva).expect(201);
  });
});
