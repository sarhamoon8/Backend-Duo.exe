import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import type {
  GoogleTokenVerifier,
  PerfilGoogle,
} from '../../domain/google-token-verifier';

interface PayloadGoogle {
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
}

// Subconjunto del cliente de google-auth-library que usamos (facilita probarlo).
export interface ClienteIdTokenGoogle {
  verifyIdToken(opciones: {
    idToken: string;
    audience: string;
  }): Promise<{ getPayload(): PayloadGoogle | undefined }>;
}

@Injectable()
export class GoogleAuthLibraryVerifier implements GoogleTokenVerifier {
  constructor(
    private readonly config: ConfigService,
    private readonly cliente: ClienteIdTokenGoogle = new OAuth2Client(),
  ) {}

  async verificar(credential: string): Promise<PerfilGoogle> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new ServiceUnavailableException(
        'El acceso con Google no está configurado',
      );
    }

    let payload: PayloadGoogle | undefined;
    try {
      const ticket = await this.cliente.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('No se pudo validar tu cuenta de Google');
    }

    if (!payload?.email || payload.email_verified !== true) {
      throw new UnauthorizedException(
        'Tu cuenta de Google no tiene un correo verificado',
      );
    }

    const partes = (payload.name ?? '').trim().split(/\s+/).filter(Boolean);
    return {
      email: payload.email.toLowerCase(),
      nombres: payload.given_name?.trim() || partes[0] || payload.email,
      apellidos: payload.family_name?.trim() || partes.slice(1).join(' '),
    };
  }
}
