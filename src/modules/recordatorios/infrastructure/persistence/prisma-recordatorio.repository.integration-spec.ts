import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaRecordatorioRepository } from './prisma-recordatorio.repository';

describe('PrismaRecordatorioRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaRecordatorioRepository;
  const sufijo = Date.now().toString();

  let usuarioId: string;
  let medicamentoId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaRecordatorioRepository(prisma);

    const usuario = await prisma.usuario.create({
      data: {
        numeroDocumento: `INT-REC-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Usuario',
        apellidos: 'Recordatorio Int',
        email: `usuario.recordatorio.int.${sufijo}@example.com`,
        password: 'hash',
      },
    });
    usuarioId = usuario.id;

    const medicamento = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-REC-INT-${sufijo}`,
        nombreGenerico: 'Medicamento Recordatorio Int',
        concentracion: '500mg',
        presentacion: 'Tableta',
        laboratorioFabricante: 'Lab Int',
      },
    });
    medicamentoId = medicamento.id;
  });

  afterAll(async () => {
    await prisma.recordatorio.deleteMany({ where: { usuarioId } });
    await prisma.medicamento.deleteMany({ where: { id: medicamentoId } });
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it('crea un recordatorio activo por defecto', async () => {
    const creado = await repo.crear({
      usuarioId,
      medicamentoId,
      mensaje: 'Tomar en la mañana',
      horaRecordatorio: '08:00',
    });

    expect(creado.activo).toBe(true);
    expect(creado.horaRecordatorio).toBe('08:00');
  });

  it('actualizarActivo cambia el estado persistido', async () => {
    const creado = await repo.crear({
      usuarioId,
      medicamentoId,
      mensaje: 'Tomar en la noche',
      horaRecordatorio: '20:00',
    });

    const desactivado = await repo.actualizarActivo(creado.id, false);
    expect(desactivado.activo).toBe(false);

    const recuperado = await repo.buscarPorId(creado.id);
    expect(recuperado?.activo).toBe(false);
  });

  it('eliminar borra el registro físicamente', async () => {
    const creado = await repo.crear({
      usuarioId,
      medicamentoId,
      mensaje: 'A eliminar',
      horaRecordatorio: '12:00',
    });

    await repo.eliminar(creado.id);

    const recuperado = await repo.buscarPorId(creado.id);
    expect(recuperado).toBeNull();
  });

  it('listarPorUsuario solo devuelve los recordatorios de ese usuario', async () => {
    const recordatorios = await repo.listarPorUsuario(usuarioId);
    expect(
      recordatorios.every((r) => r.usuarioId === usuarioId),
    ).toBe(true);
  });
});
