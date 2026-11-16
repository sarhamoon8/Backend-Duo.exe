// RF-05: plantilla HTML compartida para todos los correos de notificación
// de turnos. Antes se enviaba el texto plano de `mensaje` directo como
// `html`, lo que llegaba sin ningún estilo. Centralizar el diseño aquí
// evita repetir el HTML en cada caso de uso que notifica un evento del
// turno (crear, avanzar, cancelar, reasignar).
export interface DatosCorreoTurno {
  nombreUsuario: string;
  titulo: string;
  mensaje: string;
  codigoTurno?: string;
}

const COLOR_PRIMARIO = '#0F5C4F';
const COLOR_ACENTO = '#2ECC8F';
const COLOR_FONDO_ACENTO = '#E6F7F0';

export function construirCorreoHtml({
  nombreUsuario,
  titulo,
  mensaje,
  codigoTurno,
}: DatosCorreoTurno): string {
  const bloqueCodigo = codigoTurno
    ? `
      <tr>
        <td align="center" style="padding: 8px 0 24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: ${COLOR_FONDO_ACENTO}; border-radius: 12px;">
            <tr>
              <td style="padding: 14px 32px; text-align: center;">
                <div style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 1px; color: ${COLOR_PRIMARIO}; text-transform: uppercase; margin-bottom: 4px;">
                  Tu turno
                </div>
                <div style="font-family: Arial, Helvetica, sans-serif; font-size: 32px; font-weight: bold; color: ${COLOR_PRIMARIO}; letter-spacing: 2px;">
                  ${codigoTurno}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin: 0; padding: 0; background-color: #F4F6F5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F6F5; padding: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; font-family: Arial, Helvetica, sans-serif;">
            <tr>
              <td style="background-color: ${COLOR_PRIMARIO}; padding: 20px 32px;">
                <span style="color: #ffffff; font-size: 20px; font-weight: bold;">FilaCero</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 32px 8px 32px;">
                <h1 style="margin: 0 0 16px 0; font-size: 20px; color: #1A1A1A;">${titulo}</h1>
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #3C3C3C;">
                  Hola ${nombreUsuario},<br /><br />
                  ${mensaje}
                </p>
              </td>
            </tr>
            ${bloqueCodigo}
            <tr>
              <td style="padding: 0 32px 28px 32px; border-top: 1px solid #EEEEEE;">
                <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #9A9A9A;">
                  Este es un mensaje automático de FilaCero, no respondas a este correo.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: ${COLOR_ACENTO}; height: 6px;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
