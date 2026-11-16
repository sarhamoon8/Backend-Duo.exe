import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CrearUsuarioUseCase } from '../../../usuarios/application/use-cases/crear-usuario.use-case';
import { USUARIO_REPOSITORY } from '../../../usuarios/domain/usuario.repository';
import type { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { AuthTokens } from '../../domain/auth-tokens.value-object';
import { GOOGLE_TOKEN_VERIFIER } from '../../domain/google-token-verifier';
import type {
  GoogleTokenVerifier,
  PerfilGoogle,
} from '../../domain/google-token-verifier';
import { GoogleAuthDto } from '../dto/google-auth.dto';

// 428 Precondition Required: el correo de Google aún no tiene cuenta y faltan
// datos para crearla. El frontend lee `perfil` para precargar el formulario.
export const CODIGO_REGISTRO_INCOMPLETO = 'REGISTRO_INCOMPLETO';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    @Inject(GOOGLE_TOKEN_VERIFIER)
    private readonly verificador: GoogleTokenVerifier,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async ejecutar(dto: GoogleAuthDto): Promise<AuthTokens> {
    const perfil = await this.verificador.verificar(dto.credential);

    const existente = await this.usuarioRepository.buscarPorEmail(perfil.email);
    const usuario = existente ?? (await this.crearCuenta(dto, perfil));

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });
    return new AuthTokens(accessToken);
  }

  private async crearCuenta(
    dto: GoogleAuthDto,
    perfil: PerfilGoogle,
  ): Promise<Usuario> {
    const numeroDocumento = dto.numeroDocumento?.trim();
    const tipoDocumento = dto.tipoDocumento?.trim();
    if (!numeroDocumento || !tipoDocumento) {
      throw new HttpException(
        {
          statusCode: 428,
          error: 'Precondition Required',
          code: CODIGO_REGISTRO_INCOMPLETO,
          message: 'Completa tu registro para continuar con Google',
          perfil,
        },
        428,
      );
    }
    if (dto.aceptaTerminos !== true) {
      throw new BadRequestException(
        'Debes aceptar los términos de uso y la política de privacidad para crear la cuenta',
      );
    }

    // La cuenta se identifica con Google; la contraseña es aleatoria y nadie
    // la conoce (se podrá definir una propia con "recuperar contraseña").
    return this.crearUsuarioUseCase.ejecutar({
      numeroDocumento,
      tipoDocumento,
      nombres: dto.nombres?.trim() || perfil.nombres,
      apellidos: dto.apellidos?.trim() || perfil.apellidos,
      email: perfil.email,
      password: randomBytes(24).toString('base64url'),
      telefono: dto.telefono?.trim() || undefined,
      aceptaTerminos: true,
    });
  }
}
