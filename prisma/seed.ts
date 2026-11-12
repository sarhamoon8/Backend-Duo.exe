/**
 * Datos de demostración para el comité / desarrollo local.
 * Uso: npx prisma db seed
 *
 * Idempotente: usa upsert por email/código, así que correrlo varias veces
 * no duplica datos.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  MEDICAMENTOS_SIMULADOS,
  PROFESIONALES_SIMULADOS,
  SEDES_SIMULADAS,
  STOCK_SIMULADO,
} from './datos-simulados';

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

  // ── Datos simulados: sedes, servicios, medicamentos, inventario y doctores ──
  const SERVICIOS_EXTRA = [
    { codigoServicio: 'CITA-01', nombre: 'Asignación de citas', tiempoPromedioMin: 8 },
    { codigoServicio: 'AUT-01', nombre: 'Autorizaciones', tiempoPromedioMin: 10 },
    { codigoServicio: 'INFO-01', nombre: 'Información y orientación', tiempoPromedioMin: 5 },
  ];
  for (const servicio of SERVICIOS_EXTRA) {
    await prisma.servicio.upsert({
      where: { codigoServicio: servicio.codigoServicio },
      update: {},
      create: { ...servicio, entidadId: entidad.id },
    });
  }

  const puntosPorNombre = new Map<string, string>();
  for (const sede of SEDES_SIMULADAS) {
    let sedeDb = await prisma.puntoDispensacion.findFirst({
      where: { entidadId: entidad.id, nombreSede: sede.nombreSede },
    });
    sedeDb ??= await prisma.puntoDispensacion.create({
      data: {
        entidadId: entidad.id,
        nombreSede: sede.nombreSede,
        direccion: sede.direccion,
        ciudad: sede.ciudad,
        telefonoContacto: sede.telefonoContacto,
        capacidadAtencion: sede.capacidadAtencion,
      },
    });
    puntosPorNombre.set(sede.nombreSede, sedeDb.id);
    for (const modulo of sede.ventanillas) {
      const existente = await prisma.ventanilla.findFirst({
        where: { puntoId: sedeDb.id, numeroModulo: modulo },
      });
      if (!existente) {
        await prisma.ventanilla.create({
          data: { puntoId: sedeDb.id, numeroModulo: modulo },
        });
      }
    }
  }

  const medicamentosPorCodigo = new Map<string, string>();
  for (const medicamento of MEDICAMENTOS_SIMULADOS) {
    const medicamentoDb = await prisma.medicamento.upsert({
      where: { codigoNacional: medicamento.codigoNacional },
      update: {},
      create: medicamento,
    });
    medicamentosPorCodigo.set(medicamento.codigoNacional, medicamentoDb.id);
  }

  const vencimiento = new Date();
  vencimiento.setFullYear(vencimiento.getFullYear() + 1);
  for (const [codigo, porSede] of Object.entries(STOCK_SIMULADO)) {
    const medicamentoId = medicamentosPorCodigo.get(codigo);
    if (!medicamentoId) continue;
    for (const [nombreSede, unidades] of Object.entries(porSede)) {
      const puntoId = puntosPorNombre.get(nombreSede);
      if (!puntoId) continue;
      const lote = `L-${codigo.replace('CUM-', '')}-2026`;
      await prisma.inventario.upsert({
        where: { puntoId_medicamentoId_lote: { puntoId, medicamentoId, lote } },
        update: { stockActual: unidades },
        create: {
          puntoId,
          medicamentoId,
          lote,
          stockActual: unidades,
          fechaVencimiento: vencimiento,
        },
      });
    }
  }

  for (const profesional of PROFESIONALES_SIMULADOS) {
    const puntoId = puntosPorNombre.get(profesional.sede);
    if (!puntoId) continue;
    await prisma.profesional.upsert({
      where: { registroMedico: profesional.registroMedico },
      update: {},
      create: {
        registroMedico: profesional.registroMedico,
        nombres: profesional.nombres,
        apellidos: profesional.apellidos,
        especialidad: profesional.especialidad,
        puntoId,
      },
    });
  }

  console.log('Datos de demo listos:');
  console.log(`  ADMIN        -> ${admin.email} / ${PASSWORD_DEMO}`);
  console.log(`  FUNCIONARIO  -> ${funcionario.email} / ${PASSWORD_DEMO}`);
  console.log(`  PACIENTE     -> ${paciente.email} / ${PASSWORD_DEMO}`);
  console.log(`  entidadId    -> ${entidad.id}`);
  console.log(`  puntoId      -> ${punto.id}`);
  console.log(`  servicioId   -> ${servicioDispensacion.id}`);
  console.log(`  ventanillaId -> ${ventanilla.id}`);
  console.log(
    `  simulados    -> ${SEDES_SIMULADAS.length} sedes, ${MEDICAMENTOS_SIMULADOS.length} medicamentos, ${PROFESIONALES_SIMULADOS.length} doctores`,
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
