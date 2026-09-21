import { Ventanilla } from './ventanilla.entity';

export interface NuevaVentanilla {
  puntoId: string;
  numeroModulo: string;
}

export interface VentanillaRepository {
  crear(ventanilla: NuevaVentanilla): Promise<Ventanilla>;
  buscarPorId(id: string): Promise<Ventanilla | null>;
  listarPorPunto(puntoId: string): Promise<Ventanilla[]>;
}

export const VENTANILLA_REPOSITORY = Symbol('VENTANILLA_REPOSITORY');
