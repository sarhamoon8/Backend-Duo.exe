import { IsOptional, IsUUID } from 'class-validator';

// Requerido solo para la transición PENDIENTE -> EN_CURSO: identifica
// desde qué ventanilla llama el personal de atención. No aplica para
// EN_CURSO -> ATENDIDO (ver AvanzarTurnoUseCase).
export class AvanzarTurnoDto {
  @IsOptional()
  @IsUUID()
  ventanillaId?: string;
}
