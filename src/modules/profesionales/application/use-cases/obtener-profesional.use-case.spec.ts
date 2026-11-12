import { NotFoundException } from '@nestjs/common';
import { ObtenerProfesionalUseCase } from './obtener-profesional.use-case';
import { Profesional } from '../../domain/profesional.entity';
import { ProfesionalRepository } from '../../domain/profesional.repository';

function repositorio(resultado: Profesional | null) {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn().mockResolvedValue(resultado),
    buscarPorRegistroMedico: jest.fn(),
    listar: jest.fn(),
  } as jest.Mocked<ProfesionalRepository>;
}

describe('ObtenerProfesionalUseCase', () => {
  it('lanza NotFound si el profesional no existe', async () => {
    const useCase = new ObtenerProfesionalUseCase(repositorio(null));
    await expect(useCase.ejecutar('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('devuelve el profesional cuando existe', async () => {
    const profesional = new Profesional('id-1', 'RM-1', 'Ana', 'Pérez', 'Pediatría', true, 'p-1');
    const useCase = new ObtenerProfesionalUseCase(repositorio(profesional));
    await expect(useCase.ejecutar('id-1')).resolves.toBe(profesional);
  });
});
