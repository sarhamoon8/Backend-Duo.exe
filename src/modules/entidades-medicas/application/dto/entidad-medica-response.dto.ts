import { EntidadMedica } from '../../domain/entidad-medica.entity';

export class EntidadMedicaResponseDto {
  id: string;
  nombre: string;

  static fromEntity(entidad: EntidadMedica): EntidadMedicaResponseDto {
    const dto = new EntidadMedicaResponseDto();
    dto.id = entidad.id;
    dto.nombre = entidad.nombre;
    return dto;
  }
}
