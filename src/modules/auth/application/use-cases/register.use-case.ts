import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CrearUsuarioUseCase } from '../../../usuarios/application/use-cases/crear-usuario.use-case';
import { AuthTokens } from '../../domain/auth-tokens.value-object';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async ejecutar(dto: RegisterDto): Promise<AuthTokens> {
    const usuario = await this.crearUsuarioUseCase.ejecutar(dto);

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return new AuthTokens(accessToken);
  }
}
