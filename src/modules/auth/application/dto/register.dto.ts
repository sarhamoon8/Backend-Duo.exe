import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';
import { PasswordConRequisitos } from './password-con-requisitos.decorator';

export class RegisterDto {
  @IsString()
  numeroDocumento: string;

  @IsString()
  tipoDocumento: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsEmail()
  email: string;

  @PasswordConRequisitos()
  password: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  // Aceptación de los términos de uso y del tratamiento de datos personales.
  @IsBoolean()
  @Equals(true, {
    message:
      'Debes aceptar los términos de uso y la política de privacidad para crear la cuenta',
  })
  aceptaTerminos: boolean;
}
