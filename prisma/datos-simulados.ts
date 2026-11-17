/**
 * Datos SIMULADOS para la demostración de FilaCero.
 *
 * Son ficticios: los medicamentos tienen nombres genéricos reales pero los
 * códigos, laboratorios, lotes, existencias y doctores no corresponden a
 * ningún sistema real. Mientras no exista la integración con el inventario
 * de la EPS y con el registro de profesionales, esta es la fuente de datos.
 */

export interface MedicamentoSimulado {
  codigoNacional: string;
  nombreGenerico: string;
  concentracion: string;
  presentacion: string;
  laboratorioFabricante: string;
  requiereAutorizacion: boolean;
}

export const MEDICAMENTOS_SIMULADOS: MedicamentoSimulado[] = [
  { codigoNacional: 'CUM-1001', nombreGenerico: 'Losartán', concentracion: '50 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Laboratorios Andinos', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1002', nombreGenerico: 'Acetaminofén', concentracion: '500 mg', presentacion: 'Tabletas, caja x 20', laboratorioFabricante: 'Genfar Demo', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1003', nombreGenerico: 'Atorvastatina', concentracion: '20 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Laboratorios Andinos', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1004', nombreGenerico: 'Metformina', concentracion: '850 mg', presentacion: 'Tabletas, caja x 60', laboratorioFabricante: 'Pharma Sur', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1005', nombreGenerico: 'Ibuprofeno', concentracion: '400 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Genfar Demo', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1006', nombreGenerico: 'Omeprazol', concentracion: '20 mg', presentacion: 'Cápsulas, caja x 28', laboratorioFabricante: 'Pharma Sur', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1007', nombreGenerico: 'Amlodipino', concentracion: '5 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Laboratorios Andinos', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1008', nombreGenerico: 'Enalapril', concentracion: '10 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Pharma Sur', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1009', nombreGenerico: 'Hidroclorotiazida', concentracion: '25 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Genfar Demo', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1010', nombreGenerico: 'Levotiroxina', concentracion: '100 mcg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Endocrino Lab', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1011', nombreGenerico: 'Salbutamol', concentracion: '100 mcg/dosis', presentacion: 'Inhalador 200 dosis', laboratorioFabricante: 'Respira Lab', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1012', nombreGenerico: 'Amoxicilina', concentracion: '500 mg', presentacion: 'Cápsulas, caja x 21', laboratorioFabricante: 'Pharma Sur', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1013', nombreGenerico: 'Loratadina', concentracion: '10 mg', presentacion: 'Tabletas, caja x 10', laboratorioFabricante: 'Genfar Demo', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1014', nombreGenerico: 'Insulina glargina', concentracion: '100 UI/ml', presentacion: 'Pluma prellenada 3 ml', laboratorioFabricante: 'Endocrino Lab', requiereAutorizacion: true },
  { codigoNacional: 'CUM-1015', nombreGenerico: 'Warfarina', concentracion: '5 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Cardio Lab', requiereAutorizacion: true },
  { codigoNacional: 'CUM-1016', nombreGenerico: 'Clonazepam', concentracion: '2 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Neuro Lab', requiereAutorizacion: true },
  { codigoNacional: 'CUM-1017', nombreGenerico: 'Carvedilol', concentracion: '6,25 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Cardio Lab', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1018', nombreGenerico: 'Furosemida', concentracion: '40 mg', presentacion: 'Tabletas, caja x 20', laboratorioFabricante: 'Pharma Sur', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1019', nombreGenerico: 'Prednisolona', concentracion: '5 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Laboratorios Andinos', requiereAutorizacion: false },
  { codigoNacional: 'CUM-1020', nombreGenerico: 'Sertralina', concentracion: '50 mg', presentacion: 'Tabletas, caja x 30', laboratorioFabricante: 'Neuro Lab', requiereAutorizacion: true },
];

export interface SedeSimulada {
  nombreSede: string;
  direccion: string;
  ciudad: string;
  zona: string;
  telefonoContacto: string;
  capacidadAtencion: number;
  ventanillas: string[];
}

export const SEDES_SIMULADAS: SedeSimulada[] = [
  { nombreSede: 'Sede Fusagasugá', direccion: 'Cra 8 # 10-45', ciudad: 'Fusagasugá', zona: 'Centro', telefonoContacto: '3011234567', capacidadAtencion: 80, ventanillas: ['M1', 'M2', 'M3'] },
  { nombreSede: 'Sede Chapinero', direccion: 'Cra 13 # 53-44', ciudad: 'Bogotá D. C.', zona: 'Chapinero', telefonoContacto: '3012345678', capacidadAtencion: 60, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Galerías', direccion: 'Calle 53B # 24-18', ciudad: 'Bogotá D. C.', zona: 'Teusaquillo', telefonoContacto: '3023456789', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Suba', direccion: 'Av. Suba # 115-58', ciudad: 'Bogotá D. C.', zona: 'Suba', telefonoContacto: '3034567890', capacidadAtencion: 70, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Kennedy', direccion: 'Av. Primero de Mayo # 78-30', ciudad: 'Bogotá D. C.', zona: 'Kennedy', telefonoContacto: '3045678901', capacidadAtencion: 75, ventanillas: ['M1', 'M2', 'M3'] },
  { nombreSede: 'Sede Usaquén', direccion: 'Cra 7 # 119-14', ciudad: 'Bogotá D. C.', zona: 'Usaquén', telefonoContacto: '3056789012', capacidadAtencion: 50, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Soacha Centro', direccion: 'Cra 7 # 13-20', ciudad: 'Soacha', zona: 'Centro', telefonoContacto: '3067890123', capacidadAtencion: 55, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede El Poblado', direccion: 'Cra 43A # 7-50', ciudad: 'Medellín', zona: 'El Poblado', telefonoContacto: '3078901234', capacidadAtencion: 65, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Laureles', direccion: 'Circular 4 # 70-15', ciudad: 'Medellín', zona: 'Laureles', telefonoContacto: '3089012345', capacidadAtencion: 55, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede San Fernando', direccion: 'Av. 4 Norte # 24-10', ciudad: 'Cali', zona: 'San Fernando', telefonoContacto: '3090123456', capacidadAtencion: 60, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Granada', direccion: 'Av. 9 Norte # 14-35', ciudad: 'Cali', zona: 'Granada', telefonoContacto: '3101234567', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Norte Barranquilla', direccion: 'Cra 53 # 79-120', ciudad: 'Barranquilla', zona: 'Norte', telefonoContacto: '3112345678', capacidadAtencion: 60, ventanillas: ['M1', 'M2'] },
];

/**
 * Otras entidades de salud (sus sedes son ficticias) para que el paciente pueda
 * elegir entre varios centros médicos por ciudad y zona.
 */
export interface EntidadSimulada {
  nombre: string;
  /** Prefijo de los códigos de servicio (deben ser únicos entre entidades). */
  prefijo: string;
  sedes: SedeSimulada[];
}

export const ENTIDADES_ADICIONALES_SIMULADAS: EntidadSimulada[] = [
  {
    nombre: 'Sanitas EPS',
    prefijo: 'SAN',
    sedes: [
    { nombreSede: 'Sede Sanitas Chapinero', direccion: 'Cra 14 # 67-20', ciudad: 'Bogotá D. C.', zona: 'Chapinero', telefonoContacto: '3121110001', capacidadAtencion: 50, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Sanitas Suba', direccion: 'Cll 145 # 91-19', ciudad: 'Bogotá D. C.', zona: 'Suba', telefonoContacto: '3121110002', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Sanitas Kennedy', direccion: 'Cll 38 Sur # 78H-15', ciudad: 'Bogotá D. C.', zona: 'Kennedy', telefonoContacto: '3121110003', capacidadAtencion: 45, ventanillas: ['M1'] },
    { nombreSede: 'Sede Sanitas El Poblado', direccion: 'Cll 10 # 38-24', ciudad: 'Medellín', zona: 'El Poblado', telefonoContacto: '3121110004', capacidadAtencion: 40, ventanillas: ['M1', 'M2'] },
    ],
  },
  {
    nombre: 'Compensar EPS',
    prefijo: 'COM',
    sedes: [
    { nombreSede: 'Centro Compensar Teusaquillo', direccion: 'Av. 68 # 49A-47', ciudad: 'Bogotá D. C.', zona: 'Teusaquillo', telefonoContacto: '3132220001', capacidadAtencion: 90, ventanillas: ['M1', 'M2', 'M3'] },
    { nombreSede: 'Centro Compensar Usaquén', direccion: 'Cra 15 # 118-30', ciudad: 'Bogotá D. C.', zona: 'Usaquén', telefonoContacto: '3132220002', capacidadAtencion: 55, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Centro Compensar Soacha', direccion: 'Cll 13 # 9-40', ciudad: 'Soacha', zona: 'Centro', telefonoContacto: '3132220003', capacidadAtencion: 40, ventanillas: ['M1'] },
    { nombreSede: 'Centro Compensar Fusagasugá', direccion: 'Cll 6 # 6-52', ciudad: 'Fusagasugá', zona: 'Centro', telefonoContacto: '3132220004', capacidadAtencion: 35, ventanillas: ['M1'] },
    ],
  },
  {
    nombre: 'Sura EPS',
    prefijo: 'SUR',
    sedes: [
    { nombreSede: 'Sede Sura Laureles', direccion: 'Cll 33 # 76-20', ciudad: 'Medellín', zona: 'Laureles', telefonoContacto: '3143330001', capacidadAtencion: 60, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Sura El Poblado', direccion: 'Cra 48 # 10-45', ciudad: 'Medellín', zona: 'El Poblado', telefonoContacto: '3143330002', capacidadAtencion: 60, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Sura San Fernando', direccion: 'Cll 5 # 38-10', ciudad: 'Cali', zona: 'San Fernando', telefonoContacto: '3143330003', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Sura Chapinero', direccion: 'Cll 72 # 10-07', ciudad: 'Bogotá D. C.', zona: 'Chapinero', telefonoContacto: '3143330004', capacidadAtencion: 50, ventanillas: ['M1', 'M2'] },
    ],
  },
  {
    nombre: 'Famisanar EPS',
    prefijo: 'FAM',
    sedes: [
    { nombreSede: 'Sede Famisanar Kennedy', direccion: 'Cll 8 Sur # 80-45', ciudad: 'Bogotá D. C.', zona: 'Kennedy', telefonoContacto: '3154440001', capacidadAtencion: 55, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Famisanar Suba', direccion: 'Cra 92 # 146-20', ciudad: 'Bogotá D. C.', zona: 'Suba', telefonoContacto: '3154440002', capacidadAtencion: 50, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Famisanar Granada', direccion: 'Av. 8 Norte # 20-12', ciudad: 'Cali', zona: 'Granada', telefonoContacto: '3154440003', capacidadAtencion: 40, ventanillas: ['M1'] },
    { nombreSede: 'Sede Famisanar Barranquilla', direccion: 'Cll 74 # 54-30', ciudad: 'Barranquilla', zona: 'Norte', telefonoContacto: '3154440004', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
    ],
  },
  {
    nombre: 'Salud Total EPS',
    prefijo: 'SAT',
    sedes: [
    { nombreSede: 'Sede Salud Total Usaquén', direccion: 'Cll 134 # 7B-83', ciudad: 'Bogotá D. C.', zona: 'Usaquén', telefonoContacto: '3165550001', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Salud Total Teusaquillo', direccion: 'Cra 24 # 39-20', ciudad: 'Bogotá D. C.', zona: 'Teusaquillo', telefonoContacto: '3165550002', capacidadAtencion: 40, ventanillas: ['M1'] },
    { nombreSede: 'Sede Salud Total Granada', direccion: 'Cll 17 Norte # 6-30', ciudad: 'Cali', zona: 'Granada', telefonoContacto: '3165550003', capacidadAtencion: 40, ventanillas: ['M1', 'M2'] },
    { nombreSede: 'Sede Salud Total Laureles', direccion: 'Cra 70 # 44-15', ciudad: 'Medellín', zona: 'Laureles', telefonoContacto: '3165550004', capacidadAtencion: 40, ventanillas: ['M1'] },
    ],
  },
];

/**
 * Existencias por medicamento (código) en cada sede (nombre). Se cubren
 * a propósito los casos que muestra el diseño: disponible, baja
 * disponibilidad y agotado, para poder demostrar cada estado.
 * Valor 0 = agotado en esa sede; ausente = esa sede no maneja el producto.
 */
export const STOCK_SIMULADO: Record<string, Record<string, number>> = {
  'CUM-1001': { 'Sede Fusagasugá': 1248, 'Sede Chapinero': 420, 'Sede Galerías': 90 },
  'CUM-1002': { 'Sede Fusagasugá': 862, 'Sede Chapinero': 530, 'Sede Galerías': 310 },
  'CUM-1003': { 'Sede Fusagasugá': 94, 'Sede Chapinero': 12, 'Sede Galerías': 0 },
  'CUM-1004': { 'Sede Fusagasugá': 0, 'Sede Chapinero': 0, 'Sede Galerías': 0 },
  'CUM-1005': { 'Sede Fusagasugá': 640, 'Sede Chapinero': 215, 'Sede Galerías': 180 },
  'CUM-1006': { 'Sede Fusagasugá': 380, 'Sede Chapinero': 140 },
  'CUM-1007': { 'Sede Fusagasugá': 520, 'Sede Chapinero': 60, 'Sede Galerías': 25 },
  'CUM-1008': { 'Sede Fusagasugá': 300, 'Sede Galerías': 210 },
  'CUM-1009': { 'Sede Fusagasugá': 410, 'Sede Chapinero': 150 },
  'CUM-1010': { 'Sede Fusagasugá': 75, 'Sede Chapinero': 8 },
  'CUM-1011': { 'Sede Fusagasugá': 55, 'Sede Chapinero': 40, 'Sede Galerías': 0 },
  'CUM-1012': { 'Sede Fusagasugá': 260, 'Sede Chapinero': 190, 'Sede Galerías': 120 },
  'CUM-1013': { 'Sede Fusagasugá': 700, 'Sede Galerías': 330 },
  'CUM-1014': { 'Sede Fusagasugá': 18, 'Sede Chapinero': 0 },
  'CUM-1015': { 'Sede Fusagasugá': 96, 'Sede Chapinero': 44 },
  'CUM-1016': { 'Sede Fusagasugá': 30 },
  'CUM-1017': { 'Sede Fusagasugá': 210, 'Sede Chapinero': 85 },
  'CUM-1018': { 'Sede Fusagasugá': 330, 'Sede Chapinero': 100, 'Sede Galerías': 75 },
  'CUM-1019': { 'Sede Fusagasugá': 150, 'Sede Galerías': 20 },
  'CUM-1020': { 'Sede Fusagasugá': 65, 'Sede Chapinero': 32 },
};

export interface ProfesionalSimulado {
  registroMedico: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  sede: string;
}

export const PROFESIONALES_SIMULADOS: ProfesionalSimulado[] = [
  { registroMedico: 'RM-20001', nombres: 'Valentina', apellidos: 'Gómez Ríos', especialidad: 'Medicina general', sede: 'Sede Chapinero' },
  { registroMedico: 'RM-20002', nombres: 'Andrés', apellidos: 'Castaño Mejía', especialidad: 'Medicina general', sede: 'Sede Fusagasugá' },
  { registroMedico: 'RM-20003', nombres: 'Camila', apellidos: 'Ortega Peña', especialidad: 'Odontología', sede: 'Sede Chapinero' },
  { registroMedico: 'RM-20004', nombres: 'Julián', apellidos: 'Rojas Vega', especialidad: 'Dermatología', sede: 'Sede Chapinero' },
  { registroMedico: 'RM-20005', nombres: 'Sofía', apellidos: 'Herrera Díaz', especialidad: 'Nutrición', sede: 'Sede Chapinero' },
  { registroMedico: 'RM-20006', nombres: 'Mateo', apellidos: 'Salazar Luna', especialidad: 'Cardiología', sede: 'Sede Fusagasugá' },
  { registroMedico: 'RM-20007', nombres: 'Daniela', apellidos: 'Pardo Núñez', especialidad: 'Pediatría', sede: 'Sede Fusagasugá' },
  { registroMedico: 'RM-20008', nombres: 'Santiago', apellidos: 'Arias Beltrán', especialidad: 'Endocrinología', sede: 'Sede Galerías' },
  { registroMedico: 'RM-20009', nombres: 'Laura', apellidos: 'Cárdenas Silva', especialidad: 'Medicina general', sede: 'Sede Galerías' },
  { registroMedico: 'RM-20010', nombres: 'Felipe', apellidos: 'Mora Quintero', especialidad: 'Psiquiatría', sede: 'Sede Fusagasugá' },
  { registroMedico: 'RM-20011', nombres: 'Natalia', apellidos: 'Vargas Ospina', especialidad: 'Odontología', sede: 'Sede Fusagasugá' },
  { registroMedico: 'RM-20012', nombres: 'Esteban', apellidos: 'Ruiz Cañón', especialidad: 'Dermatología', sede: 'Sede Galerías' },
  { registroMedico: 'RM-20013', nombres: 'Paula', apellidos: 'Mendoza Triana', especialidad: 'Pediatría', sede: 'Sede Chapinero' },
  { registroMedico: 'RM-20014', nombres: 'Ricardo', apellidos: 'Lozano Prieto', especialidad: 'Cardiología', sede: 'Sede Galerías' },

];

export interface PersonaSimulada {
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
}

/** Pacientes ficticios para llenar la fila, las citas y los reportes. */
export const PACIENTES_SIMULADOS: PersonaSimulada[] = [
  { numeroDocumento: '1000000101', nombres: 'María Fernanda', apellidos: 'López Rincón', email: 'maria.lopez@filacero.demo', telefono: '3101110101' },
  { numeroDocumento: '1000000102', nombres: 'Juan David', apellidos: 'Martínez Soto', email: 'juan.martinez@filacero.demo', telefono: '3101110102' },
  { numeroDocumento: '1000000103', nombres: 'Luisa', apellidos: 'Ramírez Cruz', email: 'luisa.ramirez@filacero.demo', telefono: '3101110103' },
  { numeroDocumento: '1000000104', nombres: 'Pedro', apellidos: 'Sánchez Duarte', email: 'pedro.sanchez@filacero.demo', telefono: '3101110104' },
  { numeroDocumento: '1000000105', nombres: 'Ana Sofía', apellidos: 'Torres Bernal', email: 'ana.torres@filacero.demo', telefono: '3101110105' },
  { numeroDocumento: '1000000106', nombres: 'Camilo', apellidos: 'Gutiérrez Pinto', email: 'camilo.gutierrez@filacero.demo', telefono: '3101110106' },
  { numeroDocumento: '1000000107', nombres: 'Diana Carolina', apellidos: 'Moreno Acosta', email: 'diana.moreno@filacero.demo', telefono: '3101110107' },
  { numeroDocumento: '1000000108', nombres: 'Sebastián', apellidos: 'Vega Londoño', email: 'sebastian.vega@filacero.demo', telefono: '3101110108' },
  { numeroDocumento: '1000000109', nombres: 'Valeria', apellidos: 'Cortés Navarro', email: 'valeria.cortes@filacero.demo', telefono: '3101110109' },
  { numeroDocumento: '1000000110', nombres: 'Hugo', apellidos: 'Patiño Ibarra', email: 'hugo.patino@filacero.demo', telefono: '3101110110' },
  { numeroDocumento: '1000000111', nombres: 'Isabela', apellidos: 'Cruz Montoya', email: 'isabela.cruz@filacero.demo', telefono: '3101110111' },
  { numeroDocumento: '1000000112', nombres: 'Tomás', apellidos: 'Rey Ballesteros', email: 'tomas.rey@filacero.demo', telefono: '3101110112' },
];

/** Personal de atención adicional; cada uno se asocia a una sede en la demo. */
export const FUNCIONARIOS_SIMULADOS: PersonaSimulada[] = [
  { numeroDocumento: '1000000201', nombres: 'Marcela', apellidos: 'Quiroga Páez', email: 'marcela.quiroga@filacero.demo', telefono: '3201110201' },
  { numeroDocumento: '1000000202', nombres: 'Óscar', apellidos: 'Bermúdez Rueda', email: 'oscar.bermudez@filacero.demo', telefono: '3201110202' },
  { numeroDocumento: '1000000203', nombres: 'Liliana', apellidos: 'Ortiz Camargo', email: 'liliana.ortiz@filacero.demo', telefono: '3201110203' },
  { numeroDocumento: '1000000204', nombres: 'Fabián', apellidos: 'Posada Lara', email: 'fabian.posada@filacero.demo', telefono: '3201110204' },
];
