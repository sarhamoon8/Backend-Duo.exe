import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaReservaRepository } from './prisma-reserva.repository';
import { EstadoReserva } from '../../domain/estado-reserva.enum';

describe('PrismaReservaRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaReservaRepository;
  const sufijo = Date.now().toString();

  let usuarioId: string;
  let entidadId: string;
  let puntoId: string;
  let medicamentoId: string;
  let inventarioId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaReservaRepository(prisma);

    const usuario = await prisma.usuario.create({
      data: {
        numeroDocumento: `INT-RES-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Usuario',
        apellidos: 'Reserva Int',
        email: `usuario.reserva.int.${sufijo}@example.com`,
        password: 'hash',
      },
    });
    usuarioId = usuario.id;

    const entidad = await prisma.entidadMedica.create({
      data: { nombre: `Entidad Reserva Int ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Reserva Int ${sufijo}`,
        direccion: 'Calle 1',
        ciudad: 'Bogotá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const medicamento = await prisma.medicamento.create({
      data: {
        codigoNacional: `CN-RES-INT-${sufijo}`,
        nombreGenerico: 'Medicamento Reserva Int',
        concentracion: '500mg',
        presentacion: 'Tableta',
        laboratorioFabricante: 'Lab Int',
      },
    });
    medicamentoId = medicamento.id;

    const inventario = await prisma.inventario.create({
      data: {
        puntoId,
        medicamentoId,
        lote: `LOTE-RES-INT-${sufijo}`,
        stockActual: 20,
        fechaVencimiento: new Date('2027-06-01'),
      },
    });
    inventarioId = inventario.id;
  });

  afterAll(async () => {
    await prisma.reserva.deleteMany({ where: { usuarioId } });
    await prisma.inventario.deleteMany({ where: { puntoId } });
    await prisma.medicamento.deleteMany({ where: { id: medicamentoId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it('crea una reserva en estado ACTIVA por defecto', async () => {
    const fechaExpiracion = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const creada = await repo.crear({
      usuarioId,
      puntoId,
      medicamentoId,
      inventarioId,
      cantidadReservada: 2,
      fechaExpiracion,
    });

    expect(creada.estado).toBe(EstadoReserva.ACTIVA);
    expect(creada.cantidadReservada).toBe(2);
  });

  it('listarPorUsuario devuelve las reservas del usuario, más reciente primero', async () => {
    const fechaExpiracion = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const primera = await repo.crear({
      usuarioId,
      puntoId,
      medicamentoId,
      inventarioId,
      cantidadReservada: 1,
      fechaExpiracion,
    });
    // fechaSolicitud tiene precisión de milisegundos: sin esta pausa, en
    // runners rápidos las dos reservas pueden quedar con el mismo
    // timestamp y el orden "más reciente primero" deja de ser determinista.
    await new Promise((resolve) => setTimeout(resolve, 5));
    const segunda = await repo.crear({
      usuarioId,
      puntoId,
      medicamentoId,
      inventarioId,
      cantidadReservada: 1,
      fechaExpiracion,
    });

    const reservas = await repo.listarPorUsuario(usuarioId);
    const ids = reservas.map((r) => r.id);

    expect(ids).toContain(primera.id);
    expect(ids).toContain(segunda.id);
    expect(reservas[0].id).toBe(segunda.id);
  });

  it('actualizarEstado cambia el estado persistido', async () => {
    const fechaExpiracion = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const creada = await repo.crear({
      usuarioId,
      puntoId,
      medicamentoId,
      inventarioId,
      cantidadReservada: 1,
      fechaExpiracion,
    });

    const actualizada = await repo.actualizarEstado(
      creada.id,
      EstadoReserva.CANCELADA,
    );

    expect(actualizada.estado).toBe(EstadoReserva.CANCELADA);

    const recuperada = await repo.buscarPorId(creada.id);
    expect(recuperada?.estado).toBe(EstadoReserva.CANCELADA);
  });

  it('buscarPorId devuelve null si no existe', async () => {
    const resultado = await repo.buscarPorId(
      '00000000-0000-0000-0000-000000000000',
    );
    expect(resultado).toBeNull();
  });
});
