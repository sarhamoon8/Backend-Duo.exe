import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClienteIdTokenGoogle,
  GoogleAuthLibraryVerifier,
} from './google-auth-library.verifier';

const CLIENT_ID = '123-abc.apps.googleusercontent.com';

function config(clientId: string | undefined): ConfigService {
  return {
    get: jest.fn().mockReturnValue(clientId),
  } as unknown as ConfigService;
}

function cliente(
  payload: object | undefined,
): jest.Mocked<ClienteIdTokenGoogle> {
  return {
    verifyIdToken: jest.fn().mockResolvedValue({ getPayload: () => payload }),
  } as jest.Mocked<ClienteIdTokenGoogle>;
}

describe('GoogleAuthLibraryVerifier', () => {
  it('responde 503 si no hay GOOGLE_CLIENT_ID configurado', async () => {
    const verificador = new GoogleAuthLibraryVerifier(
      config(undefined),
      cliente({}),
    );

    await expect(verificador.verificar('token')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('valida el token contra nuestro Client ID y devuelve el perfil', async () => {
    const google = cliente({
      email: 'Ana@Gmail.com',
      email_verified: true,
      given_name: 'Ana',
      family_name: 'Pérez',
    });
    const verificador = new GoogleAuthLibraryVerifier(
      config(CLIENT_ID),
      google,
    );

    const perfil = await verificador.verificar('token');

    expect(google.verifyIdToken).toHaveBeenCalledWith({
      idToken: 'token',
      audience: CLIENT_ID,
    });
    expect(perfil).toEqual({
      email: 'ana@gmail.com',
      nombres: 'Ana',
      apellidos: 'Pérez',
    });
  });

  it('separa el nombre completo si Google no entrega nombres y apellidos', async () => {
    const verificador = new GoogleAuthLibraryVerifier(
      config(CLIENT_ID),
      cliente({
        email: 'a@b.co',
        email_verified: true,
        name: 'Ana María Pérez Gil',
      }),
    );

    expect(await verificador.verificar('token')).toEqual({
      email: 'a@b.co',
      nombres: 'Ana',
      apellidos: 'María Pérez Gil',
    });
  });

  it('rechaza un token que Google no valida (firma, vigencia o destinatario)', async () => {
    const google = {
      verifyIdToken: jest.fn().mockRejectedValue(new Error('Wrong recipient')),
    } as jest.Mocked<ClienteIdTokenGoogle>;
    const verificador = new GoogleAuthLibraryVerifier(
      config(CLIENT_ID),
      google,
    );

    await expect(verificador.verificar('token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza una cuenta con el correo sin verificar o sin correo', async () => {
    const sinVerificar = new GoogleAuthLibraryVerifier(
      config(CLIENT_ID),
      cliente({ email: 'a@b.co', email_verified: false }),
    );
    const sinCorreo = new GoogleAuthLibraryVerifier(
      config(CLIENT_ID),
      cliente(undefined),
    );

    await expect(sinVerificar.verificar('token')).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(sinCorreo.verificar('token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
