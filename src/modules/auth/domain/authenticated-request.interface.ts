import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/**
 * Request de Express enriquecido por JwtAuthGuard con el payload del JWT
 * verificado. Solo está poblado en rutas que pasaron por el guard (es
 * decir, no marcadas con @Public()).
 */
export type AuthenticatedRequest = Request & { usuario?: JwtPayload };
