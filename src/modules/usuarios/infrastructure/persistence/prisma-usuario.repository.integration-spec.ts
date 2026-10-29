import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaUsuarioRepository } from './prisma-usuario.repository';

describe('PrismaUsuarioRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaUsuarioRepository;
  const sufijo = Date.now().toString();
  const emailsCreados: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaUsuarioRepository(prisma);
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { email: { in: emailsCreados } } });
    await prisma.$disconnect();
  });

  it('buscarPorEmail no distingue mayúsculas/minúsculas', async () => {
    const email = `Ana.Integracion.${sufijo}@Example.com`;
    emailsCreados.push(email);
    await repo.crear({
      numeroDocumento: `INT-USR-${sufijo}`,
      tipoDocumento: 'CC',
      nombres: 'Ana',
      apellidos: 'Integración',
      email,
      password: 'hash-de-prueba',
      rol: 'PACIENTE' as never,
    });

    const encontrado = await repo.buscarPorEmail(
      `ana.integracion.${sufijo}@example.com`,
    );

    expect(encontrado).not.toBeNull();
    expect(encontrado?.email).toBe(email);
  });

  it('el número de documento es único a nivel de base de datos (P2002)', async () => {
    const numeroDocumento = `INT-DUP-${sufijo}`;
    const emailUno = `uno.${sufijo}@example.com`;
    const emailDos = `dos.${sufijo}@example.com`;
    emailsCreados.push(emailUno, emailDos);

    await repo.crear({
      numeroDocumento,
      tipoDocumento: 'CC',
      nombres: 'Uno',
      apellidos: 'Prueba',
      email: emailUno,
      password: 'hash',
      rol: 'PACIENTE' as never,
    });

    await expect(
      repo.crear({
        numeroDocumento,
        tipoDocumento: 'CC',
        nombres: 'Dos',
        apellidos: 'Prueba',
        email: emailDos,
        password: 'hash',
        rol: 'PACIENTE' as never,
      }),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('buscarPorNumeroDocumento encuentra el usuario y devuelve null si no existe', async () => {
    const numeroDocumento = `INT-BUSCAR-${sufijo}`;
    const email = `buscar.${sufijo}@example.com`;
    emailsCreados.push(email);
    await repo.crear({
      numeroDocumento,
      tipoDocumento: 'CC',
      nombres: 'Buscar',
      apellidos: 'Prueba',
      email,
      password: 'hash',
      rol: 'PACIENTE' as never,
    });

    await expect(
      repo.buscarPorNumeroDocumento(numeroDocumento),
    ).resolves.not.toBeNull();
    await expect(
      repo.buscarPorNumeroDocumento(`${numeroDocumento}-NO-EXISTE`),
    ).resolves.toBeNull();
  });
});
