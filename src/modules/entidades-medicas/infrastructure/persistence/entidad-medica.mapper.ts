import { EntidadMedica as EntidadMedicaPrisma } from '@prisma/client';
import { EntidadMedica } from '../../domain/entidad-medica.entity';

export class EntidadMedicaMapper {
  static toDomain(entidadPrisma: EntidadMedicaPrisma): EntidadMedica {
    return new EntidadMedica(entidadPrisma.id, entidadPrisma.nombre);
  }
}
