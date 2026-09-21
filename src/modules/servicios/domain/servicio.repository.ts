import { Servicio } from './servicio.entity';

export interface NuevoServicio {
  nombre: string;
  entidadId: string;
}

export interface ServicioRepository {
  crear(servicio: NuevoServicio): Promise<Servicio>;
  buscarPorId(id: string): Promise<Servicio | null>;
  listarPorEntidad(entidadId: string): Promise<Servicio[]>;
  listar(): Promise<Servicio[]>;
}

export const SERVICIO_REPOSITORY = Symbol('SERVICIO_REPOSITORY');
