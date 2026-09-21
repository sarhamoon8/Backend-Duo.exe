import { EntidadMedica } from './entidad-medica.entity';

export interface NuevaEntidadMedica {
  nombre: string;
}

export interface EntidadMedicaRepository {
  crear(entidad: NuevaEntidadMedica): Promise<EntidadMedica>;
  buscarPorId(id: string): Promise<EntidadMedica | null>;
  listar(): Promise<EntidadMedica[]>;
}

export const ENTIDAD_MEDICA_REPOSITORY = Symbol('ENTIDAD_MEDICA_REPOSITORY');
