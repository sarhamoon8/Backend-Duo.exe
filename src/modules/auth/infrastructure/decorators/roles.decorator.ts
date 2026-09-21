import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../../usuarios/domain/rol.enum';

export const ROLES_KEY = 'roles';

/**
 * Restringe una ruta a los roles indicados. Requiere que RolesGuard
 * (registrado globalmente) esté activo; sin este decorador, cualquier
 * usuario autenticado puede acceder a la ruta.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
