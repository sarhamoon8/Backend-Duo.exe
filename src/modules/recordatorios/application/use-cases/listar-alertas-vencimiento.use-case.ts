import { Inject, Injectable } from '@nestjs/common';
import { RECORDATORIO_REPOSITORY } from '../../domain/recordatorio.repository';
import type { RecordatorioRepository } from '../../domain/recordatorio.repository';
import { INVENTARIO_REPOSITORY } from '../../../inventario/domain/inventario.repository';
import type { InventarioRepository } from '../../../inventario/domain/inventario.repository';
import { AlertaVencimientoResponseDto } from '../dto/alerta-vencimiento-response.dto';

const DIAS_UMBRAL_ALERTA = 7;
const DIA_EN_MS = 24 * 60 * 60 * 1000;

// RF-08: "recibir alertas sobre fórmulas médicas próximas a vencer". Se
// calcula al vuelo (igual que la posición de un turno) a partir de los
// medicamentos de uso habitual del usuario (sus recordatorios activos) y
// la fecha de vencimiento más próxima registrada en inventario para cada
// uno, sin necesitar un job programado.
@Injectable()
export class ListarAlertasVencimientoUseCase {
  constructor(
    @Inject(RECORDATORIO_REPOSITORY)
    private readonly recordatorioRepository: RecordatorioRepository,
    @Inject(INVENTARIO_REPOSITORY)
    private readonly inventarioRepository: InventarioRepository,
  ) {}

  async ejecutar(usuarioId: string): Promise<AlertaVencimientoResponseDto[]> {
    const recordatorios = (
      await this.recordatorioRepository.listarPorUsuario(usuarioId)
    ).filter((r) => r.activo);

    const ahora = Date.now();
    const alertas: AlertaVencimientoResponseDto[] = [];

    for (const recordatorio of recordatorios) {
      const lotes = await this.inventarioRepository.listarPorMedicamento(
        recordatorio.medicamentoId,
      );
      if (lotes.length === 0) {
        continue;
      }

      const masProxima = lotes.reduce((min, lote) =>
        lote.fechaVencimiento < min.fechaVencimiento ? lote : min,
      );

      const diasParaVencer = Math.ceil(
        (masProxima.fechaVencimiento.getTime() - ahora) / DIA_EN_MS,
      );

      if (diasParaVencer <= DIAS_UMBRAL_ALERTA) {
        const alerta = new AlertaVencimientoResponseDto();
        alerta.medicamentoId = recordatorio.medicamentoId;
        alerta.recordatorioId = recordatorio.id;
        alerta.mensaje = recordatorio.mensaje;
        alerta.fechaVencimientoMasProxima = masProxima.fechaVencimiento;
        alerta.diasParaVencer = diasParaVencer;
        alertas.push(alerta);
      }
    }

    return alertas;
  }
}
