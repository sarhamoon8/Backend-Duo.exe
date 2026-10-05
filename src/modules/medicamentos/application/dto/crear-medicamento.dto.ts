import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CrearMedicamentoDto {
  @IsString()
  codigoNacional: string;

  @IsString()
  nombreGenerico: string;

  @IsString()
  concentracion: string;

  @IsString()
  presentacion: string;

  @IsString()
  laboratorioFabricante: string;

  @IsOptional()
  @IsBoolean()
  requiereAutorizacion?: boolean;
}
