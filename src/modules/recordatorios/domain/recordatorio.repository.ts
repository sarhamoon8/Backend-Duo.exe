import { Recordatorio } from './recordatorio.entity';

export interface NuevoRecordatorio {
  usuarioId: string;
  medicamentoId: string;
  mensaje: string;
  horaRecordatorio: string;
}

export interface RecordatorioRepository {
  crear(recordatorio: NuevoRecordatorio): Promise<Recordatorio>;
  buscarPorId(id: string): Promise<Recordatorio | null>;
  listarPorUsuario(usuarioId: string): Promise<Recordatorio[]>;
  actualizarActivo(id: string, activo: boolean): Promise<Recordatorio>;
  eliminar(id: string): Promise<void>;
}

export const RECORDATORIO_REPOSITORY = Symbol('RECORDATORIO_REPOSITORY');
