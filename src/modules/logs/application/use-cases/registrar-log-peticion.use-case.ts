import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  LOG_PETICION_REPOSITORY,
  NuevoLogPeticion,
} from '../../domain/log-peticion.repository';
import type { LogPeticionRepository } from '../../domain/log-peticion.repository';

// Igual que EnviarNotificacionUseCase (RF-05): esto nunca debe tumbar la
// petición que lo originó. Si la base de datos no puede recibir el log
// (por la razón que sea), se avisa por el logger nativo de Nest y se sigue
// — perder una fila de auditoría es aceptable, romper la respuesta al
// cliente por un problema de logging no lo es.
@Injectable()
export class RegistrarLogPeticionUseCase {
  private readonly logger = new Logger(RegistrarLogPeticionUseCase.name);

  constructor(
    @Inject(LOG_PETICION_REPOSITORY)
    private readonly logPeticionRepository: LogPeticionRepository,
  ) {}

  async ejecutar(log: NuevoLogPeticion): Promise<void> {
    try {
      await this.logPeticionRepository.registrar(log);
    } catch (error) {
      this.logger.warn(
        `No se pudo persistir el log de ${log.metodo} ${log.ruta}: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      );
    }
  }
}
