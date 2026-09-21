import { Ventanilla as VentanillaPrisma } from '@prisma/client';
import { Ventanilla } from '../../domain/ventanilla.entity';
import { EstadoOperativoVentanilla } from '../../domain/estado-operativo-ventanilla.enum';

export class VentanillaMapper {
  static toDomain(ventanillaPrisma: VentanillaPrisma): Ventanilla {
    return new Ventanilla(
      ventanillaPrisma.id,
      ventanillaPrisma.puntoId,
      ventanillaPrisma.numeroModulo,
      ventanillaPrisma.estadoOperativo as unknown as EstadoOperativoVentanilla,
    );
  }
}
