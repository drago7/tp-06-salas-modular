# TP06 — Refactorización modular de reservas

## Proyecto de partida y cambios

Este proyecto parte del TP05 `tp-05-salas-middleware`, correspondiente a la aplicación de reservas de salas de estudio.

El objetivo del TP06 es reorganizar el código internamente para separar las responsabilidades en módulos independientes, sin incorporar nuevas funcionalidades.

Se conservaron las vistas EJS, el layout principal, los estilos CSS, los datos iniciales, las rutas, los middlewares y el comportamiento HTTP de la aplicación. También se mantienen la validación de las reservas, el identificador de solicitudes y la medición de la duración de las respuestas.

La refactorización organiza el código en ocho módulos dentro de `src/`:

- `index.js`: punto de entrada y arranque del servidor.
- `configuracion.js`: lectura y validación de las variables de entorno.
- `app.js`: configuración de Express y del pipeline global.
- `rutas/reservas.js`: definición de las rutas de reservas.
- `controladores/reservas.js`: procesamiento de las solicitudes y generación de respuestas.
- `servicios/reservas.js`: gestión de las reservas en memoria.
- `middleware/solicitudes.js`: identificación de solicitudes y medición de duración.
- `middleware/reservas.js`: preparación de la sección de reservas y validación de formularios.

El cambio es estructural: se busca mejorar la organización, la legibilidad y el mantenimiento del proyecto, manteniendo el comportamiento observable de la aplicación. La única diferencia prevista en la configuración externa es que ahora se puede elegir el puerto y el formato de registro según el entorno.

## Instalación y ejecución

Se necesita Node.js y npm instalados.

Desde la carpeta raíz del proyecto, ejecutar:

```bash
npm install
npm start
```

La aplicación queda disponible en:

http://localhost:3000

Si se configura otro puerto mediante la variable `PORT`, se debe acceder al puerto correspondiente.

Para verificar la sintaxis de los módulos:

```bash
npm run check
```

## Configuración del entorno

La configuración se encuentra en `src/configuracion.js`, dentro de la función `leerConfiguracion()`.

El módulo lee las variables `PORT` y `NODE_ENV` desde `process.env`.

- `PORT`: indica el puerto en el que se inicia el servidor. Si no está definida, se utiliza el puerto `3000`.
- `NODE_ENV`: permite distinguir el entorno de ejecución y seleccionar el formato de registro de Morgan.

El puerto se convierte a un número y se valida para comprobar que sea un entero entre `1` y `65535`. Si el valor no cumple estas condiciones, se lanza un error con un mensaje que indica el valor inválido y el rango permitido.

El formato de registro de Morgan se selecciona de la siguiente manera:

- `development`: formato `dev`.
- `production`: formato `combined`.

Esta diferencia afecta al formato de los registros, no a las funcionalidades de la aplicación.

El archivo `.env.example` muestra las variables esperadas:

```dotenv
PORT=3000
NODE_ENV=development
```

El archivo `.env` puede utilizarse para guardar la configuración local, pero no debe subirse al repositorio. Está incluido en `.gitignore`, junto con `node_modules/`.

La aplicación también puede iniciarse sin un archivo `.env`, ya que la configuración contempla los valores predeterminados.

## Mapa de módulos y dependencias

La aplicación utiliza CommonJS mediante `require()` y `module.exports`.

| Módulo | Responsabilidad | Dependencias principales |
|---|---|---|
| `src/index.js` | Crea las reservas iniciales, obtiene la configuración, instancia el servicio y arranca el servidor. | `configuracion.js`, `servicios/reservas.js`, `app.js` |
| `src/configuracion.js` | Lee y valida las variables de entorno. | Variables de entorno de Node.js |
| `src/app.js` | Configura Express, las vistas, los middlewares, las rutas generales y la respuesta 404. | Express, Morgan, layouts, middleware, router y controlador |
| `src/rutas/reservas.js` | Relaciona los métodos y caminos HTTP con los middlewares y las funciones del controlador. | `middleware/reservas.js` y el controlador recibido |
| `src/controladores/reservas.js` | Obtiene datos del servicio y genera las respuestas HTML, JSON, redirecciones y errores 404. | Servicio de reservas |
| `src/servicios/reservas.js` | Lista, cuenta, busca y crea reservas en memoria. | No depende de Express ni de otros módulos de la aplicación |
| `src/middleware/solicitudes.js` | Genera identificadores `BIB-0001`, `BIB-0002`, etc., y mide la duración de las respuestas. | API de solicitudes y respuestas de Node.js/Express |
| `src/middleware/reservas.js` | Prepara los datos de la sección y valida los datos enviados en los formularios. | Express mediante `req`, `res` y `next` |

### Dirección de las dependencias

La organización busca mantener las responsabilidades separadas y evitar dependencias innecesarias.

El módulo de arranque conoce los componentes necesarios para crear la aplicación. `app.js` configura Express y conecta las rutas con el controlador. El router recibe el controlador ya construido, mientras que el controlador utiliza el servicio para consultar o modificar las reservas.

El servicio no depende de Express, de las vistas EJS ni de los códigos de estado HTTP. Su responsabilidad es trabajar con los datos y devolver resultados.

El controlador se ocupa de interpretar la solicitud y decidir qué respuesta enviar. El router, por su parte, relaciona cada camino HTTP con el middleware y el controlador correspondiente.

De esta manera, la lógica de gestión de reservas queda separada de la lógica de presentación y del manejo de solicitudes HTTP.

## Pipeline y contrato de rutas

El pipeline global conserva el orden de los middlewares y la configuración de la aplicación:

1. Morgan: registra las solicitudes HTTP.
2. `identificarSolicitud`: asigna un identificador único a cada solicitud.
3. `medirDuracion`: mide el tiempo hasta el evento `finish` de la respuesta.
4. `expressLayouts`: integra el layout principal con las vistas.
5. `express.static`: sirve los archivos estáticos de `public/`.
6. `express.urlencoded`: procesa los formularios enviados mediante URL-encoded.
7. `express.json`: procesa cuerpos de solicitud JSON.
8. Rutas generales de la aplicación: inicio y estado.
9. Router de `/reservas`: listado, formulario, detalle y creación.
10. Middleware final 404: responde cuando ninguna ruta coincide.

El orden importa porque cada middleware procesa la solicitud antes de que llegue a los siguientes. En particular, `express.urlencoded` debe ejecutarse antes del middleware que valida los datos del formulario.

El identificador se guarda en `res.locals.solicitudId` y la medición registra el método, la URL, el estado HTTP y la duración de la respuesta.

### Rutas de la aplicación

| Método | Ruta | Estado esperado |
|---|---|---|
| GET | `/` | 200 — página de inicio |
| GET | `/estado` | 200 — respuesta JSON |
| GET | `/reservas` | 200 — listado de reservas |
| GET | `/reservas/nueva` | 200 — formulario de creación |
| GET | `/reservas/:id` | 200 si existe la reserva; 404 si no existe |
| POST | `/reservas` | 302 si la reserva es válida; 400 si es inválida |
| GET | `/css/estilos.css` | 200 si existe el recurso |
| Cualquier método | Ruta inexistente | 404 — página de error |

La ruta `/reservas/nueva` se declara antes que `/reservas/:id` para evitar que el texto `nueva` se interprete como un identificador.

### Validación de reservas

El middleware `validarReserva` comprueba que los datos enviados sean válidos antes de permitir la creación.

Se verifica que:

- El nombre del estudiante no esté vacío.
- El correo electrónico contenga `@`.
- La sala pertenezca a las salas permitidas.
- La fecha esté informada.
- El turno sea uno de los permitidos.
- La cantidad de personas sea un entero entre 1 y 6.

Si los datos son inválidos, la solicitud responde con estado `400`, vuelve a mostrar el formulario y conserva los valores ingresados. No se crea ninguna reserva y el middleware no continúa hacia el controlador.

Si los datos son válidos, se guardan en `req.reservaValidada` y se continúa hacia el controlador. Este solicita al servicio que cree la reserva y responde mediante una redirección `302` hacia `/reservas`.

## Matriz antes/después

La comparación permite comprobar que la refactorización conserva el comportamiento HTTP del TP05.

Los resultados se obtuvieron mediante pruebas manuales con `curl` sobre ambas versiones, utilizando la misma línea de base y las mismas condiciones de prueba.

| Caso | TP05 corregido | TP06 modular |
|---|---|---|
| GET `/` | 200 | 200 |
| GET `/estado` | 200 (JSON, `reservas: 4`) | 200 (JSON, `reservas: 4`) |
| GET `/reservas` | 200 | 200 |
| GET `/reservas/nueva` | 200 | 200 |
| GET `/reservas/:id` existente | 200 | 200 |
| GET `/reservas/:id` inexistente | 404 | 404 |
| POST `/reservas` inválido (sin body) | 400 | 400 |
| POST `/reservas` válido | 302 → `Location: /reservas` | 302 → `Location: /reservas` |
| GET `/css/estilos.css` | 200 | 200 |
| GET `/no-existe-esta-ruta` | 404 | 404 |

Los 10 casos arrojan el mismo estado HTTP en ambas versiones, confirmando que
la refactorización modular conserva el contrato funcional original del TP05.

## Formato y análisis estático

El proyecto utiliza Prettier para el formato del código y ESLint para el análisis estático.

Los comandos disponibles son:

```bash
npm run format
npm run format:check
npm run lint
npm run verificar
npm run check
```

- `npm run format`: aplica Prettier a los archivos del proyecto.
- `npm run format:check`: comprueba si los archivos respetan el formato configurado.
- `npm run lint`: ejecuta ESLint para detectar problemas estáticos.
- `npm run verificar`: ejecuta la comprobación de formato y el análisis con ESLint.
- `npm run check`: comprueba la sintaxis de los ocho módulos JavaScript de `src/`.

Estas herramientas ayudan a detectar errores de sintaxis y problemas de formato o calidad estática, pero no garantizan que las rutas y respuestas HTTP funcionen correctamente.

Por ese motivo, las verificaciones deben complementarse con las pruebas manuales mediante `curl`, que permiten comprobar el comportamiento observable de la aplicación.

## Persistencia temporal y límites

Las reservas se gestionan en un arreglo privado dentro de la función `crearServicioReservas()`, definida en `src/servicios/reservas.js`.

El arreglo se encuentra encerrado en el ámbito de la función y se conserva mediante un *closure*. El servicio expone las operaciones necesarias para listar, contar, buscar por identificador y crear reservas, sin permitir que el controlador acceda directamente al arreglo.

La instancia del servicio se crea una sola vez en `src/index.js` y se comparte con el controlador. Por eso, el listado, el detalle, el endpoint `/estado` y la creación trabajan sobre los mismos datos.

La aplicación comienza con cuatro reservas iniciales. Cuando se crea una reserva válida, aumenta la cantidad disponible y el nuevo registro aparece en el listado y se refleja en `/estado`.

La persistencia es únicamente temporal: los datos se mantienen en memoria mientras el servidor está en ejecución. Al reiniciar la aplicación, el arreglo vuelve a las cuatro reservas iniciales y el contador de solicitudes vuelve a generar identificadores desde `BIB-0001`.

No se utiliza una base de datos ni se escriben las reservas en archivos. Por lo tanto, los registros creados durante una ejecución se pierden al reiniciar el servidor.