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
  telefonoContacto: string;
  capacidadAtencion: number;
  ventanillas: string[];
}

export const SEDES_SIMULADAS: SedeSimulada[] = [
  { nombreSede: 'Sede Fusagasugá', direccion: 'Cra 8 # 10-45', ciudad: 'Fusagasugá', telefonoContacto: '3011234567', capacidadAtencion: 80, ventanillas: ['M1', 'M2', 'M3'] },
  { nombreSede: 'Sede Chapinero', direccion: 'Cra 13 # 53-44', ciudad: 'Bogotá D. C.', telefonoContacto: '3012345678', capacidadAtencion: 60, ventanillas: ['M1', 'M2'] },
  { nombreSede: 'Sede Galerías', direccion: 'Calle 53B # 24-18', ciudad: 'Bogotá D. C.', telefonoContacto: '3023456789', capacidadAtencion: 45, ventanillas: ['M1', 'M2'] },
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
];
