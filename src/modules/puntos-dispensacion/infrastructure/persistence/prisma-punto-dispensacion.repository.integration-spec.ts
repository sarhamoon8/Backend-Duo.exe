import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaPuntoDispensacionRepository } from './prisma-punto-dispensacion.repository';
import { PrismaEntidadMedicaRepository } from '../../../entidades-medicas/infrastructure/persistence/prisma-entidad-medica.repository';

describe('PrismaPuntoDispensacionRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaPuntoDispensacionRepository;
  let entidadRepo: PrismaEntidadMedicaRepository;
  const sufijo = Date.now().toString();

  let entidadAId: string;
  let entidadBId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaPuntoDispensacionRepository(prisma);
    entidadRepo = new PrismaEntidadMedicaRepository(prisma);

    entidadAId = (await entidadRepo.crear({ nombre: `Entidad A Puntos ${sufijo}` })).id;
    entidadBId = (await entidadRepo.crear({ nombre: `Entidad B Puntos ${sufijo}` })).id;
  });

  afterAll(async () => {
    await prisma.puntoDispensacion.deleteMany({
      where: { entidadId: { in: [entidadAId, entidadBId] } },
    });
    await prisma.entidadMedica.deleteMany({
      where: { id: { in: [entidadAId, entidadBId] } },
    });
    await prisma.$disconnect();
  });

  it('crea un punto y lo recupera con telefonoContacto null cuando no se envía', async () => {
    const creado = await repo.crear({
      entidadId: entidadAId,
      nombreSede: `Sede sin teléfono ${sufijo}`,
      direccion: 'Calle 1',
      ciudad: 'Bogotá',
      capacidadAtencion: 10,
    });

    const encontrado = await repo.buscarPorId(creado.id);

    expect(encontrado?.telefonoContacto).toBeNull();
    expect(encontrado?.capacidadAtencion).toBe(10);
  });

  it('listarPorEntidad solo devuelve los puntos de esa entidad', async () => {
    const puntoA = await repo.crear({
      entidadId: entidadAId,
      nombreSede: `Sede A ${sufijo}`,
      direccion: 'Calle A',
      ciudad: 'Bogotá',
      capacidadAtencion: 5,
    });
    const puntoB = await repo.crear({
      entidadId: entidadBId,
      nombreSede: `Sede B ${sufijo}`,
      direccion: 'Calle B',
      ciudad: 'Bogotá',
      capacidadAtencion: 5,
    });

    const puntosDeA = await repo.listarPorEntidad(entidadAId);
    const idsA = puntosDeA.map((p) => p.id);

    expect(idsA).toContain(puntoA.id);
    expect(idsA).not.toContain(puntoB.id);
  });
});
