import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cita } from '../../domain/cita.entity';
import { EstadoCita } from '../../domain/estado-cita.enum';
import { CITA_REPOSITORY } from '../../domain/cita.repository';
import type { CitaRepository } from '../../domain/cita.repository';
import { Rol } from '../../../usuarios/domain/rol.enum';

@Injectable()
export class CancelarCitaUseCase {
  constructor(
    @Inject(CITA_REPOSITORY)
    private readonly citaRepository: CitaRepository,
  ) {}

  // El paciente cancela solo las suyas; el personal y el ADMIN, cualquiera.
  async ejecutar(
    id: string,
    usuario: { id: string; rol: Rol },
    ahora: Date = new Date(),
  ): Promise<Cita> {
    const cita = await this.citaRepository.buscarPorId(id);
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }
    const esDelPaciente = cita.pacienteId === usuario.id;
    const esPersonal =
      usuario.rol === Rol.FUNCIONARIO || usuario.rol === Rol.ADMIN;
    if (!esDelPaciente && !esPersonal) {
      throw new ForbiddenException(
        'No puedes cancelar la cita de otra persona',
      );
    }
    if (cita.estado !== EstadoCita.PROGRAMADA) {
      throw new BadRequestException(
        'Solo se pueden cancelar citas programadas',
      );
    }
    if (cita.fechaHora.getTime() <= ahora.getTime()) {
      throw new BadRequestException('La cita ya pasó y no se puede cancelar');
    }
    return this.citaRepository.cancelar(id);
  }
}
