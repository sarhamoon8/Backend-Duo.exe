# Pruebas de estrés — FilaCero API

Escenarios de [Artillery](https://www.artillery.io/) contra los dos endpoints
más sensibles a concurrencia del backend: `POST /turnos` (calcula la
posición en fila con un `COUNT` sobre la tabla `turno`) y
`POST /lista-espera` (mismo patrón, sobre `lista_espera`).

También hay un plan equivalente en [Apache JMeter](https://jmeter.apache.org/)
por cada escenario de Artillery (`jmeter/turnos-concurrencia.jmx` y
`jmeter/lista-espera-concurrencia.jmx`), con el mismo flujo (registrar
paciente → tomar servicio/punto del catálogo público → solicitar turno o
unirse a la lista de espera), pensados para generar el dashboard HTML que
suele pedirse como evidencia de pruebas de rendimiento. Requiere tener
JMeter instalado y en el `PATH` (`jmeter --version` para confirmar). Corré:

```bash
npm run test:stress:turnos:jmeter
npm run test:stress:lista-espera:jmeter
```

Cada uno deja su reporte en `stress/jmeter/report/index.html` y
`stress/jmeter/report-lista-espera/index.html` (abrilos en el navegador) y
los resultados crudos en los `.jtl` correspondientes. A diferencia de
Artillery (que simula una tasa de llegada abierta, 2→20 req/s), el Thread
Group de JMeter usa un modelo cerrado: 20 hilos con rampa de 10s sosteniendo
la carga 40s en total — el pico de concurrencia es comparable pero no es una
réplica exacta del modelo de carga. También dejan usuarios `STRESS-*`/
`STRESS-LE-*`, así que aplica la misma limpieza de abajo.

**Nota sobre un bug de JMeter 5.6.3 ya evitado en estos planes:** el
`JSONPostProcessor` no soporta extraer dos variables en un solo elemento
usando `match_numbers` separado por `;` (ej. `"1;1"`) — tira
`ArrayIndexOutOfBoundsException` en cada corrida y la petición falla sin
dejar rastro en el `.jtl`. Por eso cada paso que necesita más de una
variable (como `servicioId`/`entidadId` desde `GET /servicios`) usa dos
`JSONPostProcessor` separados, uno por variable. Si editás estos `.jmx` a
mano, mantené ese patrón.

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
