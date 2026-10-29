import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaLogPeticionRepository } from './prisma-log-peticion.repository';

describe('PrismaLogPeticionRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaLogPeticionRepository;
  const idsCreados: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaLogPeticionRepository(prisma);
  });

  afterAll(async () => {
    await prisma.logPeticion.deleteMany({ where: { id: { in: idsCreados } } });
    await prisma.$disconnect();
  });

  it('registra un log y lo persiste con usuarioId e ip nulos cuando no se envían', async () => {
    const creado = await repo.registrar({
      metodo: 'GET',
      ruta: '/medicamentos',
      codigoEstado: 200,
      duracionMs: 7,
    });
    idsCreados.push(creado.id);

    expect(creado.usuarioId).toBeNull();
    expect(creado.ip).toBeNull();
    expect(creado.codigoEstado).toBe(200);
  });

  it('listarRecientes devuelve los logs más recientes primero', async () => {
    const primero = await repo.registrar({
      metodo: 'POST',
      ruta: '/turnos',
      codigoEstado: 201,
      duracionMs: 20,
    });
    const segundo = await repo.registrar({
      metodo: 'PATCH',
      ruta: '/turnos/x/cancelar',
      codigoEstado: 400,
      duracionMs: 5,
      mensaje: 'El turno en estado ATENDIDO no puede cancelarse',
    });
    idsCreados.push(primero.id, segundo.id);

    const recientes = await repo.listarRecientes(2);
    const ids = recientes.map((l) => l.id);

    expect(ids.indexOf(segundo.id)).toBeLessThan(ids.indexOf(primero.id));
  });
});
