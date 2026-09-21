/**
 * Datos de demostración para el comité / desarrollo local.
 * Uso: npx prisma db seed
 *
 * Idempotente: usa upsert por email/código, así que correrlo varias veces
 * no duplica datos.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Credenciales de demo. Todas usan la misma contraseña para que sea fácil
// recordarlas en vivo frente al comité.
const PASSWORD_DEMO = 'FilaCero2026!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, SALT_ROUNDS);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@filacero.demo' },
    update: {},
    create: {
      numeroDocumento: '1000000001',
      tipoDocumento: 'CC',
      nombres: 'Admin',
      apellidos: 'FilaCero',
      email: 'admin@filacero.demo',
      password: passwordHash,
      rol: 'ADMIN',
    },
  });

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'funcionario@filacero.demo' },
    update: {},
    create: {
      numeroDocumento: '1000000002',
      tipoDocumento: 'CC',
      nombres: 'Laura',
      apellidos: 'Atención',
      email: 'funcionario@filacero.demo',
      password: passwordHash,
      rol: 'FUNCIONARIO',
    },
  });

  const paciente = await prisma.usuario.upsert({
    where: { email: 'paciente@filacero.demo' },
    update: {},
    create: {
      numeroDocumento: '1000000003',
      tipoDocumento: 'CC',
      nombres: 'Carlos',
      apellidos: 'Paciente',
      email: 'paciente@filacero.demo',
      password: passwordHash,
      telefono: '3000000000',
      rol: 'PACIENTE',
    },
  });

  let entidad = await prisma.entidadMedica.findFirst({
    where: { nombre: 'Nueva EPS' },
  });
  entidad ??= await prisma.entidadMedica.create({
    data: { nombre: 'Nueva EPS' },
  });

  let punto = await prisma.puntoDispensacion.findFirst({
    where: { entidadId: entidad.id, nombreSede: 'Sede Fusagasugá' },
  });
  punto ??= await prisma.puntoDispensacion.create({
    data: {
      entidadId: entidad.id,
      nombreSede: 'Sede Fusagasugá',
      direccion: 'Cra 8 # 10-45',
      ciudad: 'Fusagasugá',
      telefonoContacto: '3011234567',
      capacidadAtencion: 80,
    },
  });

  const servicioDispensacion = await prisma.servicio.upsert({
    where: { codigoServicio: 'DISP-GEN' },
    update: {},
    create: {
      codigoServicio: 'DISP-GEN',
      nombre: 'Dispensación general de medicamentos',
      tiempoPromedioMin: 8,
      entidadId: entidad.id,
    },
  });

  await prisma.servicio.upsert({
    where: { codigoServicio: 'DISP-CRO' },
    update: {},
    create: {
      codigoServicio: 'DISP-CRO',
      nombre: 'Dispensación de medicamentos crónicos',
      tiempoPromedioMin: 15,
      entidadId: entidad.id,
    },
  });

  let ventanilla = await prisma.ventanilla.findFirst({
    where: { puntoId: punto.id, numeroModulo: 'M1' },
  });
  ventanilla ??= await prisma.ventanilla.create({
    data: { puntoId: punto.id, numeroModulo: 'M1' },
  });

  console.log('Datos de demo listos:');
  console.log(`  ADMIN        -> ${admin.email} / ${PASSWORD_DEMO}`);
  console.log(`  FUNCIONARIO  -> ${funcionario.email} / ${PASSWORD_DEMO}`);
  console.log(`  PACIENTE     -> ${paciente.email} / ${PASSWORD_DEMO}`);
  console.log(`  entidadId    -> ${entidad.id}`);
  console.log(`  puntoId      -> ${punto.id}`);
  console.log(`  servicioId   -> ${servicioDispensacion.id}`);
  console.log(`  ventanillaId -> ${ventanilla.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
