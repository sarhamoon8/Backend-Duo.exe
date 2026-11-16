import {
  BadRequestException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CrearUsuarioUseCase } from '../../../usuarios/application/use-cases/crear-usuario.use-case';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { UsuarioRepository } from '../../../usuarios/domain/usuario.repository';
import {
  GoogleTokenVerifier,
  PerfilGoogle,
} from '../../domain/google-token-verifier';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import {
  CODIGO_REGISTRO_INCOMPLETO,
  GoogleAuthUseCase,
} from './google-auth.use-case';

const perfil: PerfilGoogle = {
  email: 'ana@gmail.com',
  nombres: 'Ana',
  apellidos: 'Pérez',
};

const usuarioExistente = new Usuario(
  'u1',
  '123',
  'CC',
  'Ana',
  'Pérez',
  'ana@gmail.com',
  'hash',
  null,
  Rol.PACIENTE,
  new Date(),
);

describe('GoogleAuthUseCase', () => {
  let verificador: jest.Mocked<GoogleTokenVerifier>;
  let usuarios: jest.Mocked<UsuarioRepository>;
  let crearUsuario: jest.Mocked<CrearUsuarioUseCase>;
  let jwt: jest.Mocked<JwtService>;
  let useCase: GoogleAuthUseCase;

  const dto = (extra: Partial<GoogleAuthDto> = {}): GoogleAuthDto => ({
    credential: 'token-de-google',
    ...extra,
  });

  beforeEach(() => {
    verificador = { verificar: jest.fn().mockResolvedValue(perfil) };
    usuarios = {
      buscarPorEmail: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<UsuarioRepository>;
    crearUsuario = {
      ejecutar: jest.fn().mockResolvedValue(usuarioExistente),
    } as unknown as jest.Mocked<CrearUsuarioUseCase>;
    jwt = {
      signAsync: jest.fn().mockResolvedValue('jwt-firmado'),
    } as unknown as jest.Mocked<JwtService>;
    useCase = new GoogleAuthUseCase(verificador, usuarios, crearUsuario, jwt);
  });

  it('inicia sesión si el correo de Google ya tiene cuenta', async () => {
    usuarios.buscarPorEmail.mockResolvedValue(usuarioExistente);

    const tokens = await useCase.ejecutar(dto());

    expect(verificador.verificar).toHaveBeenCalledWith('token-de-google');
    expect(usuarios.buscarPorEmail).toHaveBeenCalledWith('ana@gmail.com');
    expect(crearUsuario.ejecutar).not.toHaveBeenCalled();
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'ana@gmail.com',
      rol: Rol.PACIENTE,
    });
    expect(tokens.accessToken).toBe('jwt-firmado');
  });

  it('conserva el rol de una cuenta existente del personal', async () => {
    usuarios.buscarPorEmail.mockResolvedValue(
      new Usuario(
        'u2',
        '9',
        'CC',
        'Luis',
        'Gil',
        'ana@gmail.com',
        'h',
        null,
        Rol.FUNCIONARIO,
        new Date(),
      ),
    );

    await useCase.ejecutar(dto());

    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ rol: Rol.FUNCIONARIO }),
    );
  });

  it('responde 428 con el perfil de Google si no hay cuenta y faltan datos', async () => {
    const error = await useCase.ejecutar(dto()).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(428);
    expect((error as HttpException).getResponse()).toEqual(
      expect.objectContaining({ code: CODIGO_REGISTRO_INCOMPLETO, perfil }),
    );
    expect(crearUsuario.ejecutar).not.toHaveBeenCalled();
  });

  it('exige aceptar los términos para crear la cuenta', async () => {
    await expect(
      useCase.ejecutar(dto({ numeroDocumento: '555', tipoDocumento: 'CC' })),
    ).rejects.toThrow(BadRequestException);
    expect(crearUsuario.ejecutar).not.toHaveBeenCalled();
  });

  it('crea la cuenta de paciente con los datos de Google y el documento', async () => {
    await useCase.ejecutar(
      dto({
        numeroDocumento: ' 555 ',
        tipoDocumento: 'CC',
        telefono: '3001112233',
        aceptaTerminos: true,
      }),
    );

    const creado = crearUsuario.ejecutar.mock.calls[0]![0];
    expect(creado).toEqual(
      expect.objectContaining({
        numeroDocumento: '555',
        tipoDocumento: 'CC',
        nombres: 'Ana',
        apellidos: 'Pérez',
        email: 'ana@gmail.com',
        telefono: '3001112233',
      }),
    );
    expect(creado.rol).toBeUndefined();
    // Contraseña aleatoria que nadie conoce.
    expect(creado.password.length).toBeGreaterThanOrEqual(24);
    expect(jwt.signAsync).toHaveBeenCalled();
  });

  it('permite corregir el nombre y los apellidos que entrega Google', async () => {
    await useCase.ejecutar(
      dto({
        numeroDocumento: '555',
        tipoDocumento: 'CC',
        nombres: 'Ana María',
        apellidos: 'Pérez Gil',
        aceptaTerminos: true,
      }),
    );

    expect(crearUsuario.ejecutar.mock.calls[0]![0]).toEqual(
      expect.objectContaining({ nombres: 'Ana María', apellidos: 'Pérez Gil' }),
    );
  });

  it('no crea ni inicia sesión si el token de Google no es válido', async () => {
    verificador.verificar.mockRejectedValue(new UnauthorizedException());

    await expect(useCase.ejecutar(dto())).rejects.toThrow(
      UnauthorizedException,
    );
    expect(usuarios.buscarPorEmail).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
