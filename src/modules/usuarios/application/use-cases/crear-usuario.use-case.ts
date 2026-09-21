import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../domain/usuario.entity';
import { Rol } from '../../domain/rol.enum';
import { USUARIO_REPOSITORY } from '../../domain/usuario.repository';
import type { UsuarioRepository } from '../../domain/usuario.repository';
import { CrearUsuarioDto } from '../dto/crear-usuario.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class CrearUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async ejecutar(dto: CrearUsuarioDto): Promise<Usuario> {
    const existente = await this.usuarioRepository.buscarPorEmail(dto.email);
    if (existente) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHasheado = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.usuarioRepository.crear({
      nombre: dto.nombre,
      email: dto.email,
      password: passwordHasheado,
      rol: dto.rol ?? Rol.PACIENTE,
    });
  }
}
