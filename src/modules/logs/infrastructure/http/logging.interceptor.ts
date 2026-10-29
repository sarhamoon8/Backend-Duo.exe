import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, tap } from 'rxjs';
import { RegistrarLogPeticionUseCase } from '../../application/use-cases/registrar-log-peticion.use-case';
import type { AuthenticatedRequest } from '../../../auth/domain/authenticated-request.interface';

// Registrado como APP_INTERCEPTOR global en LogsModule: pasa por cada
// petición HTTP de la aplicación, exitosa o no. El código de estado de un
// error se lee de la excepción misma (error.getStatus()), no de
// response.statusCode, porque en el momento en que corre este `tap` los
// filtros de excepción de Nest todavía no han terminado de escribir la
// respuesta real.
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly registrarLogPeticionUseCase: RegistrarLogPeticionUseCase,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const inicio = Date.now();
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    const registrar = (codigoEstado: number, mensaje: string | null) => {
      void this.registrarLogPeticionUseCase.ejecutar({
        metodo: request.method,
        ruta: request.originalUrl,
        codigoEstado,
        duracionMs: Date.now() - inicio,
        usuarioId: request.usuario?.sub ?? null,
        ip: request.ip ?? null,
        mensaje,
      });
    };

    return next.handle().pipe(
      tap({
        next: () => registrar(response.statusCode, null),
        error: (error: unknown) => {
          const codigoEstado =
            error instanceof HttpException ? error.getStatus() : 500;
          registrar(
            codigoEstado,
            error instanceof Error ? error.message : 'Error desconocido',
          );
        },
      }),
    );
  }
}
