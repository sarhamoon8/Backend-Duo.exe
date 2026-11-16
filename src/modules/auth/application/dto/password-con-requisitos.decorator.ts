import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, ValidateBy } from 'class-validator';

// Reglas de la contraseña al crear una cuenta o restablecerla (las pantallas
// "Crear cuenta" y "Nueva contraseña" las muestran como lista). Cada una tiene
// su propio mensaje para que la API devuelva todas las que no se cumplen.
export const PASSWORD_MIN_LENGTH = 8;

// class-validator agrupa los errores por nombre de regla; si las cuatro reglas
// fueran `@Matches` compartirían nombre y solo se vería un mensaje. Cada una
// lleva su propio nombre para poder informar todas las que fallan.
function ReglaDePassword(nombre: string, patron: RegExp, mensaje: string) {
  return ValidateBy({
    name: nombre,
    validator: {
      validate: (valor: unknown) =>
        typeof valor === 'string' && patron.test(valor),
      defaultMessage: () => mensaje,
    },
  });
}

export function PasswordConRequisitos() {
  return applyDecorators(
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH, {
      message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    }),
    ReglaDePassword(
      'passwordMayuscula',
      /[A-Z]/,
      'La contraseña debe tener una letra mayúscula',
    ),
    ReglaDePassword(
      'passwordMinuscula',
      /[a-z]/,
      'La contraseña debe tener una letra minúscula',
    ),
    ReglaDePassword(
      'passwordNumero',
      /\d/,
      'La contraseña debe tener un número',
    ),
    ReglaDePassword(
      'passwordSimbolo',
      /[!@#]/,
      'La contraseña debe tener un símbolo especial: !, @ o #',
    ),
  );
}
