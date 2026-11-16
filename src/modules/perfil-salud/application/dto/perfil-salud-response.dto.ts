import { PerfilSalud } from '../../domain/perfil-salud.entity';

export class PerfilSaludResponseDto {
  id: string;
  usuarioId: string;
  grupoSanguineo: string | null;
  alergias: string | null;
  condicionesCronicas: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  actualizadoEn: Date;

  static fromEntity(perfil: PerfilSalud): PerfilSaludResponseDto {
    const dto = new PerfilSaludResponseDto();
    dto.id = perfil.id;
    dto.usuarioId = perfil.usuarioId;
    dto.grupoSanguineo = perfil.grupoSanguineo;
    dto.alergias = perfil.alergias;
    dto.condicionesCronicas = perfil.condicionesCronicas;
    dto.contactoEmergenciaNombre = perfil.contactoEmergenciaNombre;
    dto.contactoEmergenciaTelefono = perfil.contactoEmergenciaTelefono;
    dto.actualizadoEn = perfil.actualizadoEn;
    return dto;
  }
}
