import type { Config } from 'jest';

// Pruebas de integración: instancian los repositorios Prisma reales contra
// la base de datos de docker-compose (sin mocks, sin levantar la app HTTP
// completa como en test/*.e2e-spec.ts). Verifican lo que las unitarias no
// pueden: mapeos Prisma->dominio, constraints únicos, ordenamientos y
// filtros reales de SQL (ver src/**/infrastructure/persistence/*.integration-spec.ts).
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.integration-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
};

export default config;
