import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaMedicamentoRepository } from './prisma-medicamento.repository';

describe('PrismaMedicamentoRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaMedicamentoRepository;
  const sufijo = Date.now().toString();
  const idsCreados: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaMedicamentoRepository(prisma);
  });

  afterAll(async () => {
    await prisma.medicamento.deleteMany({ where: { id: { in: idsCreados } } });
    await prisma.$disconnect();
  });

  it('requiereAutorizacion por defecto es false cuando no se envía', async () => {
    const creado = await repo.crear({
      codigoNacional: `CN-MED-INT-${sufijo}`,
      nombreGenerico: 'Acetaminofén',
      concentracion: '500mg',
      presentacion: 'Tableta',
      laboratorioFabricante: 'Lab Int',
    });
    idsCreados.push(creado.id);

    expect(creado.requiereAutorizacion).toBe(false);
  });

  it('buscarPorCodigoNacional encuentra el medicamento y devuelve null si no existe', async () => {
    const codigo = `CN-MED-BUSCAR-${sufijo}`;
    const creado = await repo.crear({
      codigoNacional: codigo,
      nombreGenerico: 'Ibuprofeno',
      concentracion: '400mg',
      presentacion: 'Tableta',
      laboratorioFabricante: 'Lab Int',
    });
    idsCreados.push(creado.id);

    await expect(repo.buscarPorCodigoNacional(codigo)).resolves.not.toBeNull();
    await expect(
      repo.buscarPorCodigoNacional(`${codigo}-NO-EXISTE`),
    ).resolves.toBeNull();
  });

  it('el código nacional es único a nivel de base de datos (P2002)', async () => {
    const codigo = `CN-MED-DUP-${sufijo}`;
    const creado = await repo.crear({
      codigoNacional: codigo,
      nombreGenerico: 'Primero',
      concentracion: '100mg',
      presentacion: 'Tableta',
      laboratorioFabricante: 'Lab Int',
    });
    idsCreados.push(creado.id);

    await expect(
      repo.crear({
        codigoNacional: codigo,
        nombreGenerico: 'Duplicado',
        concentracion: '200mg',
        presentacion: 'Jarabe',
        laboratorioFabricante: 'Otro lab',
      }),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });
});
