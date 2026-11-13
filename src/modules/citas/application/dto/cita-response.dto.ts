import { Cita } from '../../domain/cita.entity';
import { Profesional } from '../../../profesionales/domain/profesional.entity';

export class ProfesionalCitaDto {
  id: string;
  nombres: string;
  apellidos: string;
  registroMedico: string;
}

export class CitaResponseDto {
  id: string;
  pacienteId: string;
  puntoId: string;
  especialidad: string;
  fechaHora: Date;
  estado: string;
  profesional: ProfesionalCitaDto | null;

  static fromEntity(
    cita: Cita,
    profesional: Profesional | null,
  ): CitaResponseDto {
    const dto = new CitaResponseDto();
    dto.id = cita.id;
    dto.pacienteId = cita.pacienteId;
    dto.puntoId = cita.puntoId;
    dto.especialidad = cita.especialidad;
    dto.fechaHora = cita.fechaHora;
    dto.estado = cita.estado;
    dto.profesional = profesional
      ? {
          id: profesional.id,
          nombres: profesional.nombres,
          apellidos: profesional.apellidos,
          registroMedico: profesional.registroMedico,
        }
      : null;
    return dto;
  }
}

export class FranjaDisponibleDto {
  hora: string;
  fechaHora: Date;
  doctoresDisponibles: number;
}

export class DisponibilidadResponseDto {
  fecha: string;
  especialidad: string;
  puntoId: string;
  franjas: FranjaDisponibleDto[];
}
