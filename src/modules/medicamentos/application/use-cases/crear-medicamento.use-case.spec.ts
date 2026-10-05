import { ConflictException } from '@nestjs/common';
import { CrearMedicamentoUseCase } from './crear-medicamento.use-case';
import { MedicamentoRepository } from '../../domain/medicamento.repository';
import { Medicamento } from '../../domain/medicamento.entity';
import { CrearMedicamentoDto } from '../dto/crear-medicamento.dto';

function crearRepositorioFalso(
  overrides: Partial<MedicamentoRepository> = {},
): jest.Mocked<MedicamentoRepository> {
  return {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorCodigoNacional: jest.fn(),
    listar: jest.fn(),
    ...overrides,
  } as jest.Mocked<MedicamentoRepository>;
}

const dto: CrearMedicamentoDto = {
  codigoNacional: 'CUM-12345',
  nombreGenerico: 'Acetaminofén',
  concentracion: '500mg',
  presentacion: 'Tableta',
  laboratorioFabricante: 'Lab Genérico',
};

describe('CrearMedicamentoUseCase', () => {
  it('rechaza el registro si el código nacional ya existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorCodigoNacional: jest.fn().mockResolvedValue(
        new Medicamento('id-1', dto.codigoNacional, 'x', 'x', 'x', 'x', false),
      ),
    });
    const useCase = new CrearMedicamentoUseCase(repositorio);

    await expect(useCase.ejecutar(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repositorio.crear).not.toHaveBeenCalled();
  });

  it('crea el medicamento cuando el código nacional no existe', async () => {
    const repositorio = crearRepositorioFalso({
      buscarPorCodigoNacional: jest.fn().mockResolvedValue(null),
      crear: jest
        .fn()
        .mockImplementation((m) =>
          Promise.resolve(
            new Medicamento(
              'id-1',
              m.codigoNacional,
              m.nombreGenerico,
              m.concentracion,
              m.presentacion,
              m.laboratorioFabricante,
              m.requiereAutorizacion ?? false,
            ),
          ),
        ),
    });
    const useCase = new CrearMedicamentoUseCase(repositorio);

    const resultado = await useCase.ejecutar(dto);

    expect(repositorio.crear).toHaveBeenCalledTimes(1);
    expect(resultado.codigoNacional).toBe(dto.codigoNacional);
  });
});
