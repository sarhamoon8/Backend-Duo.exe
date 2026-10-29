import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaInventarioRepository } from './prisma-inventario.repository';

describe('PrismaInventarioRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaInventarioRepository;
  const sufijo = Date.now().toString();

  let entidadId: string;
  let puntoId: string;
  let medicamentoAId: string;
  let medicamentoBId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaInventarioRepository(prisma);

    const entidad = await prisma.entidadMedica.create({
      data: { nombre: `Entidad Inventario Int ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Inventario Int ${sufijo}`,
        direccion: 'Calle 1',
        ciudad: 'Bogotá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const medicamentoA = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-INV-INT-A-${sufijo}`,
        nombreGenerico: 'Medicamento A',
        concentracion: '500mg',
        presentacion: 'Tableta',
        laboratorioFabricante: 'Lab Int',
      },
    });
    medicamentoAId = medicamentoA.id;

    const medicamentoB = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-INV-INT-B-${sufijo}`,
        nombreGenerico: 'Medicamento B',
        concentracion: '250mg',
        presentacion: 'Jarabe',
        laboratorioFabricante: 'Lab Int',
      },
    });
    medicamentoBId = medicamentoB.id;
  });

  afterAll(async () => {
    await prisma.inventario.deleteMany({ where: { puntoId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.medicamento.deleteMany({
      where: { id: { in: [medicamentoAId, medicamentoBId] } },
    });
    await prisma.$disconnect();
  });

  it('calcula stockReservado en 0 por defecto al crear un lote', async () => {
    const creado = await repo.crear({
      puntoId,
      medicamentoId: medicamentoAId,
      lote: `LOTE-INT-1-${sufijo}`,
      stockActual: 100,
      fechaVencimiento: new Date('2027-06-01'),
    });

    expect(creado.stockReservado).toBe(0);
    expect(creado.stockActual).toBe(100);
  });

  it('listarPorPunto filtra por medicamentoId cuando se pasa', async () => {
    const deA = await repo.crear({
      puntoId,
      medicamentoId: medicamentoAId,
      lote: `LOTE-INT-2-${sufijo}`,
      stockActual: 20,
      fechaVencimiento: new Date('2027-06-01'),
    });
    const deB = await repo.crear({
      puntoId,
      medicamentoId: medicamentoBId,
      lote: `LOTE-INT-3-${sufijo}`,
      stockActual: 30,
      fechaVencimiento: new Date('2027-06-01'),
    });

    const soloA = await repo.listarPorPunto(puntoId, medicamentoAId);
    const idsA = soloA.map((i) => i.id);

    expect(idsA).toContain(deA.id);
    expect(idsA).not.toContain(deB.id);

    const todos = await repo.listarPorPunto(puntoId);
    const idsTodos = todos.map((i) => i.id);
    expect(idsTodos).toContain(deA.id);
    expect(idsTodos).toContain(deB.id);
  });

  it('un mismo punto+medicamento+lote no puede registrarse dos veces (P2002)', async () => {
    const lote = `LOTE-INT-DUP-${sufijo}`;
    await repo.crear({
      puntoId,
      medicamentoId: medicamentoAId,
      lote,
      stockActual: 10,
      fechaVencimiento: new Date('2027-06-01'),
    });

    await expect(
      repo.crear({
        puntoId,
        medicamentoId: medicamentoAId,
        lote,
        stockActual: 5,
        fechaVencimiento: new Date('2027-06-01'),
      }),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });
});
