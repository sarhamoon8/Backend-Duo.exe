# Pruebas de estrés — FilaCero API

Escenarios de [Artillery](https://www.artillery.io/) contra los dos endpoints
más sensibles a concurrencia del backend: `POST /turnos` (calcula la
posición en fila con un `COUNT` sobre la tabla `turno`) y
`POST /lista-espera` (mismo patrón, sobre `lista_espera`).

## Requisitos

1. La API y la base de datos deben estar levantadas y accesibles en
   `http://localhost:3000` (`npm run start:dev`, o `docker compose up`).
2. Debe existir al menos un servicio y un punto de dispensación en la base
   de datos — los escenarios los toman del catálogo público
   (`GET /servicios`, `GET /puntos-dispensacion`), así que basta con haber
   corrido una vez `npm run db:seed`.

## Correr una prueba

```bash
npm run test:stress:turnos
npm run test:stress:lista-espera
```

Cada corrida:
- Sube la carga de 2 a 20 solicitudes/segundo durante 10s (rampa) y
  luego sostiene 20 solicitudes/segundo durante 30s.
- Por cada "usuario virtual": se registra con datos únicos
  (`auth/register`), toma el servicio/punto del catálogo público y
  solicita un turno (o se une a la lista de espera).
- Al final imprime un resumen con latencias (p50/p95/p99), throughput y
  tasa de error por código HTTP. `ensure.maxErrorRate`/`ensure.p95` en el
  YAML hacen que Artillery termine con código de salida distinto de cero
  si se supera el 1% de errores o 1.5s de p95 — útil si esto se engancha
  a CI más adelante.

## Limpieza

Las corridas dejan usuarios de prueba (`numeroDocumento` con prefijo
`STRESS`) y sus turnos/inscripciones/notificaciones asociadas. Para
borrarlos sin tocar los datos de demo del seed ni datos reales:

```bash
npm run stress:limpiar
```

## Por qué estos dos endpoints y no otros

El resto de los endpoints de escritura (`crear` de entidad médica,
servicio, punto, ventanilla, medicamento, inventario) son operaciones
administrativas de baja frecuencia en el mundo real — no tiene sentido de
negocio simular carga alta sobre ellos. `turnos` y `lista-espera` sí: son
los dos puntos donde muchos pacientes pueden escribir al mismo tiempo en
un momento real de uso (hora pico en un punto de dispensación), y ambos
comparten el mismo patrón de cálculo "posición no persistida, se cuenta en
cada lectura" que es, en términos de carga a la base de datos, el más
costoso de todo el backend.
