import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

const valido = {
  numeroDocumento: '123456789',
  tipoDocumento: 'CC',
  nombres: 'Ana',
  apellidos: 'Pérez',
  email: 'ana@example.com',
  password: 'Clave123!',
  aceptaTerminos: true,
};

async function mensajes(cambios: Record<string, unknown>): Promise<string[]> {
  const dto = plainToInstance(RegisterDto, { ...valido, ...cambios });
  const errores = await validate(dto);
  return errores.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('RegisterDto', () => {
  it('acepta un registro válido', async () => {
    expect(await mensajes({})).toEqual([]);
  });

  it('acepta cualquiera de los símbolos !, @ y #', async () => {
    for (const simbolo of ['!', '@', '#']) {
      expect(await mensajes({ password: `Clave123${simbolo}` })).toEqual([]);
    }
  });

  it('exige al menos 8 caracteres', async () => {
    expect(await mensajes({ password: 'Ab1!xyz' })).toEqual([
      expect.stringContaining('al menos 8 caracteres'),
    ]);
  });

  it('exige una mayúscula', async () => {
    expect(await mensajes({ password: 'clave123!' })).toEqual([
      expect.stringContaining('mayúscula'),
    ]);
  });

  it('exige una minúscula', async () => {
    expect(await mensajes({ password: 'CLAVE123!' })).toEqual([
      expect.stringContaining('minúscula'),
    ]);
  });

  it('exige un número', async () => {
    expect(await mensajes({ password: 'ClaveClave!' })).toEqual([
      expect.stringContaining('número'),
    ]);
  });

  it('exige un símbolo especial (!, @ o #)', async () => {
    expect(await mensajes({ password: 'Clave12345' })).toEqual([
      expect.stringContaining('símbolo especial'),
    ]);
  });

  it('devuelve todas las reglas que no se cumplen', async () => {
    expect(await mensajes({ password: 'abc' })).toHaveLength(4);
  });

  it('exige aceptar los términos', async () => {
    expect(await mensajes({ aceptaTerminos: false })).toEqual([
      expect.stringContaining('términos de uso'),
    ]);
    expect(await mensajes({ aceptaTerminos: undefined })).not.toEqual([]);
  });
});
