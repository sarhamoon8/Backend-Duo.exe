// Puerto de infraestructura, no de persistencia: abstrae el proveedor real
// de envío de correo (hoy Resend) para que los casos de uso no dependan
// de su SDK. Si el envío falla, el adaptador debe lanzar; quien decide
// qué hacer con ese error es EnviarNotificacionUseCase, no este puerto.
export interface EmailProvider {
  enviar(destinatario: string, asunto: string, cuerpo: string): Promise<void>;
}

export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
