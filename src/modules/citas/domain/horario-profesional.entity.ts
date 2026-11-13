// Franja de atención semanal de un profesional. diaSemana: 1 = lunes ... 7 = domingo.
// horaInicio/horaFin son HH:mm en hora de Colombia; duracionMin es lo que dura cada cita.
export class HorarioProfesional {
  constructor(
    public readonly profesionalId: string,
    public readonly diaSemana: number,
    public readonly horaInicio: string,
    public readonly horaFin: string,
    public readonly duracionMin: number,
  ) {}
}
