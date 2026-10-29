import { JwtService } from '@nestjs/jwt';
import { RegisterUseCase } from './register.use-case';
import { CrearUsuarioUseCase } from '../../../usuarios/application/use-cases/crear-usuario.use-case';
import { Usuario } from '../../../usuarios/domain/usuario.entity';
import { Rol } from '../../../usuarios/domain/rol.enum';
import { RegisterDto } from '../dto/register.dto';

function crearCrearUsuarioUseCaseFalso(): jest.Mocked<CrearUsuarioUseCase> {
  return {
    ejecutar: jest.fn(),
  } as unknown as jest.Mocked<CrearUsuarioUseCase>;
}

function crearJwtServiceFalso(): jest.Mocked<JwtService> {
  return {
    signAsync: jest.fn(),
  } as unknown as jest.Mocked<JwtService>;
}

const dto: RegisterDto = {
  numeroDocumento: '123',
  tipoDocumento: 'CC',
  nombres: 'Ana',
  apellidos: 'Pérez',
  email: 'ana@example.com',
  password: 'clave123',
};

const usuarioCreado = new Usuario(
  'usuario-1',
  dto.numeroDocumento,
  dto.tipoDocumento,
  dto.nombres,
  dto.apellidos,
  dto.email,
  'hash',
  null,
  Rol.PACIENTE,
  new Date(),
);

describe('RegisterUseCase', () => {
  it('delega la creación del usuario en CrearUsuarioUseCase', async () => {
    const crearUsuarioUseCase = crearCrearUsuarioUseCaseFalso();
    crearUsuarioUseCase.ejecutar.mockResolvedValue(usuarioCreado);
    const jwtService = crearJwtServiceFalso();
    jwtService.signAsync.mockResolvedValue('token-firmado');
    const useCase = new RegisterUseCase(crearUsuarioUseCase, jwtService);

    await useCase.ejecutar(dto);

    expect(crearUsuarioUseCase.ejecutar).toHaveBeenCalledWith(dto);
  });

  it('firma un JWT con el id, email y rol del usuario creado', async () => {
    const crearUsuarioUseCase = crearCrearUsuarioUseCaseFalso();
    crearUsuarioUseCase.ejecutar.mockResolvedValue(usuarioCreado);
    const jwtService = crearJwtServiceFalso();
    jwtService.signAsync.mockResolvedValue('token-firmado');
    const useCase = new RegisterUseCase(crearUsuarioUseCase, jwtService);

    const resultado = await useCase.ejecutar(dto);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: usuarioCreado.id,
      email: usuarioCreado.email,
      rol: usuarioCreado.rol,
    });
    expect(resultado.accessToken).toBe('token-firmado');
  });

  it('propaga el error si CrearUsuarioUseCase rechaza (p. ej. email duplicado)', async () => {
    const crearUsuarioUseCase = crearCrearUsuarioUseCaseFalso();
    const error = new Error('email duplicado');
    crearUsuarioUseCase.ejecutar.mockRejectedValue(error);
    const jwtService = crearJwtServiceFalso();
    const useCase = new RegisterUseCase(crearUsuarioUseCase, jwtService);

    await expect(useCase.ejecutar(dto)).rejects.toBe(error);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
