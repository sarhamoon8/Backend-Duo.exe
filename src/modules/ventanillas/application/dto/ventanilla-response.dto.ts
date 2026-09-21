import { Ventanilla } from '../../domain/ventanilla.entity';

export class VentanillaResponseDto {
  id: string;
  puntoId: string;
  numeroModulo: string;
  estadoOperativo: string;

  static fromEntity(ventanilla: Ventanilla): VentanillaResponseDto {
    const dto = new VentanillaResponseDto();
    dto.id = ventanilla.id;
    dto.puntoId = ventanilla.puntoId;
    dto.numeroModulo = ventanilla.numeroModulo;
    dto.estadoOperativo = ventanilla.estadoOperativo;
    return dto;
  }
}
