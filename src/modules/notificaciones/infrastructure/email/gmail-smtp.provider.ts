import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailProvider } from '../../domain/email-provider';

// Tercer proveedor probado para RF-05: ni Resend (en su plan gratis solo
// entrega al correo del propio dueño de la cuenta, sin dominio
// verificado) ni Brevo (su registro pidió tarjeta en todas las opciones
// para esta cuenta) sirvieron sin fricción. Gmail SMTP con una cuenta
// dedicada al proyecto + una "contraseña de aplicación" no pide tarjeta,
// no requiere aprobación de ningún proveedor, y entrega a cualquier
// destinatario de inmediato.
@Injectable()
export class GmailSmtpProvider implements EmailProvider {
  private readonly usuarioGmail: string | undefined;
  private readonly contrasenaApp: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.usuarioGmail = this.configService.get<string>('GMAIL_USER');
    this.contrasenaApp = this.configService.get<string>('GMAIL_APP_PASSWORD');
  }

  async enviar(
    destinatario: string,
    asunto: string,
    cuerpo: string,
  ): Promise<void> {
    if (!this.usuarioGmail || !this.contrasenaApp) {
      throw new Error('GMAIL_USER o GMAIL_APP_PASSWORD no están configurados');
    }

    const transportador = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.usuarioGmail,
        pass: this.contrasenaApp,
      },
    });

    await transportador.sendMail({
      from: `FilaCero <${this.usuarioGmail}>`,
      to: destinatario,
      subject: asunto,
      html: cuerpo,
    });
  }
}
