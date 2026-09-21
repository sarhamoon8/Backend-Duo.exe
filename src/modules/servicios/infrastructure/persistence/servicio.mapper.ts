import { Servicio as ServicioPrisma } from '@prisma/client';
import { Servicio } from '../../domain/servicio.entity';

export class ServicioMapper {
  static toDomain(servicioPrisma: ServicioPrisma): Servicio {
    return new Servicio(
      servicioPrisma.id,
      servicioPrisma.nombre,
      servicioPrisma.entidadId,
    );
  }
}
