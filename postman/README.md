# Colección de Postman — FilaCero API

## Importar en Postman (interfaz gráfica)

1. Abre Postman → **Import** → selecciona `FilaCero-API.postman_collection.json`.
2. Con la API corriendo localmente (`npm run start:dev`) y los datos de demo cargados (`npm run db:seed`), abre la carpeta **"1. Auth"** y ejecuta las tres peticiones de login (Admin, Funcionario, Paciente). Cada una guarda su token automáticamente en las variables de la colección — no hay que copiar/pegar nada a mano.
3. Abre **"2. Catálogo (público)"** y ejecuta las tres peticiones de listado: capturan automáticamente `entidadId`, `puntoId` y `servicioId`.
4. Abre **"3. Ventanillas"** y ejecútala: captura `ventanillaId`.
5. A partir de ahí, todas las peticiones de **"4. Turnos — flujo completo"** ya funcionan sin editar nada.

También puedes correr la colección entera con el botón **Run** (Postman Runner) en ese mismo orden — está diseñada para eso.

## Correr por línea de comandos (Newman)

```bash
npm run test:postman
```

Corre las 23 peticiones contra `http://localhost:3000` (requiere la API y la base de datos levantadas, con `npm run db:seed` ya ejecutado) y valida 21 aserciones automáticas. Útil para verificar que nada se rompió antes de una demo, sin abrir Postman.

## Qué incluye la colección

| Carpeta | Qué demuestra |
|---|---|
| 1. Auth | Login de los 3 roles + autorregistro público |
| 2. Catálogo (público) | Explorar entidades médicas, sedes y servicios sin token |
| 3. Ventanillas | Listado restringido a personal de atención/admin |
| 4. Turnos — flujo completo | Solicitar turno → ver mi turno/posición → ver la fila (staff) → llamar → finalizar → intentar cancelar uno ya atendido (regla de negocio) |
| 5. Administración (ADMIN) | Crear entidad médica, sede y servicio |
| 6. Casos negativos | 401 sin token, 403 con rol insuficiente — demuestra los guards de seguridad |

## Nota sobre datos repetidos

Las peticiones de creación en **"5. Administración"** no tienen protección contra duplicados de nombre (a diferencia de "Registrar nuevo paciente", que sí genera datos únicos con variables dinámicas de Postman). Si corres esa carpeta varias veces vas a crear varias "Sanitas EPS" — es inofensivo para el resto del flujo, pero si te interesa una base de datos limpia antes de la demo, bórralas a mano (o pide que se limpien); `npm run db:seed` no las elimina, solo asegura que los tres usuarios y el catálogo base sigan existiendo.
