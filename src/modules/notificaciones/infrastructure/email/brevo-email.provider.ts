import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from '../../domain/email-provider';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// A diferencia de Resend en su dominio de pruebas, la API transaccional
// de Brevo no restringe el envío a la dirección con la que te registraste:
// entrega a cualquier destinatario real (sin necesidad de verificar un
// dominio propio), lo cual es lo que hace falta para que alguien externo
// (el profesor, un compañero) pueda probar la app con su propio correo.
@Injectable()
export class BrevoEmailProvider implements EmailProvider {
  private readonly apiKey: string | undefined;
  private readonly remitenteEmail: string | undefined;
  private readonly remitenteNombre: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.remitenteEmail = this.configService.get<string>('BREVO_FROM_EMAIL');
    this.remitenteNombre =
      this.configService.get<string>('BREVO_FROM_NAME') ?? 'FilaCero';
  }

  async enviar(
    destinatario: string,
    asunto: string,
    cuerpo: string,
  ): Promise<void> {
    if (!this.apiKey || !this.remitenteEmail) {
      throw new Error(
        'BREVO_API_KEY o BREVO_FROM_EMAIL no están configurados',
      );
    }

    const respuesta = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        sender: { name: this.remitenteNombre, email: this.remitenteEmail },
        to: [{ email: destinatario }],
        subject: asunto,
        htmlContent: cuerpo,
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(
        `Brevo rechazó el envío (${respuesta.status}): ${detalle}`,
      );
    }
  }
}
