import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaVentanillaRepository } from './prisma-ventanilla.repository';
import { PrismaPuntoDispensacionRepository } from '../../../puntos-dispensacion/infrastructure/persistence/prisma-punto-dispensacion.repository';
import { PrismaEntidadMedicaRepository } from '../../../entidades-medicas/infrastructure/persistence/prisma-entidad-medica.repository';

describe('PrismaVentanillaRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaVentanillaRepository;
  const sufijo = Date.now().toString();
  let entidadId: string;
  let puntoAId: string;
  let puntoBId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaVentanillaRepository(prisma);
    const entidadRepo = new PrismaEntidadMedicaRepository(prisma);
    const puntoRepo = new PrismaPuntoDispensacionRepository(prisma);

    entidadId = (await entidadRepo.crear({ nombre: `Entidad Ventanillas ${sufijo}` })).id;
    puntoAId = (
      await puntoRepo.crear({
        entidadId,
        nombreSede: `Sede A Ventanillas ${sufijo}`,
        direccion: 'Calle A',
        ciudad: 'Bogotá',
        capacidadAtencion: 5,
      })
    ).id;
    puntoBId = (
      await puntoRepo.crear({
        entidadId,
        nombreSede: `Sede B Ventanillas ${sufijo}`,
        direccion: 'Calle B',
        ciudad: 'Bogotá',
        capacidadAtencion: 5,
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.ventanilla.deleteMany({ where: { puntoId: { in: [puntoAId, puntoBId] } } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.$disconnect();
  });

  it('crea una ventanilla con estado operativo ACTIVA por defecto', async () => {
    const creada = await repo.crear({ puntoId: puntoAId, numeroModulo: 'M-1' });

    expect(creada.estadoOperativo).toBe('ACTIVA');
  });

  it('listarPorPunto solo devuelve las ventanillas de ese punto', async () => {
    const deA = await repo.crear({ puntoId: puntoAId, numeroModulo: 'M-2' });
    const deB = await repo.crear({ puntoId: puntoBId, numeroModulo: 'M-3' });

    const listadoA = await repo.listarPorPunto(puntoAId);
    const idsA = listadoA.map((v) => v.id);

    expect(idsA).toContain(deA.id);
    expect(idsA).not.toContain(deB.id);
  });
});
