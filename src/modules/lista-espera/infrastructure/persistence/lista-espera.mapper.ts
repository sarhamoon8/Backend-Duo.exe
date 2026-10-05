import { ListaEspera as ListaEsperaPrisma } from '@prisma/client';
import { ListaEspera } from '../../domain/lista-espera.entity';

export class ListaEsperaMapper {
  static toDomain(listaEsperaPrisma: ListaEsperaPrisma): ListaEspera {
    return new ListaEspera(
      listaEsperaPrisma.id,
      listaEsperaPrisma.usuarioId,
      listaEsperaPrisma.servicioId,
      listaEsperaPrisma.puntoId,
      listaEsperaPrisma.creadoEn,
    );
  }
}
