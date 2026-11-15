import { Equals, IsOptional, IsString, MinLength } from 'class-validator';

// Acceso con Google: el frontend manda el token de identidad que entrega
// Google. Si el correo ya tiene cuenta, inicia sesión; si no, hay que
// completar el registro con el documento (y aceptar los términos).
export class GoogleAuthDto {
  @IsString()
  @MinLength(10)
  credential: string;

  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @IsOptional()
  @IsString()
  tipoDocumento?: string;

  // Si faltan o vienen vacíos se usan los que entrega Google.
  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @Equals(true, {
    message:
      'Debes aceptar los términos de uso y la política de privacidad para crear la cuenta',
  })
  aceptaTerminos?: boolean;
}
