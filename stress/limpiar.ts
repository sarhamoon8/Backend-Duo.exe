/**
 * Borra los datos que dejan las corridas de stress/*.yml (usuarios
 * STRESS-*, sus turnos, inscripciones en lista de espera y notificaciones).
 * No toca los datos de demo del seed ni nada creado por un usuario real.
 *
 * Uso: npm run stress:limpiar
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usuariosStress = await prisma.usuario.findMany({
    where: { numeroDocumento: { startsWith: 'STRESS' } },
    select: { id: true },
  });
  const idsUsuarios = usuariosStress.map((u) => u.id);

  if (idsUsuarios.length === 0) {
    console.log('No hay datos de stress por limpiar.');
    return;
  }

  const notificaciones = await prisma.notificacion.deleteMany({
    where: { usuarioId: { in: idsUsuarios } },
  });
  const turnos = await prisma.turno.deleteMany({
    where: { usuarioId: { in: idsUsuarios } },
  });
  const listaEspera = await prisma.listaEspera.deleteMany({
    where: { usuarioId: { in: idsUsuarios } },
  });
  const usuarios = await prisma.usuario.deleteMany({
    where: { id: { in: idsUsuarios } },
  });

  console.log(
    `Limpieza lista: ${usuarios.count} usuarios, ${turnos.count} turnos, ` +
      `${listaEspera.count} inscripciones en lista de espera, ${notificaciones.count} notificaciones.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
