import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import { TokenRecuperacionRepository } from '../../domain/token-recuperacion.repository';
import { RestablecerPasswordUseCase } from './restablecer-password.use-case';
import { hashDeToken } from './solicitar-recuperacion.use-case';

const AHORA = new Date('2026-11-16T15:00:00.000Z');
const TOKEN = 'token-en-claro-de-prueba-0123456789';
const dto = { token: TOKEN, password: 'ClaveNueva1!' };

describe('RestablecerPasswordUseCase', () => {
  let usuarios: jest.Mocked<UsuarioRepository>;
  let tokens: jest.Mocked<TokenRecuperacionRepository>;
  let useCase: RestablecerPasswordUseCase;

  beforeEach(() => {
    usuarios = {
      actualizarPassword: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UsuarioRepository>;
    tokens = {
      buscarVigentePorHash: jest
        .fn()
        .mockResolvedValue({ id: 't1', usuarioId: 'u1' }),
      marcarUsado: jest.fn().mockResolvedValue(true),
      invalidarPendientes: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TokenRecuperacionRepository>;
    useCase = new RestablecerPasswordUseCase(usuarios, tokens);
  });

  it('cambia la contraseña (guardada con hash) y gasta el enlace', async () => {
    await useCase.ejecutar(dto, AHORA);

    expect(tokens.buscarVigentePorHash).toHaveBeenCalledWith(
      hashDeToken(TOKEN),
      AHORA,
    );
    expect(tokens.marcarUsado).toHaveBeenCalledWith('t1', AHORA);
    const [usuarioId, guardada] = usuarios.actualizarPassword.mock.calls[0]!;
    expect(usuarioId).toBe('u1');
    expect(guardada).not.toBe(dto.password);
    expect(await bcrypt.compare(dto.password, guardada)).toBe(true);
    expect(tokens.invalidarPendientes).toHaveBeenCalledWith('u1');
  });

  it('rechaza un enlace que no existe, venció o ya se usó', async () => {
    tokens.buscarVigentePorHash.mockResolvedValue(null);

    await expect(useCase.ejecutar(dto, AHORA)).rejects.toThrow(
      BadRequestException,
    );
    expect(usuarios.actualizarPassword).not.toHaveBeenCalled();
  });

  it('si otra petición gastó el enlace primero, no cambia la contraseña', async () => {
    tokens.marcarUsado.mockResolvedValue(false);

    await expect(useCase.ejecutar(dto, AHORA)).rejects.toThrow(
      'El enlace no es válido o ya venció',
    );
    expect(usuarios.actualizarPassword).not.toHaveBeenCalled();
  });
});
