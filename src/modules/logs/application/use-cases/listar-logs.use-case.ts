import { Inject, Injectable } from '@nestjs/common';
import { LogPeticion } from '../../domain/log-peticion.entity';
import { LOG_PETICION_REPOSITORY } from '../../domain/log-peticion.repository';
import type { LogPeticionRepository } from '../../domain/log-peticion.repository';

const LIMITE_MAXIMO = 200;
const LIMITE_POR_DEFECTO = 50;

@Injectable()
export class ListarLogsUseCase {
  constructor(
    @Inject(LOG_PETICION_REPOSITORY)
    private readonly logPeticionRepository: LogPeticionRepository,
  ) {}

  ejecutar(limite?: number): Promise<LogPeticion[]> {
    const limiteSeguro = Math.min(limite ?? LIMITE_POR_DEFECTO, LIMITE_MAXIMO);
    return this.logPeticionRepository.listarRecientes(limiteSeguro);
  }
}
