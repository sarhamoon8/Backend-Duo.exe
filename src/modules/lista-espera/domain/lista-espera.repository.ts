import { ListaEspera } from './lista-espera.entity';

export interface NuevaListaEspera {
  usuarioId: string;
  servicioId: string;
  puntoId: string;
}

export interface ListaEsperaRepository {
  crear(entrada: NuevaListaEspera): Promise<ListaEspera>;
  buscarPorId(id: string): Promise<ListaEspera | null>;
  // Todas las inscripciones del usuario, sin importar a qué servicio/punto.
  listarPorUsuario(usuarioId: string): Promise<ListaEspera[]>;
  // La fila de espera completa de un servicio+punto, más antigua primero.
  listarPorServicioYPunto(
    servicioId: string,
    puntoId: string,
  ): Promise<ListaEspera[]>;
  // El siguiente en la fila (el más antiguo); null si nadie está esperando.
  // Es la base de la reasignación automática (ver turnos/ReasignarDesdeListaEsperaUseCase).
  obtenerPrimero(
    servicioId: string,
    puntoId: string,
  ): Promise<ListaEspera | null>;
  // Cuántas inscripciones del mismo servicio+punto son anteriores a
  // `creadoEn`; es la base para calcular la posición, igual que
  // TurnoRepository.contarPendientesAntes.
  contarAntes(
    servicioId: string,
    puntoId: string,
    creadoEn: Date,
  ): Promise<number>;
  eliminar(id: string): Promise<void>;
}

export const LISTA_ESPERA_REPOSITORY = Symbol('LISTA_ESPERA_REPOSITORY');
