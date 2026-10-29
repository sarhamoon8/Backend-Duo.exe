import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaListaEsperaRepository } from './prisma-lista-espera.repository';

describe('PrismaListaEsperaRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaListaEsperaRepository;
  const sufijo = Date.now().toString();

  let entidadId: string;
  let puntoId: string;
  let servicioId: string;
  let usuario1Id: string;
  let usuario2Id: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaListaEsperaRepository(prisma);

    const entidad = await prisma.entidadMedica.create({
      data: { nombre: `Entidad Espera Int ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Espera Int ${sufijo}`,
        direccion: 'Calle 1',
        ciudad: 'Bogotá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const servicio = await prisma.servicio.create({
      data: {
        codigoServicio: `ESPERA-INT-${sufijo}`,
        nombre: 'Servicio integración lista de espera',
        tiempoPromedioMin: 5,
        entidadId,
      },
    });
    servicioId = servicio.id;

    const usuario1 = await prisma.usuario.create({
      data: {
        numeroDocumento: `ESPERA-INT-USR1-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente1',
        apellidos: 'Integración',
        email: `espera1.int.${sufijo}@example.com`,
        password: 'hash',
        rol: 'PACIENTE',
      },
    });
    usuario1Id = usuario1.id;

    const usuario2 = await prisma.usuario.create({
      data: {
        numeroDocumento: `ESPERA-INT-USR2-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente2',
        apellidos: 'Integración',
        email: `espera2.int.${sufijo}@example.com`,
        password: 'hash',
        rol: 'PACIENTE',
      },
    });
    usuario2Id = usuario2.id;
  });

  afterAll(async () => {
    await prisma.listaEspera.deleteMany({ where: { puntoId } });
    await prisma.servicio.deleteMany({ where: { entidadId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({ where: { id: { in: [usuario1Id, usuario2Id] } } });
    await prisma.$disconnect();
  });

  it('obtenerPrimero devuelve la inscripción más antigua de la fila', async () => {
    const primero = await repo.crear({
      usuarioId: usuario1Id,
      servicioId,
      puntoId,
    });
    const segundo = await repo.crear({
      usuarioId: usuario2Id,
      servicioId,
      puntoId,
    });

    const obtenido = await repo.obtenerPrimero(servicioId, puntoId);

    expect(obtenido?.id).toBe(primero.id);

    await repo.eliminar(primero.id);
    await repo.eliminar(segundo.id);
  });

  it('obtenerPrimero devuelve null cuando no hay nadie esperando', async () => {
    await expect(
      repo.obtenerPrimero(servicioId, puntoId),
    ).resolves.toBeNull();
  });

  it('un mismo usuario no puede inscribirse dos veces al mismo servicio+punto (P2002)', async () => {
    const entrada = await repo.crear({
      usuarioId: usuario1Id,
      servicioId,
      puntoId,
    });

    await expect(
      repo.crear({ usuarioId: usuario1Id, servicioId, puntoId }),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);

    await repo.eliminar(entrada.id);
  });

  it('contarAntes cuenta solo las inscripciones anteriores a la fecha dada', async () => {
    const entrada1 = await repo.crear({
      usuarioId: usuario1Id,
      servicioId,
      puntoId,
    });
    const entrada2 = await repo.crear({
      usuarioId: usuario2Id,
      servicioId,
      puntoId,
    });

    const cuenta = await repo.contarAntes(servicioId, puntoId, entrada2.creadoEn);

    expect(cuenta).toBe(1);

    await repo.eliminar(entrada1.id);
    await repo.eliminar(entrada2.id);
  });

  it('eliminar hace que buscarPorId devuelva null', async () => {
    const entrada = await repo.crear({
      usuarioId: usuario1Id,
      servicioId,
      puntoId,
    });

    await repo.eliminar(entrada.id);

    await expect(repo.buscarPorId(entrada.id)).resolves.toBeNull();
  });
});
