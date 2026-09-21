import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginDto } from '../../application/dto/login.dto';
import { RegisterDto } from '../../application/dto/register.dto';
import { AuthTokens } from '../../domain/auth-tokens.value-object';
import { Public } from '../decorators/public.decorator';

// Todo el controlador es público: es la puerta de entrada antes de tener
// un token. El registro siempre crea usuarios con rol PACIENTE (ver
// RegisterDto), así que no expone la escalada de privilegios de
// POST /usuarios (reservado a ADMIN).
@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Devuelve un JWT a usar como Bearer token en el resto de la API.',
  })
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.loginUseCase.ejecutar(dto);
  }

  @ApiOperation({
    summary: 'Registrar un nuevo usuario (rol PACIENTE)',
    description:
      'Autorregistro público. Siempre crea el usuario con rol PACIENTE y devuelve un JWT.',
  })
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return this.registerUseCase.ejecutar(dto);
  }
}
