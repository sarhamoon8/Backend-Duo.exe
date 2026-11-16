import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USUARIO_REPOSITORY } from '../../../usuarios/domain/usuario.repository';
import type { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { TOKEN_RECUPERACION_REPOSITORY } from '../../domain/token-recuperacion.repository';
import type { TokenRecuperacionRepository } from '../../domain/token-recuperacion.repository';
import { RestablecerPasswordDto } from '../dto/recuperar-password.dto';
import { hashDeToken } from './solicitar-recuperacion.use-case';

const SALT_ROUNDS = 10;

@Injectable()
export class RestablecerPasswordUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(TOKEN_RECUPERACION_REPOSITORY)
    private readonly tokenRepository: TokenRecuperacionRepository,
  ) {}

  async ejecutar(
    dto: RestablecerPasswordDto,
    ahora: Date = new Date(),
  ): Promise<void> {
    const token = await this.tokenRepository.buscarVigentePorHash(
      hashDeToken(dto.token),
      ahora,
    );
    // Mismo mensaje para enlace inexistente, vencido o ya usado.
    const enlaceInvalido = new BadRequestException(
      'El enlace no es válido o ya venció. Solicita uno nuevo.',
    );
    if (!token) throw enlaceInvalido;

    if (!(await this.tokenRepository.marcarUsado(token.id, ahora))) {
      throw enlaceInvalido;
    }

    await this.usuarioRepository.actualizarPassword(
      token.usuarioId,
      await bcrypt.hash(dto.password, SALT_ROUNDS),
    );
    // Cualquier otro enlace pendiente de la persona deja de servir.
    await this.tokenRepository.invalidarPendientes(token.usuarioId);
  }
}
