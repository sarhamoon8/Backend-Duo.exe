import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

// Traduce los errores conocidos de Prisma a respuestas HTTP limpias, para
// que un caso no cubierto explícitamente por un caso de uso (p. ej. una
// restricción @@unique nueva que se nos olvidó validar a mano) no se
// escape como un 500 con stacktrace crudo hacia el cliente.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const httpException = this.traducir(exception);
    response.status(httpException.getStatus()).json(httpException.getResponse());
  }

  private traducir(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (exception.code) {
      case 'P2002': {
        const campos = (exception.meta?.target as string[] | undefined)?.join(
          ', ',
        );
        return new ConflictException(
          campos
            ? `Ya existe un registro con ese valor en: ${campos}`
            : 'Ya existe un registro con ese valor único',
        );
      }
      case 'P2025':
        return new NotFoundException('Registro no encontrado');
      case 'P2003':
        return new ConflictException(
          'La operación viola una relación con otro registro',
        );
      default:
        return new InternalServerErrorException('Error interno del servidor');
    }
  }
}
