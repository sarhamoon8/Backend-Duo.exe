# AUDIT_REPORT.md — Auditoría del repositorio `filacero-backend`

> **Fecha de la auditoría:** 21 de septiembre de 2026
> **Alcance:** inspección de solo lectura del repositorio local `C:\Users\sarha\Documents\filacero-backend`, contrastada con `PROJECT_CONTEXT.md`.
> **Método:** lectura directa de archivos. No se ejecutaron migraciones, seeds, comandos de git que modifiquen el repositorio, ni se modificó ningún archivo existente. El único archivo creado es este informe.
> **Convención:** cada hallazgo cita el archivo donde se verificó. Lo que no pudo confirmarse leyendo código se marca explícitamente como *(inferido)*.

---

## 1. ESTADO ACTUAL

El repositorio contiene un **backend NestJS + Prisma + PostgreSQL real y funcional**, no un esqueleto vacío. Existe un *walking skeleton* del núcleo de FilaCero: registro/login con JWT, gestión de usuarios, entidades médicas, servicios y turnos con máquina de estados básica.

Está organizado con una **arquitectura hexagonal / Clean Architecture por módulo** (`domain` / `application` / `infrastructure`), aplicada de forma consistente en los cinco módulos existentes. El código es coherente, sigue un mismo patrón y está escrito en español (nombres de clases, métodos `ejecutar()`, DTOs).

Cubre aproximadamente **RF-01 (parcial) y RF-02 (parcial)** de los diez requisitos funcionales. Los otros ocho no tienen ninguna representación en el código.

Dos hechos de contexto importantes:

- **El repositorio no tiene ni un solo commit.** `git log` devuelve `fatal: your current branch 'master' does not have any commits yet`. Todo el proyecto (94 archivos, incluidos `src/`, `prisma/`, `package.json`) aparece como *untracked* en `git status`. No existe historial, ni ramas, ni respaldo en Git.
- **El modelo de datos implementado no es el modelo de 12 entidades documentado** en `PROJECT_CONTEXT.md` §15.1. Es un modelo propio de 4 entidades con nombres, tipos y claves distintos. Esta es la divergencia más importante del informe (ver §6).

**Estado de compilación/ejecución:** existe `dist/` y `tsconfig.build.tsbuildinfo` con fecha 18/09, lo que indica que el proyecto compiló correctamente en algún momento *(inferido — no se ejecutó `npm run build` durante esta auditoría)*. No se levantó la aplicación ni se conectó a la base de datos.

---

## 2. STACK TECNOLÓGICO REAL

Detectado en [package.json](package.json), [prisma/schema.prisma](prisma/schema.prisma), [docker-compose.yml](docker-compose.yml), [tsconfig.json](tsconfig.json):

| Capa | Tecnología | Versión | Evidencia |
|---|---|---|---|
| Lenguaje | TypeScript | ^6.0.2 | [package.json:57](package.json#L57) |
| Runtime | Node.js (tipos `@types/node` ^24) | — | [package.json:42](package.json#L42) |
| Framework backend | **NestJS** | ^12.0.1 | [package.json:24-28](package.json#L24-L28) |
| Servidor HTTP | Express (`@nestjs/platform-express`) | ^12.0.1 | [package.json:28](package.json#L28) |
| ORM | **Prisma** (`prisma` + `@prisma/client`) | ^6.19.3 | [package.json:29](package.json#L29), [package.json:50](package.json#L50) |
| Base de datos | **PostgreSQL 16** | 16 | [prisma/schema.prisma:12](prisma/schema.prisma#L12), [docker-compose.yml](docker-compose.yml) |
| Autenticación | **JWT** (`@nestjs/jwt`), HS256 por defecto, `expiresIn: '1d'` | ^12.0.2 | [src/modules/auth/auth.module.ts:18-19](src/modules/auth/auth.module.ts#L18-L19) |
| Hash de contraseñas | **bcrypt**, `SALT_ROUNDS = 10` | ^6.0.0 | [src/modules/usuarios/application/use-cases/crear-usuario.use-case.ts:9](src/modules/usuarios/application/use-cases/crear-usuario.use-case.ts#L9) |
| Validación | `class-validator` + `class-transformer` | ^0.15.1 / ^0.5.1 | [package.json:32-33](package.json#L32-L33) |
| Configuración | `@nestjs/config` (global) | ^12.0.0 | [src/app.module.ts:15](src/app.module.ts#L15) |
| Linter | **oxlint** (no ESLint) con `--type-aware` | ^1.58.0 | [package.json:16](package.json#L16), [.oxlintrc.json](.oxlintrc.json) |
| Formateador | Prettier | ^3.4.2 | [.prettierrc](.prettierrc) |
| Testing | Jest + ts-jest + supertest, en modo ESM (`--experimental-vm-modules`) | ^30.0.0 | [jest.config.ts](jest.config.ts), [package.json:17-21](package.json#L17-L21) |
| Infraestructura local | Docker Compose (solo servicio `db`) | — | [docker-compose.yml](docker-compose.yml) |
| Módulos TS | `nodenext` / `isolatedModules` / `strict: true` | — | [tsconfig.json](tsconfig.json) |

**Configuración de base de datos** ([docker-compose.yml](docker-compose.yml)): Postgres 16, usuario `filacero`, base `filacero_db`, puerto `5432` publicado al host, volumen persistente `pgdata`.

**Variables de entorno** ([.env](.env), existe pero está en `.gitignore`): se usan exactamente dos — `DATABASE_URL` (apunta a `localhost:5432/filacero_db`, esquema `public`) y `JWT_SECRET` (valor de desarrollo, literalmente un placeholder). **No existe `.env.example`.**

**Sin definir en el repo:** frontend (este repo es solo backend), CI/CD (no hay `.github/`), sistema de notificaciones, documentación de API (no hay Swagger/`@nestjs/swagger`).

---

## 3. IMPLEMENTADO

### 3.1 Arquitectura (verificada en el árbol de `src/`)

**Arquitectura hexagonal / Clean Architecture por módulo de dominio**, con NestJS como framework y un monolito modular. Cada módulo en [src/modules/](src/modules/) repite la misma estructura de tres capas:

```
src/modules/<modulo>/
  domain/          → entidad, interfaz de repositorio, enums, token Symbol de DI
  application/     → use-cases (un caso de uso = una clase con ejecutar()), DTOs
  infrastructure/  → http/ (controller), persistence/ (repo Prisma + mapper)
  <modulo>.module.ts
```

Patrones concretos verificados:

- **Inversión de dependencias mediante tokens `Symbol`**: cada dominio define su token y la interfaz; el módulo lo liga a la implementación Prisma. Ej.: `export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY')` en [src/modules/usuarios/domain/usuario.repository.ts:17](src/modules/usuarios/domain/usuario.repository.ts#L17), enlazado con `{ provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository }` en [src/modules/usuarios/usuarios.module.ts:16](src/modules/usuarios/usuarios.module.ts#L16).
- **Un caso de uso por archivo**, con método público `ejecutar()`. Ej.: [src/modules/turnos/application/use-cases/avanzar-turno.use-case.ts](src/modules/turnos/application/use-cases/avanzar-turno.use-case.ts).
- **Mappers explícitos** en el borde de infraestructura para traducir modelos Prisma → entidades de dominio, incluida la traducción de enums (que son tipos nominales distintos). Ver el comentario deliberado en [src/modules/usuarios/infrastructure/persistence/usuario.mapper.ts:6-7](src/modules/usuarios/infrastructure/persistence/usuario.mapper.ts#L6-L7).
- **DTOs de respuesta con factoría estática `fromEntity()`**, que deliberadamente **excluyen el campo `password`** de las respuestas HTTP: [src/modules/usuarios/application/dto/usuario-response.dto.ts:13-21](src/modules/usuarios/application/dto/usuario-response.dto.ts#L13-L21).
- **`PrismaModule` marcado `@Global()`** con ciclo de vida gestionado (`onModuleInit` → `$connect`, `onModuleDestroy` → `$disconnect`): [src/shared/infrastructure/prisma/prisma.module.ts:3](src/shared/infrastructure/prisma/prisma.module.ts#L3), [src/shared/infrastructure/prisma/prisma.service.ts](src/shared/infrastructure/prisma/prisma.service.ts).
- **Composición raíz** en [src/app.module.ts:13-22](src/app.module.ts#L13-L22): `ConfigModule.forRoot({ isGlobal: true })` + `PrismaModule` + los cinco módulos de dominio.

### 3.2 Base de datos (verificada en `prisma/`)

- Proveedor **PostgreSQL**, URL desde `env("DATABASE_URL")`: [prisma/schema.prisma:11-14](prisma/schema.prisma#L11-L14).
- **Una sola migración aplicada**: [prisma/migrations/20260916035421_init/migration.sql](prisma/migrations/20260916035421_init/migration.sql), que crea 2 tipos enum, 4 tablas, 1 índice único (`Usuario_email_key`) y 3 claves foráneas, todas con `ON DELETE RESTRICT ON UPDATE CASCADE`.
- **No se detecta drift** entre [prisma/schema.prisma](prisma/schema.prisma) y la migración `init`: los 4 modelos y 2 enums del schema están íntegramente cubiertos por el SQL.
- Lock de proveedor: `provider = "postgresql"` en [prisma/migrations/migration_lock.toml](prisma/migrations/migration_lock.toml).
- **No existe archivo de seed** (no hay `prisma/seed.ts` ni clave `prisma.seed` en `package.json`).
- Claves primarias: **todas `String` con `@default(uuid())`** (columna `TEXT` en Postgres).

### 3.3 Modelos de Prisma existentes (verificados en [prisma/schema.prisma](prisma/schema.prisma))

Existen exactamente **4 modelos y 2 enums**:

| Modelo | Campos | Línea |
|---|---|---|
| `Usuario` | `id` (uuid, PK) · `nombre` · `email` (`@unique`) · `password` · `rol` (enum `Rol`, default `PACIENTE`) · `creadoEn` (default now) · `turnos Turno[]` | [schema.prisma:16-24](prisma/schema.prisma#L16-L24) |
| `EntidadMedica` | `id` (uuid, PK) · `nombre` · `servicios Servicio[]` | [schema.prisma:32-36](prisma/schema.prisma#L32-L36) |
| `Servicio` | `id` (uuid, PK) · `nombre` · `entidad`/`entidadId` (FK → `EntidadMedica`) · `turnos Turno[]` | [schema.prisma:38-44](prisma/schema.prisma#L38-L44) |
| `Turno` | `id` (uuid, PK) · `usuarioId` (FK → `Usuario`) · `servicioId` (FK → `Servicio`) · `estado` (enum `EstadoTurno`, default `PENDIENTE`) · `posicion` (`Int?`) · `creadoEn` | [schema.prisma:46-55](prisma/schema.prisma#L46-L55) |

| Enum | Valores | Línea |
|---|---|---|
| `Rol` | `PACIENTE`, `FUNCIONARIO`, `ADMIN` | [schema.prisma:26-30](prisma/schema.prisma#L26-L30) |
| `EstadoTurno` | `PENDIENTE`, `EN_CURSO`, `ATENDIDO`, `CANCELADO` | [schema.prisma:57-62](prisma/schema.prisma#L57-L62) |

Los enums están duplicados como enums de TypeScript en la capa de dominio: [src/modules/usuarios/domain/rol.enum.ts](src/modules/usuarios/domain/rol.enum.ts) y [src/modules/turnos/domain/estado-turno.enum.ts](src/modules/turnos/domain/estado-turno.enum.ts).

### 3.4 Endpoints existentes (16 rutas en 5 controladores)

| Método | Ruta | Controlador |
|---|---|---|
| `GET` | `/` | [src/app.controller.ts:8](src/app.controller.ts#L8) — devuelve `"Hello World!"` (boilerplate) |
| `POST` | `/auth/register` | [auth.controller.ts:22](src/modules/auth/infrastructure/http/auth.controller.ts#L22) |
| `POST` | `/auth/login` | [auth.controller.ts:17](src/modules/auth/infrastructure/http/auth.controller.ts#L17) |
| `POST` | `/usuarios` | [usuario.controller.ts:17](src/modules/usuarios/infrastructure/http/usuario.controller.ts#L17) |
| `GET` | `/usuarios` | [usuario.controller.ts:23](src/modules/usuarios/infrastructure/http/usuario.controller.ts#L23) |
| `GET` | `/usuarios/:id` | [usuario.controller.ts:29](src/modules/usuarios/infrastructure/http/usuario.controller.ts#L29) |
| `POST` | `/entidades-medicas` | [entidad-medica.controller.ts:17](src/modules/entidades-medicas/infrastructure/http/entidad-medica.controller.ts#L17) |
| `GET` | `/entidades-medicas` | [entidad-medica.controller.ts:24](src/modules/entidades-medicas/infrastructure/http/entidad-medica.controller.ts#L24) |
| `GET` | `/entidades-medicas/:id` | [entidad-medica.controller.ts:30](src/modules/entidades-medicas/infrastructure/http/entidad-medica.controller.ts#L30) |
| `POST` | `/servicios` | [servicio.controller.ts:17](src/modules/servicios/infrastructure/http/servicio.controller.ts#L17) |
| `GET` | `/servicios?entidadId=` | [servicio.controller.ts:23](src/modules/servicios/infrastructure/http/servicio.controller.ts#L23) |
| `GET` | `/servicios/:id` | [servicio.controller.ts:30](src/modules/servicios/infrastructure/http/servicio.controller.ts#L30) |
| `POST` | `/turnos` | [turno.controller.ts:19](src/modules/turnos/infrastructure/http/turno.controller.ts#L19) |
| `GET` | `/turnos/servicio/:servicioId` | [turno.controller.ts:25](src/modules/turnos/infrastructure/http/turno.controller.ts#L25) |
| `PATCH` | `/turnos/:id/avanzar` | [turno.controller.ts:33](src/modules/turnos/infrastructure/http/turno.controller.ts#L33) |
| `PATCH` | `/turnos/:id/cancelar` | [turno.controller.ts:39](src/modules/turnos/infrastructure/http/turno.controller.ts#L39) |

El diseño REST es correcto en sus convenciones: sustantivos en plural, verbos HTTP adecuados, `PATCH` para transiciones de estado, JSON en ambos sentidos — coherente con el material de APIs REST citado en `PROJECT_CONTEXT.md` §14.

### 3.5 Funcionalidades de FilaCero realmente implementadas

- **Hash de contraseñas con bcrypt** y exclusión del campo `password` en las respuestas — cumple el NFR de Seguridad ("ninguna contraseña en texto plano"): [crear-usuario.use-case.ts:26](src/modules/usuarios/application/use-cases/crear-usuario.use-case.ts#L26).
- **Registro con emisión de JWT** y rechazo de email duplicado (`ConflictException`): [register.use-case.ts](src/modules/auth/application/use-cases/register.use-case.ts), [crear-usuario.use-case.ts:21-24](src/modules/usuarios/application/use-cases/crear-usuario.use-case.ts#L21-L24).
- **Login con verificación bcrypt** y mensaje de error genérico ("Credenciales inválidas") tanto si el usuario no existe como si la contraseña falla — buena práctica contra enumeración de usuarios: [login.use-case.ts:22-33](src/modules/auth/application/use-cases/login.use-case.ts#L22-L33).
- **Payload del JWT** incluye `sub`, `email` y `rol` — la base para autorización por rol ya está presente en el token: [login.use-case.ts:35-39](src/modules/auth/application/use-cases/login.use-case.ts#L35-L39).
- **CRUD de lectura + creación** para Usuarios, Entidades Médicas y Servicios.
- **Creación de turno con cálculo de posición en la fila** (`pendientes + 1`) y validación previa de existencia de usuario y servicio: [crear-turno.use-case.ts:34-45](src/modules/turnos/application/use-cases/crear-turno.use-case.ts#L34-L45).
- **Máquina de estados de turno con transiciones explícitas**: `PENDIENTE → EN_CURSO → ATENDIDO`, con estados terminales que rechazan el avance mediante `BadRequestException`: [avanzar-turno.use-case.ts:13-18](src/modules/turnos/application/use-cases/avanzar-turno.use-case.ts#L13-L18). Esto es una **decisión de diseño nueva** que `PROJECT_CONTEXT.md` §12 marcaba como "PENDIENTE DE DEFINIR".
- **Cancelación de turno** con bloqueo desde estados terminales: [cancelar-turno.use-case.ts:27-35](src/modules/turnos/application/use-cases/cancelar-turno.use-case.ts#L27-L35).
- **Listado de turnos por servicio**, ordenado por `creadoEn asc` (orden FIFO de la fila): [prisma-turno.repository.ts:32-35](src/modules/turnos/infrastructure/persistence/prisma-turno.repository.ts#L32-L35).

---

## 4. PARCIALMENTE IMPLEMENTADO

| # | Funcionalidad | Qué existe | Qué falta | Archivo |
|---|---|---|---|---|
| 4.1 | **RF-01 Registro y autenticación** | Registro, login, emisión de JWT, hash bcrypt | No hay logout/refresh token; no hay recuperación de contraseña; el registro no permite elegir rol (siempre `PACIENTE` por el default del DTO) mientras que `POST /usuarios` sí lo permite sin control | [auth.controller.ts](src/modules/auth/infrastructure/http/auth.controller.ts), [register.dto.ts](src/modules/auth/application/dto/register.dto.ts) |
| 4.2 | **Autorización por rol (NFR Seguridad/Privacidad)** | `JwtAuthGuard` implementado y correcto, exportado por `AuthModule` | **No está aplicado en ningún controlador.** `grep -rn "UseGuards" src/` no devuelve ninguna coincidencia. No existe `RolesGuard` ni decorador `@Roles()`. **Todos los 16 endpoints son públicos.** | [jwt-auth.guard.ts](src/modules/auth/infrastructure/guards/jwt-auth.guard.ts), [auth.module.ts:26](src/modules/auth/auth.module.ts#L26) |
| 4.3 | **Validación de entrada** | DTOs con decoradores `@IsEmail`, `@MinLength(6)`, `@IsUUID`, `@IsEnum` en los 6 DTOs de entrada | **No se aplica ninguna validación en tiempo de ejecución.** No hay `app.useGlobalPipes(new ValidationPipe(...))` en [src/main.ts](src/main.ts) ni proveedor `APP_PIPE`. Los decoradores son decorativos hoy. | [src/main.ts:5-8](src/main.ts#L5-L8) |
| 4.4 | **RF-02 Gestión de turnos** | Solicitar turno, posición inicial, avanzar, cancelar, listar por servicio | Sin código alfanumérico de turno; sin punto de dispensación ni ventanilla; sin `hora_llamado`/`hora_finalizacion`; sin bandera de prioridad; sin endpoint "mis turnos" del usuario autenticado; sin tiempo estimado de espera; sin recálculo de `posicion` tras cancelaciones | [turno.controller.ts](src/modules/turnos/infrastructure/http/turno.controller.ts), [prisma/schema.prisma:46-55](prisma/schema.prisma#L46-L55) |
| 4.5 | **Modelo de roles** | Enum `Rol` con 3 valores que corresponden a los 3 roles documentados (`PACIENTE`=Usuario Final, `FUNCIONARIO`=Personal de Atención, `ADMIN`=Usuario Administrativo) *(la correspondencia es inferida — no está documentada en el código)* | Implementado como **enum de columna**, no como la tabla `ROL` del modelo documentado; no hay permisos asociados | [prisma/schema.prisma:26-30](prisma/schema.prisma#L26-L30) |
| 4.6 | **Modelo de datos** | 4 de las 12 entidades documentadas, con estructura propia | 8 entidades faltantes + divergencias de tipos/campos (detalle en §6) | [prisma/schema.prisma](prisma/schema.prisma) |
| 4.7 | **Pruebas** | Infraestructura Jest + supertest configurada y funcionando | Solo existen las **2 pruebas boilerplate de NestJS** (`getHello`). Cero pruebas de dominio, casos de uso o endpoints de FilaCero. | [src/app.controller.spec.ts](src/app.controller.spec.ts), [test/app.e2e-spec.ts](test/app.e2e-spec.ts) |
| 4.8 | **README** | Existe | Es el **README por defecto de NestJS** sin una sola línea sobre FilaCero: no documenta cómo levantar la BD, aplicar migraciones, ni las variables de entorno necesarias | [README.md](README.md) |

---

## 5. PENDIENTE

### 5.1 Requisitos funcionales sin ninguna línea de código

| RF | Requisito | Estado |
|---|---|---|
| **RF-03** | Gestión de citas y lista de espera | **No existe.** No hay modelo `Cita` ni `ListaEspera` en el schema, ni módulo correspondiente. |
| **RF-04** | Reasignación automática de citas | **No existe.** Sin `Cita`, sin scheduler (`@nestjs/schedule` no está instalado), sin algoritmo de reasignación. |
| **RF-05** | Notificaciones | **No existe.** Sin modelo `Notificacion`, sin módulo, sin proveedor de envío. |
| **RF-06** | Consulta de medicamentos y disponibilidad | **No existe.** Sin modelos `Medicamento` ni `Inventario`. |
| **RF-07** | Reserva de medicamentos (ventana 24–48 h) | **No existe.** Sin modelo `Reserva`. La ventana de 24–48 h no aparece en ninguna parte del código. |
| **RF-08** | Historial y recordatorios de medicamentos | **No existe.** |
| **RF-09** | Consulta y descarga de resultados clínicos | **No existe.** |
| **RF-10** | Perfil de salud | **No existe.** El `Usuario` solo tiene `nombre` y `email`. |

### 5.2 Entidades del modelo documentado (§15.1) que no existen en el schema

`ROL` (tabla) · `PUNTO_DISPENSACION` · `VENTANILLA` · `NOTIFICACION` · `MEDICAMENTO` · `RESERVA` · `INVENTARIO` · `ENTREGA_DISPENSACION` · `DETALLE_ENTREGA` — **9 de 12 ausentes** (contando `ROL` como tabla).

### 5.3 Funcionalidades de personal y administración

- **EPIC-11** (personal de atención: ventanillas, llamar al siguiente, estado de atención): existe `PATCH /turnos/:id/avanzar` pero sin ventanillas, sin endpoint "llamar al siguiente de la cola", sin restricción de rol.
- **EPIC-12** (administración: puntos de dispensación, estadísticas): **no existe**. Sin endpoints de estadísticas, tiempos promedio ni volúmenes de atención.

### 5.4 Infraestructura y calidad

- Sin `ValidationPipe` global, sin filtro global de excepciones, sin interceptor de logging.
- Sin CORS (`enableCors`) — el frontend no podrá consumir la API desde otro origen.
- Sin versionado ni prefijo de API (`/api/v1`).
- Sin documentación de API (Swagger/OpenAPI no instalado).
- Sin `.env.example`.
- Sin seed de datos de desarrollo.
- Sin CI/CD (no existe `.github/`), pese a que `PROJECT_CONTEXT.md` §14 expresa intención de enfoque DevOps.
- Sin healthcheck (`@nestjs/terminus`) — relevante para el NFR de disponibilidad del 99%.
- Sin `app.enableShutdownHooks()` en [src/main.ts](src/main.ts), por lo que `onModuleDestroy` de `PrismaService` puede no ejecutarse al recibir SIGTERM.
- Sin servicio de la aplicación en `docker-compose.yml` (solo la base de datos).
- **Sin ningún commit en Git.**

---

## 6. DIFERENCIAS CON PROJECT_CONTEXT.md

### 6.1 Decisiones que el código ya tomó y el documento marcaba como "PENDIENTE DE DEFINIR"

`PROJECT_CONTEXT.md` §13, §14 y §22 declaraban sin definir el stack completo. El repositorio **ya los fijó**, y estas decisiones deben respetarse y reflejarse en el documento:

| Decisión pendiente en el documento | Decisión tomada en el código |
|---|---|
| Framework de backend | **NestJS 12 + TypeScript** |
| Motor de base de datos | **PostgreSQL 16** (vía Docker Compose) |
| ORM / acceso a datos | **Prisma 6** con migraciones versionadas |
| Mecanismo de autenticación | **JWT Bearer**, expiración 1 día, payload `{sub, email, rol}` |
| Patrón arquitectónico | **Monolito modular con arquitectura hexagonal** (domain/application/infrastructure) |
| Máquina de estados de `estado_turno` (§12) | **`PENDIENTE → EN_CURSO → ATENDIDO`**, con `CANCELADO` alcanzable desde los dos primeros; `ATENDIDO` y `CANCELADO` terminales |
| Estrategia de identificadores | **UUID v4 como `String`/`TEXT`** |
| Idioma del código | **Español** para dominio, DTOs y rutas |

### 6.2 ⚠️ Contradicciones con la sección 20 ("Elementos que NO deben modificarse sin consultar")

**Contradicción 1 — El modelo relacional de 12 entidades (§20, viñeta 6).** Es la divergencia más grave. La sección 20 protege "el alcance de las 12 entidades del modelo relacional completo y sus claves primarias/foráneas, a menos que se confirme explícitamente un cambio de modelo". El código implementa un modelo **estructuralmente distinto**:

| Aspecto | Modelo documentado (§15.1) | [prisma/schema.prisma](prisma/schema.prisma) |
|---|---|---|
| Nº de entidades | 12 | **4** |
| Tipo de PK | `int` / `bigint` autoincremental | **`String` UUID** |
| `ROL` | Tabla propia con `nombre_rol`, `descripcion`, relación 1:N con `USUARIO` | **Enum de columna** en `Usuario` ([schema.prisma:26-30](prisma/schema.prisma#L26-L30)) |
| `USUARIO` | `numero_documento` (UK), `tipo_documento`, `nombres`, `apellidos`, `correo_electronico` (UK), `contrasena_hash`, `telefono`, `fecha_registro` | Solo `nombre` (un campo), `email`, `password`, `rol`, `creadoEn` ([schema.prisma:16-24](prisma/schema.prisma#L16-L24)) |
| `PUNTO_DISPENSACION` | Entidad con sede, dirección, ciudad, capacidad | **No existe.** En su lugar hay **`EntidadMedica`** (solo `id` + `nombre`), que **no figura en ninguna versión del modelo documentado** ([schema.prisma:32-36](prisma/schema.prisma#L32-L36)) |
| `SERVICIO` | `codigo_servicio` (UK), `tiempo_promedio_min`, `activo` | Solo `nombre` + `entidadId` ([schema.prisma:38-44](prisma/schema.prisma#L38-L44)) |
| `TURNO` | `codigo_alfanumerico`, `fecha_emision`, `hora_llamado`, `hora_finalizacion`, `prioridad`, FK a punto y ventanilla | Solo `usuarioId`, `servicioId`, `estado`, `posicion`, `creadoEn` ([schema.prisma:46-55](prisma/schema.prisma#L46-L55)) |
| `VENTANILLA`, `NOTIFICACION`, `MEDICAMENTO`, `RESERVA`, `INVENTARIO` | Definidas con todos sus campos | **No existen** |

`EntidadMedica` **no es un renombre de `PUNTO_DISPENSACION`**: son conceptos de nivel distinto (una EPS frente a una sede física). El modelo documentado necesitaría ambos. Esto es una decisión de modelado que se tomó en el código sin registro en el documento.

**Contradicción 2 — NFR de Seguridad y Privacidad (§20, viñeta 2; §10).** El documento fija como no modificable el criterio "un usuario no debe poder acceder a funcionalidades administrativas o información perteneciente a otros usuarios". El código **no cumple este criterio hoy**: ningún endpoint está protegido (§4.2). Tres consecuencias verificables:

- `POST /usuarios` es público y acepta el campo `rol` ([crear-usuario.dto.ts:15-17](src/modules/usuarios/application/dto/crear-usuario.dto.ts#L15-L17)): **cualquiera puede crear una cuenta `ADMIN` sin autenticarse**.
- `GET /usuarios` es público y devuelve **la lista completa de usuarios** con nombre, email, rol y fecha de registro.
- `POST /turnos` toma `usuarioId` del *body*, no del token ([crear-turno.dto.ts:4-5](src/modules/turnos/application/dto/crear-turno.dto.ts#L4-L5)): cualquiera puede crear turnos a nombre de otro usuario. Lo mismo con `PATCH /turnos/:id/avanzar` y `/cancelar`, que no verifican quién los invoca.

El otro criterio de Seguridad (contraseñas nunca en texto plano) **sí se cumple**.

**Contradicción 3 — La tabla `ROL` como decisión de diseño (§17, §6).** El documento registra explícitamente la diferenciación de roles "implementada mediante una tabla `ROL` genérica". El código usa un enum. Funcionalmente equivalente para tres roles fijos, pero es una desviación de una decisión documentada.

### 6.3 Puntos de §20 que el código **no** contradice

- **RF-07 y su ventana de 24–48 h:** el código **no implementa reservas en absoluto**, por lo que no contradice ni la prioridad Alta ni la Media. **La inconsistencia Alta vs. Media sigue abierta y sin resolver** — no hay nada en el repositorio que permita inferir qué prioridad se eligió. Este punto sigue requiriendo tu decisión antes de planificar el orden de desarrollo.
- **`ENTREGA_DISPENSACION` / `DETALLE_ENTREGA`:** no están implementadas, lo cual es **consistente** con el modelo conceptual reducido de 10 entidades (§15.2) y no viola §20. Ahora bien, el código tampoco implementa las otras 6 entidades que **sí** están en ese modelo de 10 (`PUNTO_DISPENSACION`, `VENTANILLA`, `NOTIFICACION`, `MEDICAMENTO`, `RESERVA`, `INVENTARIO`), así que su ausencia **no puede leerse como evidencia de que la decisión de excluirlas ya se tomó**. La pregunta de §15.2 sigue abierta.
- **Los 3 roles de usuario:** conceptualmente preservados en el enum `Rol` (aunque con otros nombres y sin tabla).
- **Los 10 códigos RF-01…RF-10:** no hay nada en el código que los renombre ni redefina.
- **Límites de "Qué NO hará el sistema":** respetados — no hay nada de diagnóstico, formulación ni modificación de medicamentos.
- **Umbrales de rendimiento (3 s) y disponibilidad (99 %):** no contradichos, pero tampoco medidos ni instrumentados.

### 6.4 Otras diferencias

- `PROJECT_CONTEXT.md` §21 y "ESTADO ACTUAL" afirman que "no hay evidencia de código fuente, migraciones ni artefactos de implementación real". **Esto ya está desactualizado**: existen 68 archivos fuente, una migración aplicada y un backend funcional. El documento debería actualizarse tras revisar esta auditoría.
- El documento asume un proyecto único; el repositorio es **solo el backend** (`filacero-backend`). No se encontró frontend en este repositorio.

---

## 7. PROBLEMAS O RIESGOS

Ordenados por severidad. Los marcados **[Sugerencia]** son opiniones técnicas que **no se han aplicado** y quedan a tu decisión.

### Críticos

**7.1 · El repositorio no tiene ningún commit.** `git log` falla con "does not have any commits yet"; los 94 archivos están *untracked*. No hay historial, ni respaldo remoto, ni forma de revertir un error. Para un proyecto académico evaluable esto también significa que **no hay evidencia de trazabilidad del trabajo**, lo cual suele ser parte de la calificación en asignaturas con enfoque ágil/DevOps. *(No ejecuté ningún comando de git que modifique el repositorio, conforme a tus instrucciones.)*

**7.2 · Toda la API está abierta.** Ningún `@UseGuards()` en el código. En particular, `POST /usuarios` permite a un anónimo crear un usuario con `rol: "ADMIN"`, y `GET /usuarios` expone el padrón completo de usuarios. Es una escalada de privilegios trivial y una fuga de datos personales — directamente contraria a los NFR de Seguridad y Privacidad que §20 protege.

**7.3 · Las validaciones de entrada no se ejecutan.** Los seis DTOs tienen decoradores de `class-validator`, pero sin `ValidationPipe` global ninguno se evalúa. Hoy `POST /auth/register` acepta `{"email": 123, "password": "a"}` sin rechazarlo, y el `@MinLength(6)` de la contraseña es inoperante. Además, al no haber `whitelist: true`, cualquier campo extra del body pasa sin filtrar. Es un arreglo de dos líneas en [src/main.ts](src/main.ts), pero hasta que se haga, toda la capa de validación es aparente.

**7.4 · `JWT_SECRET` es un placeholder y puede ser `undefined` en silencio.** El valor en [.env](.env) es literalmente `"dev-secret-change-me"`. Además, `configService.get<string>('JWT_SECRET')` ([auth.module.ts:18](src/modules/auth/auth.module.ts#L18)) devuelve `undefined` si la variable falta, y `@nestjs/jwt` fallaría en tiempo de ejecución, no al arrancar. Sin validación de esquema de configuración (`ConfigModule` está sin `validationSchema`), un despliegue mal configurado no se detecta hasta la primera petición de login.

### Altos

**7.5 · `posicion` del turno es un dato desincronizado.** Se calcula una vez, al crear el turno, como `contarPendientesPorServicio + 1` ([crear-turno.use-case.ts:40-47](src/modules/turnos/application/use-cases/crear-turno.use-case.ts#L40-L47)) y **nunca se recalcula**. Si el turno #3 se cancela, los turnos #4 y #5 conservan su posición y la fila queda con huecos. Peor: si el turno #1 pasa a `ATENDIDO`, el siguiente turno creado recibirá la posición del que acaba de atenderse, generando **posiciones duplicadas**. Como RF-02 y el flujo §12 dependen de "consultar la posición aproximada en la fila", este es un defecto funcional del núcleo, no cosmético. **[Sugerencia]** derivar la posición en tiempo de consulta a partir del orden `creadoEn` entre los turnos `PENDIENTE` del servicio, en lugar de persistirla.

**7.6 · Condición de carrera al crear turnos.** `contar` y `crear` son dos operaciones separadas sin transacción ni bloqueo. Dos solicitudes simultáneas para el mismo servicio obtienen el mismo conteo y reciben la misma `posicion`. No hay restricción `@@unique` que lo impida. Es exactamente el escenario de "momentos de alta demanda" que describe el problema del proyecto.

**7.7 · Cero cobertura de pruebas del dominio.** Las únicas pruebas son las dos de `getHello()` del boilerplate. La máquina de estados de turnos, el cálculo de posición, el rechazo de email duplicado y el flujo de login — toda la lógica de negocio — no tienen ninguna prueba. Los criterios de validación de los NFR del §10 no son verificables hoy.

**7.8 · Sin CORS habilitado.** No hay `app.enableCors()` en [src/main.ts](src/main.ts). En cuanto se conecte el frontend desde otro origen, todas las peticiones del navegador fallarán. Es previsible y barato de evitar.

### Medios

**7.9 · No existe `.env.example`.** `.env` está correctamente en `.gitignore` ([.gitignore:41](.gitignore#L41)), pero no hay plantilla versionada. Tu compañera de equipo no tiene forma de saber qué variables necesita para levantar el proyecto. Combinado con el README boilerplate (7.11), el proyecto no es reproducible por un tercero.

**7.10 · Falta de índices para las consultas de la fila.** `Turno` no tiene índice sobre `servicioId` ni sobre `(servicioId, estado)` ([prisma/schema.prisma:46-55](prisma/schema.prisma#L46-L55)). Las tres consultas principales de turnos (`listarPorServicio`, `contarPendientesPorServicio`) harán *sequential scan*. Con datos de prueba es irrelevante; frente al NFR de respuesta ≤ 3 s bajo carga, no lo es.

**7.11 · README es el boilerplate de NestJS.** [README.md](README.md) no menciona FilaCero en ninguna línea: no documenta `docker compose up`, `npx prisma migrate dev`, ni las variables de entorno. Para una entrega académica es también un artefacto evaluable.

**7.12 · `GET /` devuelve "Hello World!".** [src/app.controller.ts](src/app.controller.ts) y [src/app.service.ts](src/app.service.ts) son andamiaje de NestJS sin retirar. **[Sugerencia]** reemplazarlo por un healthcheck real, que además apoyaría el NFR de disponibilidad del 99 %.

**7.13 · Sin manejo global de errores ni logging.** Los errores de Prisma (p. ej. violación de FK, `P2002`) llegan al cliente como HTTP 500 sin traducir. No hay filtro de excepciones ni interceptor de logging, lo que también impide medir el NFR de los 3 segundos.

### Bajos / observaciones

**7.14 · Duplicación de enums entre Prisma y dominio.** `Rol` y `EstadoTurno` están definidos dos veces y se traducen con `as unknown as` en repositorios y mappers ([usuario.mapper.ts:11](src/modules/usuarios/infrastructure/persistence/usuario.mapper.ts#L11), [prisma-turno.repository.ts:44](src/modules/turnos/infrastructure/persistence/prisma-turno.repository.ts#L44)). El comentario del mapper muestra que **fue una decisión deliberada** para mantener el dominio independiente de Prisma, coherente con la arquitectura hexagonal. **No la cambiaría**; solo dejo constancia de que si un enum crece, hay que tocar dos sitios y el `as unknown as` no avisará del desajuste en compilación.

**7.15 · `docker-compose.yml` solo levanta la base de datos.** No hay servicio para la aplicación. Válido para desarrollo local; queda registrado si más adelante se busca el enfoque DevOps mencionado en §14.

**7.16 · Dependencias de despliegue sin usar.** `@nestjs/mau` y el script `"deploy": "nest deploy"` ([package.json:10](package.json#L10)) vienen del andamiaje y no corresponden a ninguna decisión del proyecto.

**7.17 · Versiones muy recientes del stack.** TypeScript ^6, NestJS ^12, `@types/node` ^24, oxlint en lugar de ESLint. Es una combinación moderna y poco común; puede dificultar encontrar documentación o ejemplos que coincidan. **No sugiero cambiarla** — funciona y ya es una decisión tomada; solo tenlo presente al buscar ayuda externa.

**7.18 · Directorio `.devin/` vacío** en la raíz, sin contenido ni referencia desde ningún archivo de configuración. Residuo de alguna herramienta *(inferido)*.

---

## 8. ORDEN DE DESARROLLO PROPUESTO

Propuesta, no ejecución. Nada de esto se ha aplicado.

### Paso 0 — Decisiones que te corresponden a ti (bloquean el modelo de datos)

Antes de tocar el schema hay tres preguntas abiertas que el código no resuelve:

1. **¿`EntidadMedica` se queda, o se migra hacia `PUNTO_DISPENSACION`?** El modelo documentado habla de sedes físicas con dirección, ciudad y capacidad; el código tiene una entidad con solo un nombre. Lo más fiel al documento sería **conservar `EntidadMedica` y añadir `PuntoDispensacion` como sede perteneciente a ella**, pero eso amplía el modelo de 12 a 13 entidades y §20 exige consultarlo.
2. **¿RF-07 (reserva de medicamentos) es prioridad Alta o Media?** La inconsistencia del PDF fuente sigue sin resolver y determina si entra antes o después de RF-08/09/10.
3. **¿`ENTREGA_DISPENSACION` y `DETALLE_ENTREGA` entran en esta fase?** Sin ellas no puede cerrarse el paso 9 del flujo (§12: "registrar la entrega asociada al turno"), que sí está en el alcance de la primera versión (§19: "Registrar las atenciones realizadas").

### Paso 1 — Asegurar lo que ya existe (antes de añadir nada)

Es el trabajo de menor esfuerzo y mayor impacto, y además desbloquea criterios de los NFR ya comprometidos:

1. **Primer commit en Git** y repositorio remoto. Todo lo demás es arriesgado mientras no exista historial.
2. **`ValidationPipe` global** con `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true` en [src/main.ts](src/main.ts) — activa de golpe toda la validación que ya está escrita (7.3).
3. **Aplicar `JwtAuthGuard`** a los endpoints que lo requieren y crear un **`RolesGuard` + decorador `@Roles()`** apoyado en el `rol` que el JWT ya transporta. Cerrar `POST /usuarios` (o eliminar el campo `rol` de su DTO público) y `GET /usuarios` (7.2).
4. **Tomar `usuarioId` del token, no del body** en `POST /turnos`, y añadir `GET /turnos/mis-turnos`.
5. **`enableCors()`** y **`app.enableShutdownHooks()`** (7.8).
6. **`.env.example`** + reescribir el README con las instrucciones reales de FilaCero (7.9, 7.11).
7. **Corregir el cálculo de `posicion`** (7.5) y proteger la creación concurrente (7.6).
8. **Primeras pruebas** de los casos de uso de turnos y auth (7.7).

### Paso 2 — Completar el modelo de datos del núcleo

Una vez resuelto el Paso 0, migrar el schema hacia el modelo acordado: enriquecer `Usuario` (documento, apellidos, teléfono), `Servicio` (código, tiempo promedio, activo) y `Turno` (código alfanumérico, horas de llamado/finalización, prioridad), y añadir `PuntoDispensacion` y `Ventanilla`. Añadir los índices de 7.10 en la misma migración.

### Paso 3 — RF-05 Notificaciones

Modelo `Notificacion` + módulo, inicialmente **in-app** (persistidas y consultables), dejando el canal externo (email/push) para después. Se pone temprano porque RF-03, RF-04 y RF-06 dependen de poder notificar.

### Paso 4 — RF-03 Citas y lista de espera

Modelos `Cita` y `ListaEspera` + endpoints de consulta e inscripción.

### Paso 5 — RF-04 Reasignación automática

Requiere `@nestjs/schedule` y definir formalmente el algoritmo (§12 lo marca como pendiente): criterio de orden en la lista de espera, ventana de aceptación de la oferta, qué pasa si nadie acepta.

### Paso 6 — RF-06 Medicamentos e inventario

Modelos `Medicamento` e `Inventario` + consulta de disponibilidad por punto de dispensación.

### Paso 7 — RF-07 Reserva de medicamentos

Modelo `Reserva` con `fecha_expiracion` y la **ventana de 24–48 h** (valor exacto a fijar dentro de ese rango, que §20 protege), más un job de expiración que libere el `stock_reservado`. Su posición depende de la respuesta al Paso 0.2.

### Paso 8 — Registro de atenciones

`EntregaDispensacion` y `DetalleEntrega`, si el Paso 0.3 confirma que entran en esta fase. Cierra el alcance de §19 ("registrar las atenciones realizadas").

### Paso 9 — EPIC-11 y EPIC-12

Endpoints de ventanilla para el personal de atención (llamar al siguiente de la cola) y panel administrativo con estadísticas básicas (tiempos promedio, volumen atendido, horas pico).

### Paso 10 — RF-08, RF-09, RF-10

Historial y recordatorios, resultados clínicos y perfil de salud — prioridad Media según la Tabla 3 del documento fuente.

### Transversal

Actualizar `PROJECT_CONTEXT.md` con las decisiones técnicas que el código ya fijó (§6.1 de este informe), ya que su sección "ESTADO ACTUAL" está desactualizada y afirma que no existe código.

---

*Informe generado en modo auditoría. No se modificó ningún archivo existente, no se ejecutaron migraciones, seeds ni comandos de git que alteren el repositorio, y no se escribió código de funcionalidad.*
