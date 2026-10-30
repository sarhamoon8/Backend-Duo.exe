import { Profesional } from '../../domain/profesional.entity';

export class ProfesionalResponseDto {
  id: string;
  registroMedico: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  activo: boolean;
  puntoId: string;

  static fromEntity(profesional: Profesional): ProfesionalResponseDto {
    const dto = new ProfesionalResponseDto();
    dto.id = profesional.id;
    dto.registroMedico = profesional.registroMedico;
    dto.nombres = profesional.nombres;
    dto.apellidos = profesional.apellidos;
    dto.especialidad = profesional.especialidad;
    dto.activo = profesional.activo;
    dto.puntoId = profesional.puntoId;
    return dto;
  }
}
