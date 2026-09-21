import { PuntoDispensacion as PuntoDispensacionPrisma } from '@prisma/client';
import { PuntoDispensacion } from '../../domain/punto-dispensacion.entity';

export class PuntoDispensacionMapper {
  static toDomain(
    puntoPrisma: PuntoDispensacionPrisma,
  ): PuntoDispensacion {
    return new PuntoDispensacion(
      puntoPrisma.id,
      puntoPrisma.entidadId,
      puntoPrisma.nombreSede,
      puntoPrisma.direccion,
      puntoPrisma.ciudad,
      puntoPrisma.telefonoContacto,
      puntoPrisma.capacidadAtencion,
    );
  }
}
