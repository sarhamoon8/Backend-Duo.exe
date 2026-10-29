import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaTurnoRepository } from './prisma-turno.repository';
import { EstadoTurno } from '../../domain/estado-turno.enum';
import { generarCodigoTurno } from '../../domain/generar-codigo-turno';

// La posición en la fila no se persiste: se calcula vía
// contarPendientesAntes. Esta es la pieza más delicada de todo el backend
// desde el punto de vista de datos (filtra por estado y por fecha a la
// vez), así que merece una prueba contra Postgres real, no solo mocks.
describe('PrismaTurnoRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaTurnoRepository;
  const sufijo = Date.now().toString();

  let entidadId: string;
  let puntoId: string;
  let servicioId: string;
  let ventanillaId: string;
  let usuarioId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaTurnoRepository(prisma);

    const entidad = await prisma.entidadMedica.create({
      data: { nombre: `Entidad Turnos Int ${sufijo}` },
    });
    entidadId = entidad.id;

    const punto = await prisma.puntoDispensacion.create({
      data: {
        entidadId,
        nombreSede: `Sede Turnos Int ${sufijo}`,
        direccion: 'Calle 1',
        ciudad: 'Bogotá',
        capacidadAtencion: 10,
      },
    });
    puntoId = punto.id;

    const servicio = await prisma.servicio.create({
      data: {
        codigoServicio: `TURNO-INT-${sufijo}`,
        nombre: 'Servicio integración turnos',
        tiempoPromedioMin: 5,
        entidadId,
      },
    });
    servicioId = servicio.id;

    const ventanilla = await prisma.ventanilla.create({
      data: { puntoId, numeroModulo: 'INT-1' },
    });
    ventanillaId = ventanilla.id;

    const usuario = await prisma.usuario.create({
      data: {
        numeroDocumento: `TURNO-INT-USR-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Integración',
        email: `turno.int.${sufijo}@example.com`,
        password: 'hash',
        rol: 'PACIENTE',
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    await prisma.turno.deleteMany({ where: { puntoId } });
    await prisma.ventanilla.deleteMany({ where: { puntoId } });
    await prisma.servicio.deleteMany({ where: { entidadId } });
    await prisma.puntoDispensacion.deleteMany({ where: { entidadId } });
    await prisma.entidadMedica.deleteMany({ where: { id: entidadId } });
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it('contarPendientesAntes solo cuenta turnos PENDIENTE creados antes de la fecha dada', async () => {
    const turnoA = await repo.crear({
      usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });
    const turnoB = await repo.crear({
      usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });

    const cuenta = await repo.contarPendientesAntes(
      puntoId,
      servicioId,
      turnoB.creadoEn,
    );

    expect(cuenta).toBe(1);
    // limpieza puntual para no interferir con el resto de los casos
    await prisma.turno.deleteMany({ where: { id: { in: [turnoA.id, turnoB.id] } } });
  });

  it('un turno CANCELADO ya no cuenta como pendiente, aunque sea más antiguo', async () => {
    const turnoCancelado = await repo.crear({
      usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });
    await repo.actualizarEstado(turnoCancelado.id, EstadoTurno.CANCELADO);

    const turnoNuevo = await repo.crear({
      usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });

    const cuenta = await repo.contarPendientesAntes(
      puntoId,
      servicioId,
      turnoNuevo.creadoEn,
    );

    expect(cuenta).toBe(0);
    await prisma.turno.deleteMany({
      where: { id: { in: [turnoCancelado.id, turnoNuevo.id] } },
    });
  });

  it('iniciarAtencion asigna ventanilla, hora de llamado y pasa a EN_CURSO', async () => {
    const turno = await repo.crear({
      usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });

    const enCurso = await repo.iniciarAtencion(turno.id, ventanillaId);

    expect(enCurso.estado).toBe(EstadoTurno.EN_CURSO);
    expect(enCurso.ventanillaId).toBe(ventanillaId);
    expect(enCurso.horaLlamado).not.toBeNull();

    const finalizado = await repo.finalizarAtencion(turno.id);

    expect(finalizado.estado).toBe(EstadoTurno.ATENDIDO);
    expect(finalizado.horaFinalizacion).not.toBeNull();

    await prisma.turno.deleteMany({ where: { id: turno.id } });
  });

  it('listarPorPunto filtra opcionalmente por servicioId', async () => {
    const otroServicio = await prisma.servicio.create({
      data: {
        codigoServicio: `TURNO-INT-OTRO-${sufijo}`,
        nombre: 'Otro servicio',
        tiempoPromedioMin: 5,
        entidadId,
      },
    });

    const turnoServicio1 = await repo.crear({
      usuarioId,
      servicioId,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });
    const turnoServicio2 = await repo.crear({
      usuarioId,
      servicioId: otroServicio.id,
      puntoId,
      codigoAlfanumerico: generarCodigoTurno(),
    });

    const soloServicio1 = await repo.listarPorPunto(puntoId, servicioId);
    const ids = soloServicio1.map((t) => t.id);

    expect(ids).toContain(turnoServicio1.id);
    expect(ids).not.toContain(turnoServicio2.id);

    await prisma.turno.deleteMany({
      where: { id: { in: [turnoServicio1.id, turnoServicio2.id] } },
    });
    await prisma.servicio.delete({ where: { id: otroServicio.id } });
  });
});
