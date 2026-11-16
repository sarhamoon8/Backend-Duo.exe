import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaUsuarioRepository } from '../../../usuarios/infrastructure/persistence/prisma-usuario.repository';
import { PrismaTokenRecuperacionRepository } from './prisma-token-recuperacion.repository';

describe('PrismaTokenRecuperacionRepository (integración)', () => {
  let prisma: PrismaService;
  let tokens: PrismaTokenRecuperacionRepository;
  let usuarios: PrismaUsuarioRepository;
  let usuarioId: string;
  const sufijo = Date.now().toString();
  const email = `recuperacion.${sufijo}@example.com`;
  const ahora = new Date();
  const enUnaHora = new Date(ahora.getTime() + 3_600_000);

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    tokens = new PrismaTokenRecuperacionRepository(prisma);
    usuarios = new PrismaUsuarioRepository(prisma);
    const creado = await usuarios.crear({
      numeroDocumento: `INT-REC-${sufijo}`,
      tipoDocumento: 'CC',
      nombres: 'Ana',
      apellidos: 'Recuperación',
      email,
      password: 'hash-original',
      rol: 'PACIENTE' as never,
      terminosAceptadosEn: ahora,
    });
    usuarioId = creado.id;
  });

  afterAll(async () => {
    // Los tokens se borran en cascada con el usuario.
    await prisma.usuario.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('guarda y encuentra un token vigente por su hash', async () => {
    await tokens.crear({
      usuarioId,
      tokenHash: `h-vigente-${sufijo}`,
      expiraEn: enUnaHora,
    });

    const encontrado = await tokens.buscarVigentePorHash(
      `h-vigente-${sufijo}`,
      ahora,
    );

    expect(encontrado).toEqual({ id: expect.any(String), usuarioId });
  });

  it('no devuelve un token vencido ni uno que no existe', async () => {
    await tokens.crear({
      usuarioId,
      tokenHash: `h-vencido-${sufijo}`,
      expiraEn: new Date(ahora.getTime() - 1000),
    });

    expect(
      await tokens.buscarVigentePorHash(`h-vencido-${sufijo}`, ahora),
    ).toBeNull();
    expect(
      await tokens.buscarVigentePorHash(`h-inexistente-${sufijo}`, ahora),
    ).toBeNull();
  });

  it('marcarUsado funciona una sola vez y el token usado deja de ser vigente', async () => {
    await tokens.crear({
      usuarioId,
      tokenHash: `h-uso-${sufijo}`,
      expiraEn: enUnaHora,
    });
    const token = (await tokens.buscarVigentePorHash(
      `h-uso-${sufijo}`,
      ahora,
    ))!;

    expect(await tokens.marcarUsado(token.id, ahora)).toBe(true);
    expect(await tokens.marcarUsado(token.id, ahora)).toBe(false);
    expect(
      await tokens.buscarVigentePorHash(`h-uso-${sufijo}`, ahora),
    ).toBeNull();
  });

  it('invalidarPendientes anula todos los enlaces sin usar de la persona', async () => {
    await tokens.crear({
      usuarioId,
      tokenHash: `h-pend1-${sufijo}`,
      expiraEn: enUnaHora,
    });
    await tokens.crear({
      usuarioId,
      tokenHash: `h-pend2-${sufijo}`,
      expiraEn: enUnaHora,
    });

    await tokens.invalidarPendientes(usuarioId);

    expect(
      await tokens.buscarVigentePorHash(`h-pend1-${sufijo}`, ahora),
    ).toBeNull();
    expect(
      await tokens.buscarVigentePorHash(`h-pend2-${sufijo}`, ahora),
    ).toBeNull();
  });

  it('el hash del token es único', async () => {
    await tokens.crear({
      usuarioId,
      tokenHash: `h-unico-${sufijo}`,
      expiraEn: enUnaHora,
    });

    await expect(
      tokens.crear({
        usuarioId,
        tokenHash: `h-unico-${sufijo}`,
        expiraEn: enUnaHora,
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('actualizarPassword cambia la contraseña guardada', async () => {
    await usuarios.actualizarPassword(usuarioId, 'hash-nuevo');

    expect((await usuarios.buscarPorId(usuarioId))?.password).toBe(
      'hash-nuevo',
    );
  });

  it('guarda cuándo se aceptaron los términos', async () => {
    const usuario = await usuarios.buscarPorId(usuarioId);

    expect(usuario?.terminosAceptadosEn?.getTime()).toBe(ahora.getTime());
  });
});
