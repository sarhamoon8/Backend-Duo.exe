import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Rol } from '../../domain/rol.enum';

export class CrearUsuarioDto {
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

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}
