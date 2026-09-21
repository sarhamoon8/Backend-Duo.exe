import { Servicio } from './servicio.entity';

export interface NuevoServicio {
  codigoServicio: string;
  nombre: string;
  tiempoPromedioMin: number;
  activo?: boolean;
  entidadId: string;
}

export interface ServicioRepository {
  crear(servicio: NuevoServicio): Promise<Servicio>;
  buscarPorId(id: string): Promise<Servicio | null>;
  buscarPorCodigo(codigoServicio: string): Promise<Servicio | null>;
  listarPorEntidad(entidadId: string): Promise<Servicio[]>;
  listar(): Promise<Servicio[]>;
}

export const SERVICIO_REPOSITORY = Symbol('SERVICIO_REPOSITORY');
