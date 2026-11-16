import { IsEmail, IsString, MinLength } from 'class-validator';
import { PasswordConRequisitos } from './password-con-requisitos.decorator';

export class SolicitarRecuperacionDto {
  @IsEmail()
  email: string;
}

export class RestablecerPasswordDto {
  // Token que llega en el enlace del correo (se guarda solo su hash).
  @IsString()
  @MinLength(20)
  token: string;

  @PasswordConRequisitos()
  password: string;
}
