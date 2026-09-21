import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca una ruta o un controlador como accesible sin autenticación.
 * JwtAuthGuard (registrado globalmente) omite la verificación del token
 * cuando encuentra este metadato.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
