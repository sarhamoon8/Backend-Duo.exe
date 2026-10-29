import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaEntidadMedicaRepository } from './prisma-entidad-medica.repository';

// Prueba de integración: contra la base de datos real de docker-compose
// (ver docker-compose.yml / DATABASE_URL en .env), sin mocks. Verifica el
// mapeo Prisma->dominio y el roundtrip real, que las unitarias con
// repositorio falso no pueden cubrir.
describe('PrismaEntidadMedicaRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaEntidadMedicaRepository;
  const sufijo = Date.now().toString();
  const idsCreados: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaEntidadMedicaRepository(prisma);
  });

  afterAll(async () => {
    await prisma.entidadMedica.deleteMany({ where: { id: { in: idsCreados } } });
    await prisma.$disconnect();
  });

  it('crea una entidad médica y la recupera por id con los mismos datos', async () => {
    const creada = await repo.crear({ nombre: `Entidad Integración ${sufijo}` });
    idsCreados.push(creada.id);

    const encontrada = await repo.buscarPorId(creada.id);

    expect(encontrada).not.toBeNull();
    expect(encontrada?.id).toBe(creada.id);
    expect(encontrada?.nombre).toBe(`Entidad Integración ${sufijo}`);
  });

  it('buscarPorId devuelve null si no existe', async () => {
    await expect(
      repo.buscarPorId('00000000-0000-0000-0000-000000000000'),
    ).resolves.toBeNull();
  });

  it('listar incluye la entidad recién creada', async () => {
    const creada = await repo.crear({ nombre: `Entidad Listar ${sufijo}` });
    idsCreados.push(creada.id);

    const todas = await repo.listar();

    expect(todas.map((e) => e.id)).toContain(creada.id);
  });
});
