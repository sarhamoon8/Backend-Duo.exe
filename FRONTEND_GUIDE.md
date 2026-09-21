# Guía rápida para el equipo de frontend — FilaCero

Este documento es tu punto de partida para consumir el backend de FilaCero. No necesitas entrar a la carpeta `src/` en ningún momento: todo lo que necesitas para construir el frontend está en los tres recursos de esta guía.

## 1. Levantar el backend en tu máquina

```bash
git clone <url-del-repo>
cd filacero-backend
git checkout desarrollo

npm install
cp .env.example .env
docker compose up -d        # levanta PostgreSQL
npx prisma migrate dev      # crea las tablas
npm run db:seed             # crea usuarios y catálogo de prueba
npm run start:dev           # levanta la API
```

Con esto, la API queda corriendo en **`http://localhost:3000`**. Instrucciones completas (variables de entorno, scripts disponibles, arquitectura) en [README.md](./README.md), en la raíz del repo.

## 2. Tres formas de ver qué ofrece la API — usa la que prefieras

### 📄 README.md (raíz del repo)
Léelo primero. Explica cómo levantar el proyecto, qué son los tres roles (`PACIENTE`, `FUNCIONARIO`, `ADMIN`), cómo funciona la autenticación, y trae un guion de demo paso a paso.

### 🌐 Swagger — documentación interactiva
Con la API corriendo, abre en el navegador:

**http://localhost:3000/api/docs**

Ahí ves todos los endpoints agrupados por módulo, con los campos exactos que espera cada uno y las respuestas posibles. Puedes probarlos directamente ahí ("Try it out" → "Execute") sin escribir código todavía, para ver la forma real de cada respuesta antes de programar el fetch/axios correspondiente.

Para probar un endpoint protegido: primero ejecuta `POST /auth/login`, copia el `accessToken` de la respuesta, y pégalo en el botón **Authorize** (arriba a la derecha, ícono de candado).

### 📮 Postman — colección lista para importar
Archivo: [`postman/FilaCero-API.postman_collection.json`](./postman/FilaCero-API.postman_collection.json).

1. Abre Postman → **Import** → selecciona ese archivo.
2. Corre las peticiones de la carpeta **"1. Auth"** primero (guardan el token solas).
3. Luego **"2. Catálogo"**, **"3. Ventanillas"**, y ya puedes probar todo **"4. Turnos"** sin copiar/pegar nada.

Instrucciones más detalladas en [postman/README.md](./postman/README.md).

## 3. Lo esencial para empezar a programar

**URL base:** `http://localhost:3000` (CORS ya está habilitado, puedes consumirla desde cualquier puerto local sin configurar nada extra).

**Autenticación:** JWT Bearer. Después de `POST /auth/login` o `POST /auth/register`, guarda el `accessToken` que devuelven y mándalo en cada petición protegida:
```
Authorization: Bearer <accessToken>
```
El token dura 1 día. Si un endpoint te devuelve `401`, el token venció o no lo mandaste; si te devuelve `403`, el token es válido pero el rol del usuario no tiene permiso para ese endpoint.

**Los tres roles:**
| Rol | Qué puede hacer |
|---|---|
| `PACIENTE` | Registrarse, iniciar sesión, ver el catálogo, pedir su turno, ver sus propios turnos, cancelarlos |
| `FUNCIONARIO` | Todo lo del paciente + ver la fila completa de un punto, llamar y finalizar turnos |
| `ADMIN` | Todo lo anterior + crear entidades médicas, sedes, servicios, ventanillas, y listar todos los usuarios |

**Credenciales de prueba** (creadas por `npm run db:seed`, todas con la misma contraseña):

| Rol | Email | Contraseña |
|---|---|---|
| ADMIN | `admin@filacero.demo` | `FilaCero2026!` |
| FUNCIONARIO | `funcionario@filacero.demo` | `FilaCero2026!` |
| PACIENTE | `paciente@filacero.demo` | `FilaCero2026!` |

## 4. Endpoints clave para las tres pantallas principales

Esta tabla cubre el flujo central del producto. Para el resto de endpoints (crear entidad médica, ventanillas, gestión de usuarios, etc.) revisa Swagger — ahí está el listado completo y siempre actualizado.

| Pantalla | Método y ruta | Requiere token | Body (resumen) |
|---|---|---|---|
| Registro | `POST /auth/register` | No | `numeroDocumento, tipoDocumento, nombres, apellidos, email, password, telefono?` |
| Login | `POST /auth/login` | No | `email, password` |
| Explorar servicios | `GET /servicios` | No | — (query opcional `?entidadId=`) |
| Explorar sedes | `GET /puntos-dispensacion` | No | — (query opcional `?entidadId=`) |
| Pedir un turno | `POST /turnos` | Sí (cualquier rol) | `servicioId, puntoId` |
| Ver mis turnos | `GET /turnos/mis-turnos` | Sí (cualquier rol) | — |
| Ver un turno puntual | `GET /turnos/:id` | Sí (dueño o staff) | — |
| Cancelar mi turno | `PATCH /turnos/:id/cancelar` | Sí (dueño o staff) | — |
| Ver la fila (vista de personal) | `GET /turnos?puntoId=&servicioId=` | Sí (`FUNCIONARIO`/`ADMIN`) | — |
| Llamar/avanzar un turno | `PATCH /turnos/:id/avanzar` | Sí (`FUNCIONARIO`/`ADMIN`) | `ventanillaId` (solo para llamar; vacío para finalizar) |

Todas las respuestas exactas (campos, tipos, códigos de error) están documentadas en vivo en Swagger — esta tabla es solo para orientarte rápido, no la fuente de verdad si hay alguna duda de detalle.

## 5. Si algo no cuadra

- Revisa primero Swagger: es la fuente de verdad, siempre refleja el código actual.
- Si un endpoint no se comporta como esperas, es más rápido probarlo primero en Swagger o Postman (aislado, sin tu código de frontend de por medio) para confirmar si el problema está en la API o en cómo la estás llamando.
- Si de verdad necesitas ver el código del backend, empieza por el controlador del módulo correspondiente en `src/modules/<módulo>/infrastructure/http/` — es la puerta de entrada de cada endpoint y el archivo más corto y legible de cada módulo.
