# FilaCero — Backend

Backend del proyecto integrador **FilaCero**: sistema web para la gestión de turnos y el seguimiento de la dispensación de medicamentos en EPS y centros médicos (Ingeniería de Software I, Universidad de Cundinamarca — Fusagasugá).

> Contexto completo del proyecto (requisitos, roles, modelo de datos, reglas de negocio): [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).
> Estado real del código frente a esos requisitos: [AUDIT_REPORT.md](./AUDIT_REPORT.md).

## Stack

- **Node.js** + **TypeScript**
- **NestJS 12** (arquitectura hexagonal por módulo: `domain` / `application` / `infrastructure`)
- **Prisma 6** como ORM
- **PostgreSQL 16**
- **JWT** (`@nestjs/jwt`) para autenticación, **bcrypt** para hash de contraseñas
- **Jest** + **supertest** para pruebas
- **oxlint** como linter, **Prettier** como formateador

## Requisitos previos

- Node.js 22+ (el proyecto usa `@types/node` ^24)
- Docker (para levantar PostgreSQL local vía `docker-compose.yml`) — o un PostgreSQL propio
- npm

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar las variables de entorno y ajustar si hace falta
cp .env.example .env

# 3. Levantar la base de datos (PostgreSQL en Docker)
docker compose up -d

# 4. Aplicar las migraciones y generar el cliente de Prisma
npx prisma migrate dev

# 5. Cargar datos de demostración (admin, personal, paciente, entidad,
#    sede, servicios y ventanilla — ver sección "Demo" más abajo)
npm run db:seed

# 6. Levantar la API en modo desarrollo
npm run start:dev
```

La API queda disponible en `http://localhost:3000` (o el puerto que definas en `PORT`).
La documentación interactiva (Swagger) queda en **http://localhost:3000/api/docs**.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL. Por defecto apunta al contenedor de `docker-compose.yml`. |
| `JWT_SECRET` | Secreto para firmar/verificar los JWT. **Cambiar en cualquier entorno que no sea desarrollo local.** |
| `PORT` | Puerto HTTP de la API (opcional, por defecto `3000`). |

Ver [.env.example](./.env.example).

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run start:dev` | Levanta la API en modo watch |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Corre la build compilada |
| `npm run lint` | Corre oxlint sobre `src/` y `test/` |
| `npm run format` | Formatea con Prettier |
| `npm test` | Pruebas unitarias (Jest) |
| `npm run test:e2e` | Pruebas end-to-end |
| `npm run test:cov` | Pruebas con reporte de cobertura |
| `npx prisma studio` | Explorador visual de la base de datos |
| `npx prisma migrate dev` | Crea y aplica una migración a partir de cambios en `prisma/schema.prisma` |
| `npm run db:seed` | Carga los datos de demostración (ver sección "Demo") |

## Arquitectura

Monolito modular con **arquitectura hexagonal por dominio**. Cada módulo en `src/modules/<modulo>/` sigue la misma estructura:

```
domain/          → entidades, interfaces de repositorio (puertos) y enums del dominio
application/     → casos de uso (un caso de uso = una clase con ejecutar()) y DTOs
infrastructure/  → controllers HTTP, repositorios Prisma y mappers dominio↔Prisma
```

Módulos actuales: `auth`, `usuarios`, `entidades-medicas`, `puntos-dispensacion`, `ventanillas`, `servicios`, `turnos`.

Los errores conocidos de Prisma (violación de restricción única, registro no encontrado, violación de FK) se traducen a respuestas HTTP limpias mediante un filtro global (`PrismaExceptionFilter`); nunca deberían verse como un 500 con stacktrace.

## Autenticación y roles

La API usa JWT Bearer (`Authorization: Bearer <token>`). Hay tres roles (`Rol`): `PACIENTE`, `FUNCIONARIO`, `ADMIN`.

- **Rutas públicas** (sin token): `POST /auth/register`, `POST /auth/login`, y la exploración de catálogos (`GET /entidades-medicas`, `GET /servicios`, …).
- **Rutas autenticadas sin rol específico**: accesibles a cualquier usuario con token válido (p. ej. crear tu propio turno).
- **Rutas restringidas por rol** (`@Roles(...)`): por ejemplo, crear entidades médicas o servicios, listar todos los usuarios, o gestionar la fila (`avanzar` un turno) son operaciones de `ADMIN`/`FUNCIONARIO`.
- Los guards (`JwtAuthGuard`, `RolesGuard`) están registrados **globalmente**; una ruta nueva requiere autenticación por defecto salvo que se marque explícitamente con `@Public()`.

## Demo

`npm run db:seed` crea (de forma idempotente — se puede correr varias veces sin duplicar datos) tres usuarios y un catálogo básico para probar el flujo completo sin tocar la base de datos a mano:

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | `admin@filacero.demo` | `FilaCero2026!` |
| FUNCIONARIO | `funcionario@filacero.demo` | `FilaCero2026!` |
| PACIENTE | `paciente@filacero.demo` | `FilaCero2026!` |

Más una `EntidadMedica` ("Nueva EPS"), un `PuntoDispensacion` ("Sede Fusagasugá"), dos `Servicio` y una `Ventanilla` ya creados. El script imprime los IDs generados al terminar.

**Guion de demo sugerido** (las tres funcionalidades núcleo, en orden), todo probable desde `http://localhost:3000/api/docs`:

1. **Autenticación** — `POST /auth/login` con `paciente@filacero.demo`. Copiar el `accessToken` de la respuesta y pegarlo en el botón **Authorize** de Swagger (arriba a la derecha) para autenticar el resto de las pruebas.
2. **Catálogo** — `GET /servicios` y `GET /puntos-dispensacion` (públicos, no requieren el candado) para mostrar los servicios y sedes disponibles.
3. **Turnos** —
   - `POST /turnos` con el `servicioId` y `puntoId` obtenidos del catálogo: crea el turno y muestra la posición en la fila.
   - `GET /turnos/mis-turnos`: el paciente ve su propio turno y su posición — esta es la pantalla central del producto.
   - Cerrar sesión de paciente y autenticar con `funcionario@filacero.demo`. `GET /ventanillas?puntoId=<puntoId>` para obtener una ventanilla, luego `PATCH /turnos/{id}/avanzar` con `{"ventanillaId": "..."}` para llamar el turno (PENDIENTE → EN_CURSO), y de nuevo sin body para finalizar la atención (EN_CURSO → ATENDIDO).

## Pruebas

```bash
npm test          # unitarias
npm run test:e2e  # end-to-end (requiere la base de datos levantada)
```

## Documentación relacionada

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — requisitos funcionales/no funcionales, roles, modelo de datos y reglas de negocio del proyecto.
- [AUDIT_REPORT.md](./AUDIT_REPORT.md) — auditoría del estado del repositorio frente a esos requisitos.
