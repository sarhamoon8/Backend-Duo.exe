export class AlertaVencimientoResponseDto {
  medicamentoId: string;
  recordatorioId: string;
  mensaje: string;
  fechaVencimientoMasProxima: Date;
  diasParaVencer: number;
}
