import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  NuevoTokenRecuperacion,
  TokenRecuperacion,
  TokenRecuperacionRepository,
} from '../../domain/token-recuperacion.repository';

@Injectable()
export class PrismaTokenRecuperacionRepository implements TokenRecuperacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(token: NuevoTokenRecuperacion): Promise<void> {
    await this.prisma.tokenRecuperacion.create({ data: token });
  }

  async invalidarPendientes(usuarioId: string): Promise<void> {
    await this.prisma.tokenRecuperacion.updateMany({
      where: { usuarioId, usadoEn: null },
      data: { usadoEn: new Date() },
    });
  }

  async buscarVigentePorHash(
    tokenHash: string,
    ahora: Date,
  ): Promise<TokenRecuperacion | null> {
    const token = await this.prisma.tokenRecuperacion.findFirst({
      where: { tokenHash, usadoEn: null, expiraEn: { gt: ahora } },
      select: { id: true, usuarioId: true },
    });
    return token;
  }

  async marcarUsado(id: string, ahora: Date): Promise<boolean> {
    // updateMany con usadoEn: null es atómico: solo una petición "gana" el token.
    const { count } = await this.prisma.tokenRecuperacion.updateMany({
      where: { id, usadoEn: null },
      data: { usadoEn: ahora },
    });
    return count === 1;
  }
}
