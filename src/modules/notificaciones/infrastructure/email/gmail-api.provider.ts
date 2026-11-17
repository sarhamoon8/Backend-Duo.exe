import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { EmailProvider } from '../../domain/email-provider';

// Cuarto intento para RF-05: SMTP (tanto el puerto 465 como el 587) nunca
// conecta desde Railway — el proveedor de hosting bloquea el tráfico
// SMTP saliente por completo (Connection timeout). La API de Gmail evita
// el problema de raíz: habla HTTPS (puerto 443), que ningún proveedor
// bloquea. Usa la misma cuenta de Gmail de siempre, pero autenticada con
// OAuth2 (client id/secret + refresh token de un cliente "Aplicación
// web" dedicado a esto) en vez de una contraseña de aplicación por SMTP.
//
// Variables distintas a GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET a propósito:
// esas ya identifican el cliente OAuth del botón "Continuar con Google"
// del frontend, y se usan como `audience` al verificar esos tokens. Si se
// reusaran aquí, el login con Google dejaría de funcionar.
@Injectable()
export class GmailApiProvider implements EmailProvider {
  private readonly usuarioGmail: string | undefined;
  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly refreshToken: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.usuarioGmail = this.configService.get<string>('GMAIL_USER');
    this.clientId = this.configService.get<string>('GMAIL_OAUTH_CLIENT_ID');
    this.clientSecret = this.configService.get<string>(
      'GMAIL_OAUTH_CLIENT_SECRET',
    );
    this.refreshToken = this.configService.get<string>(
      'GMAIL_REFRESH_TOKEN',
    );
  }

  async enviar(
    destinatario: string,
    asunto: string,
    cuerpo: string,
  ): Promise<void> {
    if (
      !this.usuarioGmail ||
      !this.clientId ||
      !this.clientSecret ||
      !this.refreshToken
    ) {
      throw new Error(
        'Faltan credenciales de GMAIL_USER/GMAIL_OAUTH_CLIENT_ID/GMAIL_OAUTH_CLIENT_SECRET/GMAIL_REFRESH_TOKEN',
      );
    }

    const oauth2Client = new OAuth2Client({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });
    oauth2Client.setCredentials({ refresh_token: this.refreshToken });
    const { token: accessToken } = await oauth2Client.getAccessToken();
    if (!accessToken) {
      throw new Error('No se pudo obtener un access token de Gmail');
    }

    const raw = construirMensajeRawBase64Url({
      de: this.usuarioGmail,
      para: destinatario,
      asunto,
      cuerpoHtml: cuerpo,
    });

    const respuesta = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      },
    );

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(
        `Gmail API respondió ${respuesta.status}: ${detalle}`,
      );
    }
  }
}

function construirMensajeRawBase64Url({
  de,
  para,
  asunto,
  cuerpoHtml,
}: {
  de: string;
  para: string;
  asunto: string;
  cuerpoHtml: string;
}): string {
  const asuntoCodificado = `=?utf-8?B?${Buffer.from(asunto).toString('base64')}?=`;
  const mime = [
    `From: FilaCero <${de}>`,
    `To: ${para}`,
    `Subject: ${asuntoCodificado}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    cuerpoHtml,
  ].join('\r\n');

  return Buffer.from(mime)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
