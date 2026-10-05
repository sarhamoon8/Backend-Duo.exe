import { ListaEspera } from '../../domain/lista-espera.entity';

export class ListaEsperaResponseDto {
  id: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  creadoEn: Date;
  // Calculada en la consulta, no persistida (mismo patrón que la posición
  // de un turno): cuántas inscripciones del mismo servicio+punto son más
  // antiguas, +1.
  posicion: number;

  static fromEntity(
    entrada: ListaEspera,
    posicion: number,
  ): ListaEsperaResponseDto {
    const dto = new ListaEsperaResponseDto();
    dto.id = entrada.id;
    dto.usuarioId = entrada.usuarioId;
    dto.servicioId = entrada.servicioId;
    dto.puntoId = entrada.puntoId;
    dto.creadoEn = entrada.creadoEn;
    dto.posicion = posicion;
    return dto;
  }
}
