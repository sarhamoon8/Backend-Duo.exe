import { PuntoDispensacion } from './punto-dispensacion.entity';

export interface NuevoPuntoDispensacion {
  entidadId: string;
  nombreSede: string;
  direccion: string;
  ciudad: string;
  telefonoContacto?: string | null;
  capacidadAtencion: number;
}

export interface PuntoDispensacionRepository {
  crear(punto: NuevoPuntoDispensacion): Promise<PuntoDispensacion>;
  buscarPorId(id: string): Promise<PuntoDispensacion | null>;
  listarPorEntidad(entidadId: string): Promise<PuntoDispensacion[]>;
  listar(): Promise<PuntoDispensacion[]>;
}

export const PUNTO_DISPENSACION_REPOSITORY = Symbol(
  'PUNTO_DISPENSACION_REPOSITORY',
);
