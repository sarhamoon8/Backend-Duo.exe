import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  RestablecerPasswordDto,
  SolicitarRecuperacionDto,
} from './recuperar-password.dto';

const TOKEN = 'token-en-claro-de-prueba-0123456789';

async function mensajes<T extends object>(
  clase: new () => T,
  datos: Record<string, unknown>,
): Promise<string[]> {
  const errores = await validate(plainToInstance(clase, datos));
  return errores.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('SolicitarRecuperacionDto', () => {
  it('acepta un correo válido', async () => {
    expect(
      await mensajes(SolicitarRecuperacionDto, { email: 'ana@example.com' }),
    ).toEqual([]);
  });

  it('rechaza un correo inválido o ausente', async () => {
    expect(
      await mensajes(SolicitarRecuperacionDto, { email: 'no-es-correo' }),
    ).not.toEqual([]);
    expect(await mensajes(SolicitarRecuperacionDto, {})).not.toEqual([]);
  });
});

describe('RestablecerPasswordDto', () => {
  it('acepta un token y una contraseña con todos los requisitos', async () => {
    expect(
      await mensajes(RestablecerPasswordDto, {
        token: TOKEN,
        password: 'ClaveNueva1!',
      }),
    ).toEqual([]);
  });

  it('exige los mismos requisitos de contraseña que el registro, informando todos los que faltan', async () => {
    const faltan = await mensajes(RestablecerPasswordDto, {
      token: TOKEN,
      password: 'abc',
    });

    expect(faltan).toHaveLength(4);
    expect(faltan.join(' ')).toContain('al menos 8 caracteres');
    expect(faltan.join(' ')).toContain('mayúscula');
    expect(faltan.join(' ')).toContain('número');
    expect(faltan.join(' ')).toContain('símbolo especial');
  });

  it('exige el token', async () => {
    expect(
      await mensajes(RestablecerPasswordDto, {
        token: 'corto',
        password: 'ClaveNueva1!',
      }),
    ).not.toEqual([]);
    expect(
      await mensajes(RestablecerPasswordDto, { password: 'ClaveNueva1!' }),
    ).not.toEqual([]);
  });
});
