# PROJECT_CONTEXT.md — FilaCero

> **Propósito de este documento:** transferencia de conocimiento para que Claude Code (u otra instancia de Claude trabajando directamente en el repositorio) pueda continuar el desarrollo de FilaCero sin necesidad de releer todo el material fuente. Este documento resume **únicamente** lo que está respaldado por el material del proyecto (documentos académicos, diagramas y notas ya generadas). No agrega requisitos nuevos ni cambia decisiones tomadas.
>
> **Fuentes utilizadas** (todas dentro del Proyecto de Claude "FilaCero - Moon"):
> - `DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf` — documento formal de definición del proyecto (problema, usuarios, valor, alcance, arquitectura inicial, suposiciones y riesgos).
> - `Retroalimentación REA1.pdf` — documento de requisitos funcionales y no funcionales, con priorización.
> - `CONTEXTO EMPRESARIAL Y PENSAMIENTO ARQUITECTÓNICO.pdf` — cuestionario de reflexión del equipo sobre contexto de negocio y pensamiento arquitectónico.
> - `APIs REST VERBOS HTTP Y JSON.pdf` — material de referencia/estudio sobre diseño de APIs REST (no contiene decisiones específicas del proyecto, es material educativo de apoyo).
> - `FilaCero Presentación.pdf` — presentación del proyecto; **no se pudo extraer texto** de este archivo en este análisis (parece ser un PDF basado en imágenes/diapositivas visuales). Si contiene mockups, decisiones o contenido no cubierto aquí, debe revisarse manualmente.
> - `claude/modelo-entidad-relacion.md` — nota sobre el diagrama entidad-relación conceptual (notación Chen) ya generado.
> - `claude/backlog-jira.md` — nota sobre el backlog de Jira ya generado y entregado (CSV con 15 épicas / 60 historias).
> - `FilaCero_Diagrama_ER_2.png` — diagrama conceptual entidad-relación (notación Chen), versión reducida (10 entidades).
> - `USUARIO Service Interaction-2026-09-16-230325.png` — diagrama del **modelo relacional completo** (12 entidades, con tipos de dato, PK/FK/UK). A pesar de su nombre de archivo, su contenido es el modelo de base de datos completo, no un diagrama de interacción de servicios.
>
> **Importante:** este Proyecto de Claude contiene el trabajo de *planeación y diseño* de FilaCero (requisitos, arquitectura conceptual, modelo de datos, backlog). **No contiene el código fuente del repositorio real.** Este documento no puede certificar qué está efectivamente implementado en el repositorio; eso debe verificarse inspeccionando el repositorio directamente (ver sección "ESTADO ACTUAL DEL PROYECTO").

---

## 1. Nombre y descripción del proyecto

**Nombre:** FilaCero: Sistema Web inteligente para la gestión de turnos y seguimiento de la dispensación de medicamentos.

**Descripción:** Sistema web orientado a mejorar la gestión de turnos y el seguimiento de la dispensación de medicamentos en servicios de salud (EPS, hospitales, centros médicos públicos en Colombia). Permite a los usuarios solicitar turnos virtuales, consultar su posición en la fila, recibir notificaciones sobre el avance de la atención, consultar la disponibilidad de sus medicamentos formulados y recibir avisos cuando estén disponibles.

**Contexto académico:** Proyecto integrador de la asignatura *Ingeniería de Software I* (CAD612021521), Ingeniería de Sistemas y Computación, Universidad de Cundinamarca (Fusagasugá), docente Luiferney Ortiz Parra. Equipo: Sarha Luna Gómez Valenzuela y Ashly Mariana Gómez Rivera. Documentos fechados agosto de 2026.

---

## 2. Problema que busca resolver

En la actualidad, los usuarios de EPS y centros médicos deben desplazarse físicamente al punto de atención y permanecer allí largos periodos esperando ser atendidos, sin información clara sobre el estado de su turno ni el tiempo aproximado de espera. Adicionalmente, no cuentan con información confiable sobre la disponibilidad de sus medicamentos formulados, lo que genera desplazamientos innecesarios cuando estos no están disponibles.

FilaCero traslada este proceso a un entorno digital: el usuario solicita su turno de forma virtual desde su teléfono, consulta cómo va la fila y recibe un aviso cuando le corresponda ser atendido, reduciendo así la necesidad de permanecer físicamente en una fila durante todo el proceso.

*(Fuente: `DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`, sección "Problema a resolver")*

---

## 3. Contexto del proyecto

El problema ocurre en el sector salud colombiano, específicamente en los procesos de entrega de medicamentos en EPS y centros médicos. Estos procesos involucran una gran cantidad de personas que reclaman medicamentos regularmente, generando momentos de alta demanda. La gestión de turnos depende hoy de mecanismos presenciales, lo que produce filas extensas, tiempos de espera prolongados y dificultades para organizar la atención de manera eficiente, con un impacto especialmente alto en adultos mayores.

Este problema es relevante porque la entrega de medicamentos es un proceso recurrente en el día a día de muchas personas; los tiempos de espera y desplazamientos representan una carga significativa. Organizar mejor los turnos reduce el tiempo de espera, evita aglomeraciones y da al usuario información real sobre su proceso. El seguimiento del inventario de medicamentos agrega valor porque permite avisar al usuario cuando un medicamento agotado vuelve a estar disponible.

*(Fuente: `DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`, secciones "¿En qué contexto ocurre el problema?" y "¿Por qué este problema es relevante?"; `CONTEXTO EMPRESARIAL Y PENSAMIENTO ARQUITECTÓNICO.pdf`)*

---

## 4. Objetivo general

**Objetivo general del proyecto** (a nivel de producto, según la introducción del documento de definición del proyecto): trasladar el proceso de atención en la dispensación de medicamentos a un entorno digital, permitiendo a los usuarios solicitar turnos virtuales, monitorear el avance de la fila en tiempo real y recibir notificaciones automatizadas sobre el estado e inventario de sus medicamentos habituales.

**Objetivo general documentado para la fase de requisitos** (según `Retroalimentación REA1.pdf`): Definir y estructurar los requerimientos funcionales y no funcionales del sistema FilaCero, estableciendo de manera clara sus funcionalidades, condiciones de calidad y prioridades necesarias para desarrollar una solución que permita optimizar la gestión de citas, turnos, filas y medicamentos en distintas instituciones de salud.

---

## 5. Objetivos específicos

(Documentados explícitamente en `Retroalimentación REA1.pdf`, como objetivos del ejercicio de definición de requisitos; funcionan también como los objetivos específicos vigentes del proyecto en esta etapa, ya que no existe otra lista alternativa en el material disponible):

1. Identificar las principales necesidades de los usuarios de EPS y servicios públicos que pueden ser atendidas mediante FilaCero.
2. Definir los requerimientos funcionales relacionados con la gestión de citas, turnos, filas, medicamentos, notificaciones, resultados de exámenes y demás funcionalidades consideradas para el sistema.
3. Establecer los requerimientos no funcionales relacionados con seguridad, rendimiento, disponibilidad, escalabilidad, usabilidad y accesibilidad.
4. Determinar criterios de validación que permitan comprobar objetivamente el cumplimiento de los requerimientos no funcionales durante las etapas de pruebas y evaluación.
5. Priorizar los requerimientos de acuerdo con su impacto en los usuarios, su importancia para el funcionamiento de FilaCero, su urgencia y sus dependencias técnicas.

---

## 6. Usuarios del sistema

Tres roles están explícitamente definidos (`DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`, sección "Usuarios del Sistema"):

### Usuario Final
Persona que requiere reclamar o gestionar la dispensación de medicamentos (afiliado/beneficiario de una EPS o entidad de salud). Puede: consultar servicios disponibles, solicitar un turno, consultar su posición en la fila y el tiempo estimado de espera. Como funcionalidades complementarias: consultar el registro de medicamentos asociados a su perfil, revisar entregas anteriores y configurar recordatorios.

### Usuario Administrativo
Relacionado con la gestión del servicio de dispensación. Puede administrar turnos, actualizar su estado, gestionar los servicios disponibles y consultar información sobre el comportamiento de la atención. Puede acceder a estadísticas (cantidad de usuarios atendidos, tiempos promedio de espera, periodos de mayor flujo).

### Personal Encargado de la Atención
Usuario correspondiente al personal de dispensación. Puede visualizar los turnos pendientes, llamar al siguiente usuario y actualizar el estado de cada atención.

> Nota: el modelo relacional (`USUARIO Service Interaction...png`) implementa la diferenciación de roles mediante una tabla `ROL` genérica asociada a `USUARIO` (relación `clasifica`, 1:N), en lugar de tres tablas de usuario separadas. Esto es coherente con lo descrito arriba: "la diferenciación en estos tipos de usuarios permitirá establecer diferentes responsabilidades y niveles de acceso dentro del sistema."

La granularidad exacta de permisos por rol (qué endpoint/pantalla puede tocar cada rol) **no está definida a nivel de detalle técnico** — PENDIENTE DE DEFINIR.

---

## 7. Funcionalidades principales

Corresponden a los 10 requisitos funcionales de prioridad Alta/Media definidos formalmente (ver sección 9) más las funciones de personal de atención y administración descritas en el backlog ya generado (`claude/backlog-jira.md`):

- Registro, inicio de sesión y autenticación de usuarios (RF-01).
- Solicitud de turnos virtuales para las distintas áreas/servicios de la institución (RF-02).
- Consulta de citas propias y registro en lista de espera (RF-03).
- Reasignación automática de citas liberadas por cancelación/inasistencia, notificando a usuarios en espera (RF-04).
- Notificaciones sobre citas, turnos, cancelaciones, aplazamientos y disponibilidad de medicamentos (RF-05).
- Consulta de medicamentos formulados y su disponibilidad para reclamo (RF-06).
- Reserva temporal de medicamentos disponibles (RF-07).
- Historial de medicamentos y recordatorios de toma / vencimiento de fórmulas (RF-08).
- Consulta y descarga de resultados de exámenes de laboratorio o imágenes diagnósticas (RF-09).
- Consulta de información básica de salud / perfil de salud (RF-10).
- Gestión de atención y ventanillas por parte del personal de atención (visualizar turnos pendientes, llamar al siguiente usuario, actualizar estado de atención) — épica EPIC-11 del backlog.
- Administración de servicios, puntos de dispensación y estadísticas por parte del usuario administrativo — épica EPIC-12 del backlog.

---

## 8. Funcionalidades adicionales (complementarias / no esenciales para la primera versión)

Explícitamente catalogadas como prioridad Baja o como "complementarias" en `Retroalimentación REA1.pdf`:

- Estadísticas avanzadas de satisfacción del servicio.
- Personalizaciones adicionales de accesibilidad (pueden implementarse progresivamente).
- Funciones complementarias que dependan de integraciones externas.
- Registro de medicamentos habituales y configuración de recordatorios asociados al perfil del usuario (mencionado como funcionalidad "complementaria" en la definición del problema).
- Módulos futuros mencionados como posible evolución de la arquitectura (no comprometidos para la primera versión): **pre-triaje**, **teleorientación** y **encuestas de satisfacción** — el documento fuente indica que "la arquitectura del sistema contempla la escalabilidad necesaria" para integrarlos en iteraciones futuras sin comprometer las operaciones fundamentales *(nota: el texto original en el PDF dice literalmente "en interacciones frutas", que es evidentemente un error de tipeo/OCR por "en iteraciones futuras")*.
- Un asistente virtual como herramienta de **orientación inicial únicamente** — explícitamente limitado, ver sección 18 (Restricciones).

---

## 9. Requisitos funcionales

Tabla oficial de requisitos funcionales (`Retroalimentación REA1.pdf`, Tabla 1):

| Código | Requerimiento | Descripción | Tipo de usuario | Prioridad (Tabla 1) |
|---|---|---|---|---|
| RF-01 | Registro y autenticación *(la Tabla 1 lo llama "Requisito y autenticación", probable error de tipeo del documento original)* | Debe permitir al usuario registrarse, iniciar sesión y autenticarse. | Usuario Final | Alta |
| RF-02 | Gestión de turnos | Debe permitir al usuario solicitar un turno para las diferentes áreas disponibles de la institución médica. | Usuario Final | Alta |
| RF-03 | Gestión de citas y lista de espera | Debe permitir al usuario consultar sus citas y registrarse en una lista de espera para recibir notificaciones cuando se liberen espacios por cancelaciones o inasistencias. | Usuario Final | Alta |
| RF-04 | Reasignación automática de citas | Debe identificar las citas que queden disponibles por cancelación y notificar a los usuarios para ofrecerles la posibilidad de ocuparlas. | Usuario Final / Administrativo | Alta |
| RF-05 | Notificaciones | Debe enviar notificaciones al usuario sobre próximas citas, avance de turnos, cancelaciones, aplazamientos, disponibilidad de medicamentos y nuevas oportunidades de citas. | Usuario Final | Alta |
| RF-06 | Gestión de medicamentos (consulta de disponibilidad) | Debe permitir al usuario consultar los medicamentos que tiene formulados y verificar si se encuentran disponibles para ser reclamados. | Usuario Final | Alta |
| RF-07 | Reserva de medicamentos | Debe permitir al usuario reservar temporalmente un medicamento disponible durante un periodo establecido de entre **24 y 48 horas** antes de que el stock sea liberado nuevamente. | Usuario Final | Alta *(ver nota de inconsistencia abajo)* |
| RF-08 | Historial y recordatorios de medicamentos | Debe permitir al usuario consultar su historial de medicamentos y configurar recordatorios para la toma de estos, además de recibir alertas sobre fórmulas médicas próximas a vencer. | Usuario Final | Media |
| RF-09 | Consulta de información clínica | Debe permitir al usuario consultar y descargar resultados de exámenes de laboratorio o imágenes diagnósticas disponibles en el sistema médico. | Usuario Final | Media |
| RF-10 | Perfil de salud | Debe permitir al usuario consultar información básica de salud. | Usuario Final | Media |

**⚠️ Inconsistencia detectada en el documento fuente (`Retroalimentación REA1.pdf`):** la Tabla 1 (Requerimientos Funcionales) asigna a **RF-07 prioridad "Alta"**, pero la Tabla 3 ("Priorización inicial", más adelante en el mismo documento) agrupa a **RF-07 junto con RF-08, RF-09 y RF-10 bajo prioridad "Media"**. No es una contradicción entre conversaciones distintas sino una inconsistencia interna del propio PDF fuente. **PENDIENTE DE CONFIRMAR con el usuario** cuál es la prioridad real de RF-07. Hasta que se aclare, se recomienda tratar RF-07 como Media (agrupado explícitamente en la tabla de priorización dedicada), pero sin descartar que la intención original fuera Alta.

---

## 10. Requisitos no funcionales

Documentados en `Retroalimentación REA1.pdf`, Tabla 2. El texto introductorio anuncia 5 categorías (seguridad, rendimiento, disponibilidad, escalabilidad, usabilidad), pero **solo 4 categorías tienen descripción y criterio de validación desarrollados** en la tabla extraída; Escalabilidad y Usabilidad se mencionan por nombre en la introducción y en las conclusiones, pero no tienen fila propia con requisito/criterio medible en el material disponible.

| Categoría | Descripción del requerimiento | Criterio de validación |
|---|---|---|
| Seguridad | El sistema debe almacenar las contraseñas de los usuarios utilizando mecanismos de cifrado o hash seguro y no almacenarlas en texto plano. | Al revisar la base de datos, ninguna contraseña debe encontrarse almacenada en texto plano. |
| Seguridad | El sistema debe restringir el acceso a la información de acuerdo con el tipo de usuario. | Un usuario no debe poder acceder a funcionalidades administrativas o información perteneciente a otros usuarios. |
| Privacidad | El sistema debe proteger la información personal y relacionada con los medicamentos de los usuarios, permitiendo su acceso únicamente a usuarios autorizados. | Las pruebas de acceso deben demostrar que un usuario no puede consultar información privada perteneciente a otra cuenta. |
| Rendimiento | El sistema debe responder a las consultas y operaciones principales en un tiempo máximo de **3 segundos** bajo condiciones normales de funcionamiento. | Las operaciones principales deberían registrar tiempos de respuesta iguales o inferiores a 3 segundos durante las pruebas establecidas. |
| Disponibilidad | El sistema debe mantener una disponibilidad mínima del **99%** dentro de un margen establecido de hora de atención, exceptuando el servicio de los turnos. | Se verificará mediante el registro de disponibilidad del sistema durante el periodo evaluado. |
| Escalabilidad | **PENDIENTE DE DEFINIR** (mencionada como categoría cubierta, sin requisito ni criterio de validación explícito en el documento fuente). | PENDIENTE DE DEFINIR |
| Usabilidad | **PENDIENTE DE DEFINIR** (mencionada como categoría cubierta, sin requisito ni criterio de validación explícito en el documento fuente). | PENDIENTE DE DEFINIR |

---

## 11. Reglas de negocio

Extraídas de los requisitos y del alcance documentado:

- Un medicamento reservado se mantiene apartado para el usuario durante un periodo de **24 a 48 horas**, tras el cual el stock se libera nuevamente (RF-07).
- Cuando una cita/turno se libera por cancelación o inasistencia, el sistema debe identificarla y ofrecerla automáticamente a los usuarios en lista de espera mediante notificación (RF-04).
- Un usuario no puede acceder a funcionalidades administrativas ni a información perteneciente a otros usuarios (control de acceso por rol).
- Las contraseñas nunca se almacenan en texto plano; deben usar cifrado/hash seguro.
- El sistema **no** realiza diagnósticos médicos definitivos ni sustituye la valoración de un profesional de la salud.
- El sistema **no** formula, modifica ni suspende medicamentos: estas decisiones son exclusivas de profesionales autorizados.
- El sistema funciona como herramienta **complementaria/de apoyo**, no como reemplazo de los procesos internos de las EPS o centros médicos.
- El personal de atención puede llamar al siguiente turno y actualizar el estado de cada atención desde su ventanilla asignada.

---

## 12. Flujo general del sistema

Reconstruido a partir de los requisitos funcionales, la visión de arquitectura y el modelo de datos (no es una decisión documentada como diagrama de flujo explícito, sino la secuencia lógica que se desprende de los RF y las entidades definidas):

1. El usuario final se registra e inicia sesión (RF-01).
2. Consulta los servicios de dispensación disponibles en un punto de atención.
3. Solicita un turno virtual para un servicio específico; el sistema genera un turno con código alfanumérico y lo asocia a un punto de dispensación, servicio y (eventualmente) ventanilla (RF-02).
4. El usuario consulta el estado y posición aproximada de su turno, y puede registrarse en lista de espera para otra cita (RF-03).
5. Si una cita se libera por cancelación/inasistencia, el sistema reasigna automáticamente y notifica a los usuarios en espera (RF-04).
6. El sistema envía notificaciones sobre el avance del turno, cambios de cita y disponibilidad de medicamentos (RF-05).
7. En paralelo, el usuario puede consultar si sus medicamentos formulados están disponibles en el inventario del punto de dispensación (RF-06) y reservarlos temporalmente (RF-07).
8. El personal de atención, desde su ventanilla, visualiza los turnos pendientes, llama al siguiente usuario y actualiza el estado de la atención.
9. Al completarse la atención, se registra la entrega/dispensación de medicamentos asociada al turno (entidad `ENTREGA_DISPENSACION` con su detalle en `DETALLE_ENTREGA` — ver sección 15).
10. El usuario administrativo gestiona los servicios y puntos de dispensación, y consulta estadísticas de atención (tiempos promedio, volumen de usuarios).

El detalle exacto de estados de un turno, transiciones válidas, y el algoritmo concreto de reasignación automática **no están especificados a nivel de reglas de máquina de estados** — PENDIENTE DE DEFINIR.

---

## 13. Arquitectura definida

Según `DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`, sección "Visión de la arquitectura inicial" (visión preliminar, no un documento de arquitectura detallado):

**Frontend** — responsable de:
- Registro e inicio de sesión de usuarios.
- Mostrar los servicios disponibles.
- Permitir la solicitud de turnos.
- Mostrar el estado y posición del turno.
- Presentar información relacionada con los medicamentos registrados.
- Mostrar notificaciones y recordatorios.
- Permitir al personal encargado consultar y gestionar los turnos.
- Mostrar información y estadísticas según el tipo de usuario.

**Backend** — responsable de:
- Gestión inteligente de citas y turnos.
- Gestión de notificaciones y recordatorios de medicamentos y fórmulas.
- Gestión de autenticación y autorización de usuarios y terceros.
- Control de acceso a información médica.
- Comunicación/integración con las bases de datos o sistemas de la institución médica.
- Exposición de las APIs necesarias para que el frontend consulte y modifique la información correspondiente (implica **arquitectura cliente-servidor con comunicación vía API**, coherente con el material de estudio de APIs REST recopilado por el equipo).
- Gestión de medicamentos, su disponibilidad y actualización constante.
- Gestión de información médica.
- Seguridad y validaciones.

**Base de datos** — se contempla usar una **base de datos relacional**, dado que el sistema maneja entidades con relaciones entre sí (usuarios, roles/permisos, entidades/puntos de dispensación, funcionarios, servicios, turnos, estados de turno, medicamentos, disponibilidad de medicamentos, registro de entregas).

No se definen en el material disponible: motor de base de datos específico, framework de frontend/backend, patrón arquitectónico detallado (monolito vs. microservicios), estrategia de despliegue/infraestructura, ni mecanismo concreto de autenticación (JWT, sesiones, OAuth, etc.) — todo esto queda **PENDIENTE DE DEFINIR**.

---

## 14. Tecnologías y herramientas

- **Confirmado:** base de datos relacional (motor no especificado).
- **Confirmado (por diseño, no por nombre de tecnología):** comunicación frontend-backend mediante una API, con intercambio de datos en formato JSON — el equipo recopiló y estudió deliberadamente material sobre APIs REST, verbos HTTP (GET/POST/PUT/PATCH/DELETE) y JSON (`APIs REST VERBOS HTTP Y JSON.pdf`) como base para el diseño de esa API.
- **Metodología de trabajo:** el equipo expresa la intención de trabajar con **metodologías ágiles (Scrum)** y **enfoque DevOps** para organizar el desarrollo en iteraciones pequeñas con seguimiento constante e integrar mejor desarrollo y operación (pruebas, integración, entrega) — expresado como expectativa de aprendizaje, no como una decisión de herramientas específicas (no se menciona Jira, GitHub Actions, etc. como decisión, aunque el backlog ya se generó en formato importable a Jira).
- **PENDIENTE DE DEFINIR:** lenguaje(s) de programación, framework de frontend, framework de backend, motor de base de datos concreto (PostgreSQL, MySQL, SQL Server, etc.), proveedor de hosting/infraestructura, mecanismo de autenticación, herramienta de CI/CD, sistema de notificaciones (email/SMS/push).

---

## 15. Modelo y estructura de la base de datos

Existen **dos versiones** del modelo entidad-relación en el material del proyecto, y es importante no confundirlas:

### 15.1 Modelo relacional completo (fuente técnica primaria — 12 entidades)

Documentado en el diagrama `USUARIO Service Interaction-2026-09-16-230325.png` (a pesar de su nombre, es el modelo relacional completo del proyecto, con tipos de dato y claves). Incluye 12 entidades:

| Entidad | Campos (tipo — nombre — clave) |
|---|---|
| **ROL** | int id_rol (PK) · string nombre_rol · string descripcion |
| **USUARIO** | bigint id_usuario (PK) · int id_rol (FK→ROL) · string numero_documento (UK) · string tipo_documento · string nombres · string apellidos · string correo_electronico (UK) · string contrasena_hash · string telefono · datetime fecha_registro |
| **PUNTO_DISPENSACION** | int id_punto (PK) · string nombre_sede · string direccion · string ciudad · string telefono_contacto · int capacidad_atencion |
| **VENTANILLA** | int id_ventanilla (PK) · int id_punto (FK→PUNTO_DISPENSACION) · string numero_modulo · enum estado_operativo |
| **SERVICIO** | int id_servicio (PK) · string codigo_servicio (UK) · string nombre_servicio · int tiempo_promedio_min · boolean activo |
| **TURNO** | bigint id_turno (PK) · bigint id_usuario (FK→USUARIO) · int id_punto (FK→PUNTO_DISPENSACION) · int id_servicio (FK→SERVICIO) · int id_ventanilla (FK→VENTANILLA) · string codigo_alfanumerico · datetime fecha_emision · datetime hora_llamado · datetime hora_finalizacion · enum estado_turno · boolean prioridad |
| **NOTIFICACION** | bigint id_notificacion (PK) · bigint id_usuario (FK→USUARIO) · enum tipo_notificacion · string titulo · text mensaje · datetime fecha_envio · boolean leida |
| **MEDICAMENTO** | int id_medicamento (PK) · string codigo_nacional (UK) · string nombre_generico · string concentracion · string presentacion · string laboratorio_fabricante · boolean requiere_autorizacion |
| **RESERVA** | bigint id_reserva (PK) · bigint id_usuario (FK→USUARIO) · int id_punto (FK→PUNTO_DISPENSACION) · int id_medicamento (FK→MEDICAMENTO) · int cantidad_reservada · datetime fecha_solicitud · datetime fecha_expiracion · enum estado_reserva |
| **INVENTARIO** | bigint id_inventario (PK) · int id_punto (FK→PUNTO_DISPENSACION) · int id_medicamento (FK→MEDICAMENTO) · string lote · int stock_actual · int stock_reservado · date fecha_vencimiento |
| **ENTREGA_DISPENSACION** | bigint id_entrega (PK) · bigint id_turno (FK→TURNO, relación 1:1 "origina") · bigint id_funcionario (FK→USUARIO, relación "dispensado_por") · string numero_formula · datetime fecha_entrega · string observaciones |
| **DETALLE_ENTREGA** | bigint id_detalle (PK) · bigint id_entrega (FK→ENTREGA_DISPENSACION) · int id_medicamento (FK→MEDICAMENTO) · int cantidad_despachada · string dosis_indicada |

### 15.2 Modelo conceptual simplificado (decisión más reciente sobre el alcance del diagrama — 10 entidades)

Documentado en `claude/modelo-entidad-relacion.md` y renderizado en `FilaCero_Diagrama_ER_2.png` (notación de Chen). Esta es cronológicamente la **decisión más reciente registrada** sobre el alcance del diagrama entidad-relación: se excluyeron **deliberadamente** `ENTREGA_DISPENSACION` y `DETALLE_ENTREGA` del diagrama conceptual, dejando 10 entidades y 12 relaciones (todas 1:N):

- Acceso e identidad: ROL, USUARIO
- Red de atención: PUNTO_DISPENSACION, VENTANILLA, SERVICIO
- Gestión de turnos: TURNO
- Notificaciones: NOTIFICACION
- Medicamentos e inventario: MEDICAMENTO, RESERVA, INVENTARIO

Artifact publicado: https://claude.ai/artifact/GaeFbfTgX6Lms5tMMchT6T

**⚠️ Punto que requiere consulta con el usuario:** no está claro si la exclusión de `ENTREGA_DISPENSACION` y `DETALLE_ENTREGA` del diagrama conceptual significa que **estas dos entidades quedan fuera del alcance de implementación actual** (por ejemplo, porque el registro formal de entrega/dispensación se dejó para una fase posterior), o si fue simplemente una simplificación visual del diagrama conceptual manteniendo ambas tablas en el modelo relacional real. El modelo relacional completo (sección 15.1) sí las incluye con todos sus campos y relaciones (`origina` 1:1 con TURNO, `dispensado_por` con USUARIO, `incluye` con DETALLE_ENTREGA, `prescrito_en` con MEDICAMENTO). **No modificar esta decisión de alcance sin confirmar con el usuario.**

---

## 16. Entidades y relaciones importantes

Relaciones del modelo relacional completo (inferidas de las claves foráneas del diagrama, sección 15.1):

| Relación | Cardinalidad | Entidad origen | Entidad destino |
|---|---|---|---|
| clasifica | 1:N | ROL | USUARIO |
| recibe | 1:N | USUARIO | NOTIFICACION |
| solicita | 1:N | USUARIO | TURNO |
| tipifica | 1:N | SERVICIO | TURNO |
| atiende | 1:N | VENTANILLA | TURNO |
| expide | 1:N | PUNTO_DISPENSACION | TURNO |
| posee | 1:N | PUNTO_DISPENSACION | VENTANILLA |
| realiza | 1:N | USUARIO | RESERVA |
| aloja | 1:N | PUNTO_DISPENSACION | RESERVA |
| es_apartado | 1:N | MEDICAMENTO | RESERVA |
| registrado_en | 1:N | PUNTO_DISPENSACION | INVENTARIO |
| contiene | 1:N | MEDICAMENTO | INVENTARIO |
| origina | **1:1** | TURNO | ENTREGA_DISPENSACION |
| dispensado_por | 1:N | USUARIO (funcionario) | ENTREGA_DISPENSACION |
| incluye | 1:N | ENTREGA_DISPENSACION | DETALLE_ENTREGA |
| prescrito_en | 1:N | MEDICAMENTO | DETALLE_ENTREGA |

La entidad `USUARIO` cumple un doble papel según el rol asociado: puede ser el solicitante de un turno/reserva, o el funcionario que dispensa una entrega (`id_funcionario` en `ENTREGA_DISPENSACION` referencia también a `USUARIO`).

---

## 17. Decisiones de diseño ya tomadas

- Diferenciación de tres tipos de usuario (Usuario Final, Usuario Administrativo, Personal Encargado de la Atención) con distintos niveles de acceso, implementada mediante una tabla `ROL` genérica.
- Arquitectura cliente-servidor con frontend y backend separados, comunicados mediante una API (implícitamente REST/JSON, dado el material de estudio recopilado).
- Base de datos **relacional** (no NoSQL).
- Ventana de reserva de medicamentos de **24 a 48 horas**.
- Umbral de rendimiento: respuesta ≤ **3 segundos** en operaciones principales.
- Umbral de disponibilidad: **99%** mínimo (excepto el servicio de turnos).
- Contraseñas siempre cifradas/hasheadas, nunca en texto plano.
- El sistema es una herramienta **complementaria**, no reemplaza los sistemas internos de las EPS/centros médicos.
- Un eventual asistente virtual se limita a **orientación inicial**, sin diagnósticos ni gestión de fórmulas.
- Modelo de datos con 12 entidades en su forma completa (sección 15.1); alcance del diagrama conceptual reducido deliberadamente a 10 entidades (sección 15.2, decisión más reciente registrada, pendiente de confirmar su alcance real de implementación).
- Backlog ya estructurado en 15 épicas (ver sección 21) como forma de organizar el desarrollo.

---

## 18. Restricciones del proyecto

Basadas en los "Riesgos iniciales identificados" y "Suposiciones realizadas" (`DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`):

**Suposiciones asumidas:**
- Los usuarios tendrán acceso a un dispositivo con conexión a internet.
- Las entidades de salud podrán proporcionar información sobre sus servicios y disponibilidad de medicamentos.
- El proceso de asignación y atención de turnos puede representarse mediante reglas gestionables por el sistema.
- La disponibilidad de medicamentos se actualizará periódicamente por personal autorizado.
- El sistema funcionará inicialmente como herramienta complementaria, no como reemplazo de sistemas institucionales existentes.

**Riesgos/restricciones identificados:**
- Integración con sistemas existentes de EPS y centros médicos, que pueden usar tecnologías, estructuras de datos o mecanismos de acceso distintos.
- Seguridad y privacidad de la información, dado que se manejan datos de salud, medicamentos, diagnósticos, alergias y resultados de exámenes.
- Disponibilidad y actualización de la información depende de cómo el centro médico haga seguimiento y registro de medicamentos (factor externo al sistema).
- El reagendamiento automático de citas requiere reglas claras para evitar asignaciones incorrectas.
- El alcance amplio de funcionalidades es en sí mismo un riesgo: es necesario priorizar y desarrollar cada módulo evitando complejidad excesiva desde la primera versión.

**Restricción explícita de alcance funcional:** el sistema no realiza diagnósticos médicos, no formula/modifica/suspende medicamentos, y no reemplaza completamente los procesos internos de las EPS (ver sección 8 y 19).

**No se identifican en el material disponible** restricciones de presupuesto, cronograma específico más allá del calendario académico, ni marco regulatorio colombiano nombrado explícitamente (p. ej. normativa de protección de datos) — PENDIENTE DE DEFINIR si se requiere cumplimiento regulatorio formal.

---

## 19. Alcance actual

**Qué SÍ hará el sistema en su primera versión** (`DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`):

- Registrar y gestionar usuarios.
- Permitir el acceso de los usuarios al sistema.
- Consultar los servicios de dispensación disponibles.
- Solicitar turnos de manera virtual.
- Consultar el estado y posición aproximada del turno.
- Gestionar los turnos desde el personal encargado de la atención.
- Actualizar el estado de los turnos.
- Registrar las atenciones realizadas.
- Administrar información básica relacionada con la disponibilidad de medicamentos.
- Generar información histórica y estadísticas básicas sobre la atención.
- Permitir al usuario registrar medicamentos de uso habitual y configurar recordatorios (descrito como parte de "una primera evaluación").
- Generar notificaciones relacionadas con cambios en la disponibilidad de medicamentos registrados por el usuario.

**Qué NO hará el sistema:**

- No realizará diagnósticos médicos definitivos ni sustituirá la valoración de un profesional de la salud (aplica también a un eventual asistente virtual, limitado a orientación inicial).
- No formulará, modificará ni suspenderá medicamentos.
- No reemplazará completamente los procesos internos de las EPS o centros médicos; su propósito es ser una plataforma de apoyo.

---

## 20. Elementos que NO deben modificarse sin consultar

- Los 10 códigos de requisitos funcionales (RF-01 a RF-10) y su redacción/alcance tal como están documentados en `Retroalimentación REA1.pdf`.
- Los umbrales de los requisitos no funcionales ya cuantificados: 3 segundos de tiempo de respuesta, 99% de disponibilidad, cifrado obligatorio de contraseñas.
- La ventana de reserva de medicamentos de 24–48 horas.
- La definición y límites de los tres roles de usuario (Usuario Final, Usuario Administrativo, Personal Encargado de la Atención).
- Los límites explícitos de "Qué NO hará el sistema" (sin diagnósticos, sin formulación/modificación de medicamentos, sin reemplazar procesos internos de EPS).
- El alcance de las 12 entidades del modelo relacional completo y sus claves primarias/foráneas (sección 15.1), a menos que se confirme explícitamente un cambio de modelo.
- La decisión de exclusión de `ENTREGA_DISPENSACION`/`DETALLE_ENTREGA` del diagrama conceptual — **requiere confirmación explícita** sobre si también aplica a la implementación real, antes de decidir si se implementan o no en esta fase.
- La priorización general de RF-01 a RF-06 como Alta prioridad (núcleo funcional).

---

## 21. Trabajo que ya se ha realizado

Dentro de este Proyecto de Claude (fase de planeación/diseño):

1. Cuestionario de contexto empresarial y pensamiento arquitectónico respondido por el equipo (`CONTEXTO EMPRESARIAL Y PENSAMIENTO ARQUITECTÓNICO.pdf`).
2. Documento formal de definición del proyecto integrador: problema, usuarios, valor de la solución, alcance inicial, visión de arquitectura, suposiciones y riesgos (`DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`).
3. Definición y priorización de 10 requisitos funcionales y requisitos no funcionales (parcialmente completos), con criterios de validación (`Retroalimentación REA1.pdf`).
4. Modelo relacional completo de base de datos diseñado, con 12 entidades, tipos de dato y claves primarias/foráneas.
5. Modelo entidad-relación conceptual (notación de Chen) derivado y simplificado a 10 entidades / 12 relaciones, publicado como artifact y documentado en `claude/modelo-entidad-relacion.md`.
6. Backlog de Jira generado: 15 épicas y 60 historias de usuario (75 filas), entregado como archivo `FilaCero_Backlog_Jira.csv` listo para importar a Jira, con trazabilidad a los RF/NFR de origen (documentado en `claude/backlog-jira.md`). *Nota: el CSV completo con las 60 historias no está almacenado dentro de este Proyecto — solo la tabla de épicas y las notas de importación; el CSV fue entregado directamente al usuario en su momento.*
7. Recopilación de material de estudio sobre diseño de APIs REST, verbos HTTP y JSON, como base de referencia para el diseño de la API backend-frontend.
8. Una presentación del proyecto existe (`FilaCero Presentación.pdf`) pero su contenido no pudo analizarse en este documento (sin texto extraíble).

**No hay evidencia dentro de este Proyecto de Claude de código fuente, migraciones de base de datos, ni artefactos de implementación real** — ver sección "ESTADO ACTUAL DEL PROYECTO".

---

## 22. Trabajo pendiente

- Confirmar con el usuario la prioridad real de RF-07 (inconsistencia Alta vs. Media, sección 9).
- Completar los requisitos no funcionales de Escalabilidad y Usabilidad (solo están nombrados, sin descripción ni criterio de validación).
- Confirmar si `ENTREGA_DISPENSACION` y `DETALLE_ENTREGA` están dentro del alcance de implementación actual o se difieren a una fase posterior.
- Definir el motor de base de datos concreto, lenguajes/frameworks de frontend y backend, mecanismo de autenticación, y estrategia de despliegue/infraestructura (todo PENDIENTE DE DEFINIR).
- Definir el algoritmo/reglas exactas de reasignación automática de citas (RF-04) y la máquina de estados del `estado_turno`.
- Definir los canales de notificación concretos (email, SMS, push, in-app).
- Definir la granularidad de permisos por rol a nivel de endpoints/pantallas.
- Determinar si existe un marco regulatorio de protección de datos de salud que deba cumplirse formalmente (no mencionado explícitamente en el material disponible).
- Revisar `FilaCero Presentación.pdf` manualmente (posibles mockups o decisiones visuales no capturadas en este análisis por ser un PDF de imágenes).
- Iniciar la implementación real (backend, frontend, base de datos) — no hay evidencia de que esto exista aún dentro de este Proyecto.

---

## 23. Próximos pasos recomendados

1. **Inspeccionar el repositorio real** (código, migraciones, configuración, historial de git) para determinar qué de lo aquí documentado ya está implementado, parcialmente implementado o no iniciado, y contrastarlo con este documento.
2. Resolver con el usuario la inconsistencia de prioridad de RF-07 y el alcance de `ENTREGA_DISPENSACION`/`DETALLE_ENTREGA` antes de fijar el modelo de datos definitivo a migrar.
3. Definir y documentar el stack tecnológico concreto (lenguaje/framework de backend y frontend, motor de base de datos, autenticación) si aún no está fijado en el repositorio.
4. Diseñar y crear las migraciones de base de datos a partir del modelo relacional ya definido (sección 15), respetando las claves y relaciones documentadas.
5. Definir el contrato de la API REST (endpoints por recurso: usuarios, turnos, servicios, medicamentos, reservas, notificaciones) siguiendo las convenciones ya estudiadas por el equipo (sustantivos en URLs, verbos HTTP correctos, respuestas en JSON).
6. Implementar primero el núcleo de prioridad Alta: autenticación (RF-01) → gestión de turnos (RF-02) → citas y lista de espera (RF-03) → reasignación automática (RF-04) → notificaciones (RF-05) → disponibilidad de medicamentos (RF-06).
7. Continuar con RF-07 a RF-10 (prioridad Media, sujeta a confirmación de RF-07) y con las funcionalidades de personal de atención y administración (EPIC-11, EPIC-12).
8. Completar los requisitos no funcionales de Escalabilidad y Usabilidad con el usuario antes de cerrarlos como criterios de aceptación de pruebas.
9. Mantener este documento actualizado a medida que se tomen nuevas decisiones técnicas, para que siga sirviendo como fuente de verdad de contexto.

---

## 24. Otra información relevante para continuar el desarrollo

- El proyecto es un trabajo académico integrador (Ingeniería de Software I, Universidad de Cundinamarca), lo que puede implicar entregas parciales, fechas de evaluación y un enfoque pedagógico en metodologías ágiles (Scrum) y DevOps que el equipo expresó interés en aplicar, sin que existan aún decisiones concretas de herramientas para ello.
- El documento de requisitos no funcionales indica una nota general: la tabla "especifica los atributos de calidad y las restricciones técnicas del sistema (abarcando áreas como seguridad, rendimiento, escalabilidad y accesibilidad)", lo que sugiere que el equipo consideraba la accesibilidad como parte de la usabilidad, aunque tampoco se desarrolla con un criterio de validación propio.
- Existen dos artefactos gráficos del modelo de datos que deben interpretarse en conjunto (ver sección 15): el modelo relacional completo (12 entidades) es la fuente técnica más detallada; el diagrama conceptual (10 entidades) refleja la decisión más reciente sobre qué mostrar en el diagrama simplificado, pero no necesariamente redefine el modelo relacional real.
- El backlog de Jira ya entregado (15 épicas / 60 historias) puede usarse como estructura de sprints/tablero, pero su detalle completo (historias individuales) no reside en este Proyecto — si se necesita regenerar, `claude/backlog-jira.md` indica que puede reconstruirse a partir de la tabla de épicas y de los documentos fuente (`Retroalimentación REA1.pdf` y `DEFINICIÓN DEL PROYECTO INTEGRADOR.pdf`).

---

## ESTADO ACTUAL DEL PROYECTO

**Qué está funcionando actualmente:** No es posible determinarlo desde este Proyecto de Claude — no contiene código fuente, solo documentación de planeación y diseño. Debe verificarse directamente en el repositorio de desarrollo.

**Qué ya está implementado:** Desde la perspectiva de *diseño/documentación* (no de código), están completamente definidos: el problema, los tres roles de usuario, los 10 requisitos funcionales con su descripción y prioridad (con una inconsistencia puntual en RF-07), 4 de las 5 categorías de requisitos no funcionales con criterios de validación medibles, el modelo relacional completo de base de datos (12 entidades con tipos y claves), un diagrama conceptual entidad-relación publicado, y un backlog de Jira estructurado en épicas e historias de usuario. Desde la perspectiva de *código*, no hay evidencia de implementación dentro de este Proyecto.

**Qué está parcialmente implementado:** Los requisitos no funcionales de Escalabilidad y Usabilidad están mencionados pero no desarrollados con descripción ni criterio de validación. El alcance de `ENTREGA_DISPENSACION`/`DETALLE_ENTREGA` está definido en el modelo relacional completo pero deliberadamente excluido del diagrama conceptual más reciente, sin que quede claro si eso afecta su implementación real.

**Qué falta:** Definición del stack tecnológico concreto (lenguajes, frameworks, motor de base de datos, autenticación, infraestructura); reglas exactas de negocio para reasignación automática y máquina de estados de turnos; canales de notificación concretos; granularidad de permisos por rol; y, en general, la implementación real del sistema (backend, frontend, base de datos), que debe confirmarse inspeccionando el repositorio de desarrollo del usuario.

**Qué debería hacerse después:** Inspeccionar el repositorio real para mapear este contexto contra el código existente; resolver con el usuario los puntos marcados como PENDIENTE DE DEFINIR o PENDIENTE DE CONFIRMAR en este documento (especialmente la prioridad de RF-07 y el alcance de las tablas de entrega/dispensación); y luego proceder según el orden recomendado en la sección 23 (Próximos pasos recomendados), priorizando siempre los requisitos de prioridad Alta ya validados.
