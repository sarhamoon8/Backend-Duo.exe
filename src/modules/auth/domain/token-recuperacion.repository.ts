// Enlace de recuperación de contraseña. Nunca se guarda el token en claro:
// solo su hash (SHA-256), igual que una contraseña, para que una filtración
// de la base de datos no permita restablecer cuentas.
export interface TokenRecuperacion {
  id: string;
  usuarioId: string;
}

export interface NuevoTokenRecuperacion {
  usuarioId: string;
  tokenHash: string;
  expiraEn: Date;
}

export interface TokenRecuperacionRepository {
  crear(token: NuevoTokenRecuperacion): Promise<void>;
  // Anula los enlaces anteriores sin usar de la persona: solo el último vale.
  invalidarPendientes(usuarioId: string): Promise<void>;
  // Devuelve el token solo si existe, no se usó y no ha vencido.
  buscarVigentePorHash(
    tokenHash: string,
    ahora: Date,
  ): Promise<TokenRecuperacion | null>;
  // Marca el token como usado; false si otro intento lo usó antes (así un
  // enlace sirve una sola vez aunque lleguen dos peticiones a la vez).
  marcarUsado(id: string, ahora: Date): Promise<boolean>;
}

export const TOKEN_RECUPERACION_REPOSITORY = Symbol(
  'TOKEN_RECUPERACION_REPOSITORY',
);
