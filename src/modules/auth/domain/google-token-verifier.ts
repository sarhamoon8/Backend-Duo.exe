// Datos del usuario que Google certifica con un token de identidad (ID token).
export interface PerfilGoogle {
  email: string;
  nombres: string;
  apellidos: string;
}

export interface GoogleTokenVerifier {
  // Valida la firma, el destinatario (nuestro Client ID) y la vigencia del
  // token, y que el correo esté verificado por Google. Lanza
  // UnauthorizedException si el token no es válido y
  // ServiceUnavailableException si el acceso con Google no está configurado.
  verificar(credential: string): Promise<PerfilGoogle>;
}

export const GOOGLE_TOKEN_VERIFIER = Symbol('GOOGLE_TOKEN_VERIFIER');
