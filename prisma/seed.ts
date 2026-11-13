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
  FUNCIONARIOS_SIMULADOS,
  MEDICAMENTOS_SIMULADOS,
  PACIENTES_SIMULADOS,
  PROFESIONALES_SIMULADOS,
  SEDES_SIMULADAS,
  STOCK_SIMULADO,
} from './datos-simulados';
import {
  generarCitas,
  generarHistorialTurnos,
  generarListaEspera,
  generarNotificaciones,
  generarTurnosDeHoy,
  horariosDelProfesional,
  type ProfesionalConId,
  type PuntoConVentanillas,
  type ServicioConId,
} from './generadores-simulados';

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

  // ── Datos simulados de operación: personal, pacientes, horarios, citas, turnos ──
  const ahora = new Date();

  for (const persona of FUNCIONARIOS_SIMULADOS) {
    await prisma.usuario.upsert({
      where: { email: persona.email },
      update: {},
      create: { ...persona, tipoDocumento: 'CC', password: passwordHash, rol: 'FUNCIONARIO' },
    });
  }

  const pacienteIds: string[] = [paciente.id];
  for (const persona of PACIENTES_SIMULADOS) {
    const creado = await prisma.usuario.upsert({
      where: { email: persona.email },
      update: {},
      create: { ...persona, tipoDocumento: 'CC', password: passwordHash, rol: 'PACIENTE' },
    });
    pacienteIds.push(creado.id);
  }

  const profesionales: ProfesionalConId[] = [];
  for (const [indice, profesional] of PROFESIONALES_SIMULADOS.entries()) {
    const profesionalDb = await prisma.profesional.findUnique({
      where: { registroMedico: profesional.registroMedico },
    });
    if (!profesionalDb) continue;
    profesionales.push({
      id: profesionalDb.id,
      puntoId: profesionalDb.puntoId,
      especialidad: profesionalDb.especialidad,
      indice,
    });
    await prisma.horarioProfesional.createMany({
      data: horariosDelProfesional(indice).map((horario) => ({
        profesionalId: profesionalDb.id,
        ...horario,
      })),
      skipDuplicates: true,
    });
  }

  // Las citas se generan relativas a hoy; si ya existen, no se duplican.
  if ((await prisma.cita.count()) === 0) {
    await prisma.cita.createMany({
      data: generarCitas(ahora, profesionales, pacienteIds),
      skipDuplicates: true,
    });
  }

  const sedesDb = await prisma.puntoDispensacion.findMany({
    where: { entidadId: entidad.id },
    include: { ventanillas: true },
    orderBy: { nombreSede: 'asc' },
  });
  const puntosConVentanillas: PuntoConVentanillas[] = SEDES_SIMULADAS.map((sede) => {
    const sedeDb = sedesDb.find((s) => s.nombreSede === sede.nombreSede);
    return { id: sedeDb?.id ?? '', ventanillaIds: (sedeDb?.ventanillas ?? []).map((v) => v.id) };
  }).filter((p) => p.id && p.ventanillaIds.length > 0);
  const serviciosDb = await prisma.servicio.findMany({ where: { entidadId: entidad.id } });
  const servicios: ServicioConId[] = serviciosDb.map((s) => ({ id: s.id, tiempoPromedioMin: s.tiempoPromedioMin }));

  if (puntosConVentanillas.length > 0 && servicios.length > 0) {
    // Historial para los reportes y fila de hoy; los códigos son únicos, así que
    // volver a correr el seed no duplica.
    await prisma.turno.createMany({
      data: [
        ...generarHistorialTurnos(ahora, puntosConVentanillas, servicios, pacienteIds),
        ...generarTurnosDeHoy(ahora, puntosConVentanillas, servicios, pacienteIds),
      ],
      skipDuplicates: true,
    });

    const servicioCitas = serviciosDb.find((s) => s.codigoServicio === 'CITA-01');
    const servicioAutorizaciones = serviciosDb.find((s) => s.codigoServicio === 'AUT-01');
    if (servicioCitas && servicioAutorizaciones) {
      await prisma.listaEspera.createMany({
        data: generarListaEspera(
          ahora,
          puntosConVentanillas[0]!.id,
          servicioCitas.id,
          servicioAutorizaciones.id,
          pacienteIds,
        ),
        skipDuplicates: true,
      });
    }
  }

  if ((await prisma.notificacion.count()) === 0) {
    await prisma.notificacion.createMany({ data: generarNotificaciones(ahora, pacienteIds) });
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
    `  simulados    -> ${SEDES_SIMULADAS.length} sedes, ${MEDICAMENTOS_SIMULADOS.length} medicamentos, ${PROFESIONALES_SIMULADOS.length} doctores, ${PACIENTES_SIMULADOS.length} pacientes, ${FUNCIONARIOS_SIMULADOS.length} funcionarios`,
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
