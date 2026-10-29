import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { PrismaNotificacionRepository } from './prisma-notificacion.repository';
import { TipoNotificacion } from '../../domain/tipo-notificacion.enum';
import { EstadoEnvioNotificacion } from '../../domain/estado-envio-notificacion.enum';

describe('PrismaNotificacionRepository (integración)', () => {
  let prisma: PrismaService;
  let repo: PrismaNotificacionRepository;
  const sufijo = Date.now().toString();
  let usuarioId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repo = new PrismaNotificacionRepository(prisma);

    const usuario = await prisma.usuario.create({
      data: {
        numeroDocumento: `NOTIF-INT-USR-${sufijo}`,
        tipoDocumento: 'CC',
        nombres: 'Paciente',
        apellidos: 'Integración',
        email: `notif.int.${sufijo}@example.com`,
        password: 'hash',
        rol: 'PACIENTE',
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    await prisma.notificacion.deleteMany({ where: { usuarioId } });
    await prisma.usuario.deleteMany({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it('listarPorUsuario devuelve las notificaciones más reciente primero', async () => {
    const primera = await repo.crear({
      usuarioId,
      tipo: TipoNotificacion.TURNO_CREADO,
      titulo: 'Primera',
      mensaje: 'mensaje 1',
      estadoEnvio: EstadoEnvioNotificacion.ENVIADA,
    });
    const segunda = await repo.crear({
      usuarioId,
      tipo: TipoNotificacion.TURNO_CANCELADO,
      titulo: 'Segunda',
      mensaje: 'mensaje 2',
      estadoEnvio: EstadoEnvioNotificacion.FALLIDA,
    });

    const listado = await repo.listarPorUsuario(usuarioId);
    const ids = listado.map((n) => n.id);

    expect(ids.indexOf(segunda.id)).toBeLessThan(ids.indexOf(primera.id));
  });

  it('marcarLeida persiste leida=true sin alterar el resto de los campos', async () => {
    const creada = await repo.crear({
      usuarioId,
      tipo: TipoNotificacion.TURNO_EN_CURSO,
      titulo: 'Tercera',
      mensaje: 'mensaje 3',
      estadoEnvio: EstadoEnvioNotificacion.ENVIADA,
    });
    expect(creada.leida).toBe(false);

    const actualizada = await repo.marcarLeida(creada.id);

    expect(actualizada.leida).toBe(true);
    expect(actualizada.titulo).toBe('Tercera');
    expect(actualizada.tipo).toBe(TipoNotificacion.TURNO_EN_CURSO);
  });
});
