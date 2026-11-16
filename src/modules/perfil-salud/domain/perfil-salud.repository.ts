import { PerfilSalud } from './perfil-salud.entity';

export interface DatosPerfilSalud {
  grupoSanguineo?: string | null;
  alergias?: string | null;
  condicionesCronicas?: string | null;
  contactoEmergenciaNombre?: string | null;
  contactoEmergenciaTelefono?: string | null;
}

export interface PerfilSaludRepository {
  buscarPorUsuario(usuarioId: string): Promise<PerfilSalud | null>;
  // RF-10: el propio usuario reporta/edita su información básica de salud;
  // no existe un formulario de "crear" separado, por eso es upsert.
  actualizar(usuarioId: string, datos: DatosPerfilSalud): Promise<PerfilSalud>;
}

export const PERFIL_SALUD_REPOSITORY = Symbol('PERFIL_SALUD_REPOSITORY');
