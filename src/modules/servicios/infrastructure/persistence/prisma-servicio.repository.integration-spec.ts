import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaServicioRepository } from './prisma-servicio.repository';
import { PrismaEntidadMedicaRepository } from '../../../entidades-medicas/infrastructure/persistence/prisma-entidad-medica.repository';

describe('PrismaServicioRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaServicioRepository;
  let entidadRepo: PrismaEntidadMedicaRepository;
  const sufijo = Date.now().toString();
  let entidadId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaServicioRepository(prisma);
    entidadRepo = new PrismaEntidadMedicaRepository(prisma);

    entidadId = (await entidadRepo.crear({ nombre: `Entidad Servicios ${sufijo}` })).id;
  });

  afterAll(async () => {
    await prisma.servicio.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.$disconnect();
  });

  it('buscarPorCodigo encuentra el servicio creado y devuelve null si no existe', async () => {
    const codigo = `COD-INT-${sufijo}`;
    await repo.crear({
      codigoServicio: codigo,
      nombre: 'Servicio de integración',
      tiempoPromedioMin: 10,
      entidadId,
    });

    await expect(repo.buscarPorCodigo(codigo)).resolves.not.toBeNull();
    await expect(repo.buscarPorCodigo(`${codigo}-NO-EXISTE`)).resolves.toBeNull();
  });

  it('el código de servicio es único a nivel de base de datos (P2002)', async () => {
    const codigo = `COD-DUP-${sufijo}`;
    await repo.crear({
      codigoServicio: codigo,
      nombre: 'Primero',
      tiempoPromedioMin: 10,
      entidadId,
    });

    await expect(
      repo.crear({
        codigoServicio: codigo,
        nombre: 'Duplicado',
        tiempoPromedioMin: 5,
        entidadId,
      }),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('activo por defecto es true cuando no se envía explícitamente', async () => {
    const servicio = await repo.crear({
      codigoServicio: `COD-DEFAULT-${sufijo}`,
      nombre: 'Servicio por defecto',
      tiempoPromedioMin: 10,
      entidadId,
    });

    expect(servicio.activo).toBe(true);
  });

  it('listarPorEntidad devuelve solo los servicios de esa entidad', async () => {
    const servicios = await repo.listarPorEntidad(entidadId);
    expect(servicios.every((s) => s.entidadId === entidadId)).toBe(true);
    expect(servicios.length).toBeGreaterThan(0);
  });
});
