import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailProvider } from '../../domain/email-provider';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly apiKey: string | undefined;
  private readonly remitente: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.remitente = this.configService.get<string>('RESEND_FROM_EMAIL');
  }

  async enviar(
    destinatario: string,
    asunto: string,
    cuerpo: string,
  ): Promise<void> {
    if (!this.apiKey || !this.remitente) {
      throw new Error(
        'RESEND_API_KEY o RESEND_FROM_EMAIL no están configurados',
      );
    }

    const resend = new Resend(this.apiKey);
    const { error } = await resend.emails.send({
      from: this.remitente,
      to: destinatario,
      subject: asunto,
      html: cuerpo,
    });

    if (error) {
      throw new Error(`Resend rechazó el envío: ${error.message}`);
    }
  }
}
