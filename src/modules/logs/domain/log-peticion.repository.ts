import { LogPeticion } from './log-peticion.entity';

export interface NuevoLogPeticion {
  metodo: string;
  ruta: string;
  codigoEstado: number;
  duracionMs: number;
  usuarioId?: string | null;
  ip?: string | null;
  mensaje?: string | null;
}

export interface LogPeticionRepository {
  registrar(log: NuevoLogPeticion): Promise<LogPeticion>;
  // Más reciente primero, con un límite para no traer la tabla completa.
  listarRecientes(limite: number): Promise<LogPeticion[]>;
}

export const LOG_PETICION_REPOSITORY = Symbol('LOG_PETICION_REPOSITORY');
