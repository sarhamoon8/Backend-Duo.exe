import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaPerfilSaludRepository } from './prisma-perfil-salud.repository';

describe('PrismaPerfilSaludRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaPerfilSaludRepository;
  const sufijo = Date.now().toString();

  let usuarioId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaPerfilSaludRepository(prisma);

    const usuario = await prisma.usuario.create({
      data: {
        numeroDocumento: `INT-PERFIL-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Usuario',
        apellidos: 'Perfil Int',
        email: `usuario.perfil.int.${sufijo}@example.com`,
        password: 'hash',
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    await prisma.perfilSalud.deleteMany({ where: { usuarioId } });
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it('buscarPorUsuario devuelve null si no existe perfil', async () => {
    const resultado = await repo.buscarPorUsuario(usuarioId);
    expect(resultado).toBeNull();
  });

  it('actualizar crea el perfil la primera vez (upsert)', async () => {
    const perfil = await repo.actualizar(usuarioId, {
      grupoSanguineo: 'O+',
      alergias: 'Penicilina',
    });

    expect(perfil.usuarioId).toBe(usuarioId);
    expect(perfil.grupoSanguineo).toBe('O+');
  });

  it('actualizar vuelve a tocar el mismo registro (no duplica)', async () => {
    const primero = await repo.buscarPorUsuario(usuarioId);

    const actualizado = await repo.actualizar(usuarioId, {
      condicionesCronicas: 'Hipertensión',
    });

    expect(actualizado.id).toBe(primero?.id);
    expect(actualizado.condicionesCronicas).toBe('Hipertensión');
    // El campo que no se tocó en este segundo upsert se conserva.
    expect(actualizado.grupoSanguineo).toBe('O+');
  });
});
