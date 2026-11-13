import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { HORARIO_REPOSITORY } from '../../domain/horario.repository';
import type { HorarioRepository } from '../../domain/horario.repository';
import { PROFESIONAL_REPOSITORY } from '../../../profesionales/domain/profesional.repository';
import type { ProfesionalRepository } from '../../../profesionales/domain/profesional.repository';
import { candidatosParaFranja } from '../../domain/asignador-de-doctor';
import {
  diaSemanaIso,
  esFechaValida,
  franjasDelDia,
  instanteColombia,
  rangoDelDia,
} from '../../domain/franjas';
import { ConsultarDisponibilidadDto } from '../dto/consultar-disponibilidad.dto';
import { DisponibilidadResponseDto } from '../dto/cita-response.dto';

// Una cita no se puede pedir con menos de este margen de anticipación.
export const MINUTOS_MINIMOS_ANTICIPACION = 30;

@Injectable()
export class ConsultarDisponibilidadUseCase {
  constructor(
    @Inject(PROFESIONAL_REPOSITORY)
    private readonly profesionalRepository: ProfesionalRepository,
    @Inject(HORARIO_REPOSITORY)
    private readonly horarioRepository: HorarioRepository,
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
  ) {}

  /** Horas libres de una especialidad en una sede un día dado. */
  async ejecutar(
    dto: ConsultarDisponibilidadDto,
    ahora: Date = new Date(),
  ): Promise<DisponibilidadResponseDto> {
    if (!esFechaValida(dto.fecha)) {
      throw new BadRequestException('La fecha no es válida');
    }

    const profesionales = await this.profesionalRepository.listar({
      puntoId: dto.puntoId,
      especialidad: dto.especialidad,
    });
    const respuesta = new DisponibilidadResponseDto();
    respuesta.fecha = dto.fecha;
    respuesta.especialidad = dto.especialidad;
    respuesta.puntoId = dto.puntoId;
    respuesta.franjas = [];
    if (profesionales.length === 0) return respuesta;

    const ids = profesionales.map((p) => p.id);
    const horarios = await this.horarioRepository.listarPorProfesionales(ids);
    const { desde, hasta } = rangoDelDia(dto.fecha);
    const ocupadas = await this.citaRepository.ocupadasEntre(ids, desde, hasta);

    const horasDelDia = new Set(
      franjasDelDia(horarios, diaSemanaIso(dto.fecha)),
    );
    const limite = ahora.getTime() + MINUTOS_MINIMOS_ANTICIPACION * 60_000;

    for (const hora of [...horasDelDia].sort()) {
      const fechaHora = instanteColombia(dto.fecha, hora);
      if (fechaHora.getTime() < limite) continue;
      const candidatos = candidatosParaFranja({
        profesionales,
        horarios,
        ocupadas,
        fecha: dto.fecha,
        hora,
      });
      if (candidatos.length > 0) {
        respuesta.franjas.push({
          hora,
          fechaHora,
          doctoresDisponibles: candidatos.length,
        });
      }
    }
    return respuesta;
  }
}
