import { PerfilSalud as PerfilSaludPrisma } from '@prisma/client';
import { PerfilSalud } from '../../domain/perfil-salud.entity';

export class PerfilSaludMapper {
  static toDomain(perfilPrisma: PerfilSaludPrisma): PerfilSalud {
    return new PerfilSalud(
      perfilPrisma.id,
      perfilPrisma.usuarioId,
      perfilPrisma.grupoSanguineo,
      perfilPrisma.alergias,
      perfilPrisma.condicionesCronicas,
      perfilPrisma.contactoEmergenciaNombre,
      perfilPrisma.contactoEmergenciaTelefono,
      perfilPrisma.actualizadoEn,
    );
  }
}
