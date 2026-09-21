import { Servicio as ServicioPrisma } from '@prisma/client';
import { Servicio } from '../../domain/servicio.entity';

export class ServicioMapper {
  static toDomain(servicioPrisma: ServicioPrisma): Servicio {
    return new Servicio(
      servicioPrisma.id,
      servicioPrisma.codigoServicio,
      servicioPrisma.nombre,
      servicioPrisma.tiempoPromedioMin,
      servicioPrisma.activo,
      servicioPrisma.entidadId,
    );
  }
}
