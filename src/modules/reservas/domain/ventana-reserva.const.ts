// RF-07: el stock reservado se libera entre 24 y 48 horas después de la
// solicitud (regla de negocio ya acordada, PROJECT_CONTEXT.md sección 11).
// El sistema fija la ventana en el máximo del rango permitido.
export const VENTANA_RESERVA_HORAS = 48;
