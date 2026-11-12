import { Profesional as ProfesionalPrisma } from '@prisma/client';
import { Profesional } from '../../domain/profesional.entity';

export class ProfesionalMapper {
  static toDomain(profesionalPrisma: ProfesionalPrisma): Profesional {
    return new Profesional(
      profesionalPrisma.id,
      profesionalPrisma.registroMedico,
      profesionalPrisma.nombres,
      profesionalPrisma.apellidos,
      profesionalPrisma.especialidad,
      profesionalPrisma.activo,
      profesionalPrisma.puntoId,
    );
  }
}
