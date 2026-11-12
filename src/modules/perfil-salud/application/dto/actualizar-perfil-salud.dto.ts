import { IsOptional, IsString } from 'class-validator';

export class ActualizarPerfilSaludDto {
  @IsOptional()
  @IsString()
  grupoSanguineo?: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsString()
  condicionesCronicas?: string;

  @IsOptional()
  @IsString()
  contactoEmergenciaNombre?: string;

  @IsOptional()
  @IsString()
  contactoEmergenciaTelefono?: string;
}
