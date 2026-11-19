# Segundo examen parcial — Trabajando en la Nube (COM610)

**Universidad San Francisco Xavier de Chuquisaca**  
**Docente:** Ing. Marcelo Quispe Ortega  
**Semestre:** 2/2026  
**Puntaje total:** 100 puntos (dos ejercicios de 50 puntos)

## Indicaciones generales

- Resuelve ambos ejercicios de forma individual. El segundo ejercicio continúa el proyecto y la infraestructura del primero.
- Crea **un repositorio público propio en GitHub** que contenga la solución de ambos ejercicios. Puedes partir del código de una guía de laboratorio, pero debes adaptarlo para cumplir los requisitos de este examen.
- Documenta en el `README.md` cómo ejecutar la aplicación y las pruebas, qué recursos de AWS utilizaste y cómo verificar el despliegue. Incluye un `.env.example` con valores ficticios y excluye `.env`, claves privadas, tokens y contraseñas reales del repositorio.
- Guarda las evidencias solicitadas en una carpeta `evidencias/` del repositorio. Oculta cualquier dato sensible en las capturas.
- Mantén los recursos de AWS disponibles hasta que el docente termine la revisión. Después, elimina los recursos que ya no necesites para evitar cargos.

## Ejercicio 1 — Tema 4: API REST en EC2 con base de datos RDS (50 puntos)

Una unidad académica necesita gestionar un catálogo de **libros** mediante una API pública. La aplicación se ejecutará en **Amazon EC2** y almacenará los datos en **Amazon RDS for MySQL o MariaDB**.

### Requisitos

1. Crea una instancia EC2 con Linux y una instancia RDS en la **misma VPC**. Identifica ambos recursos con tu nombre o iniciales. La base de datos debe tener **acceso público deshabilitado**.
2. Configura grupos de seguridad separados: EC2 debe aceptar **SSH (22) solo desde tu IP pública** y **HTTP (80) desde Internet**; RDS debe aceptar **MySQL/MariaDB (3306) únicamente desde el grupo de seguridad de EC2**. No publiques los puertos 3000 ni 3306 a Internet.
3. Crea en RDS una tabla `libros` con `id`, `titulo`, `autor` y `anio_publicacion`. Incluye en el repositorio un archivo `db.sql` capaz de crear la tabla. Los datos deben persistir en RDS, no en memoria ni en un archivo local.
4. Implementa con Node.js y Express una API que use variables de entorno para conectarse a RDS y ofrezca, como mínimo, estos endpoints:

   | Método y ruta | Comportamiento esperado |
   |---|---|
   | `GET /health` | Devuelve `200` y un JSON que indique que el servicio está activo. |
   | `GET /libros` | Devuelve la lista de libros almacenados en RDS. |
   | `GET /libros/:id` | Devuelve un libro; responde `404` si no existe. |
   | `POST /libros` | Crea un libro válido; responde `201` con el registro creado. |
   | `PUT /libros/:id` | Actualiza un libro existente; responde `404` si no existe. |
   | `DELETE /libros/:id` | Elimina un libro existente; responde `404` si no existe. |

5. Valida que `titulo` y `autor` no estén vacíos y que `anio_publicacion` sea un entero válido. Devuelve `400` ante datos inválidos. Utiliza consultas parametrizadas para las operaciones SQL.
6. Publica la API mediante **Nginx como proxy inverso en el puerto 80**. Verifica desde tu equipo, con `curl` o Postman, una operación de creación, una de consulta, una de actualización y una de eliminación. Demuestra que los cambios se reflejan en RDS.

### Evaluación

| Criterio | Puntos |
|---|---:|
| EC2, RDS y grupos de seguridad configurados correctamente | 15 |
| Modelo SQL, conexión privada y persistencia en RDS | 10 |
| Endpoints CRUD, respuestas HTTP y validación de datos | 15 |
| Publicación con Nginx y verificación externa de operaciones | 10 |
| **Total** | **50** |

## Ejercicio 2 — Tema 5: CI/CD para la API del ejercicio 1 (50 puntos)

Automatiza las comprobaciones y el despliegue de **la misma API** desde el repositorio de GitHub hacia la instancia EC2 del ejercicio 1.

### Requisitos

1. Añade pruebas automatizadas con Jest y Supertest para comprobar, como mínimo, `GET /health`, la creación válida de un libro, el rechazo de datos inválidos y la respuesta `404` al consultar un libro inexistente. Las pruebas deben poder ejecutarse **sin una instancia RDS real**, mediante un doble de prueba de la capa de datos u otra estrategia equivalente. Configura `npm test` y sube `package-lock.json`.
2. Crea `.github/workflows/ci.yml` para ejecutar `npm ci` y `npm test` automáticamente en cada `push` y `pull_request` hacia la rama principal. Una prueba fallida debe marcar la ejecución como fallida.
3. Añade un `Dockerfile` para la API. Construye y prueba la imagen localmente; el contenedor debe recibir la configuración de RDS por variables de entorno y responder en `/health`.
4. Crea `.github/workflows/cd.yml` con trabajos dependientes para **ejecutar las pruebas**, **construir y publicar una imagen Docker identificada con el SHA del commit** en un registro de contenedores y **desplegar esa imagen automáticamente en EC2**, en ese orden. El despliegue debe ejecutarse solo cuando las pruebas pasen y únicamente por cambios incorporados a la rama principal; un `pull_request` no debe desplegar.
5. Configura las credenciales de acceso al registro y a EC2 como **secrets de GitHub Actions**. En EC2, mantén la configuración de RDS fuera del repositorio y del archivo de imagen. El contenedor debe escuchar solo a través del proxy Nginx, sin exponer directamente el puerto 3000 a Internet.
6. Tras desplegar, verifica `/health` y al menos una consulta a `/libros`. Si la nueva versión no supera la comprobación, el workflow debe fallar y conservar o restaurar la versión anterior. Demuestra un despliegue exitoso mediante un cambio visible en la respuesta de la API o en el campo de versión.

### Evaluación

| Criterio | Puntos |
|---|---:|
| Pruebas automatizadas y workflow de CI funcional | 15 |
| Dockerfile e imagen ejecutable con configuración externa | 10 |
| Workflow de CD con publicación, dependencias y despliegue seguro | 15 |
| Verificación del despliegue y conservación de la versión anterior ante fallos | 10 |
| **Total** | **50** |

## Entrega en eCampus

**Envía en eCampus la URL del repositorio público de GitHub que contiene la solución de ambos ejercicios.** Ese enlace es la entrega del examen; comprueba que el docente pueda abrirlo sin solicitar permisos.

El repositorio debe incluir, como mínimo, el código fuente de la API, `db.sql`, `Dockerfile`, pruebas, `package.json`, `package-lock.json`, `.env.example`, `README.md`, los dos workflows y la carpeta `evidencias/`. En el `README.md` registra la URL pública de la API y los enlaces directos a ejecuciones exitosas de CI y CD.

En `evidencias/` incluye capturas que permitan verificar: la instancia EC2 y sus reglas de seguridad; RDS sin acceso público y su regla de entrada; las operaciones CRUD y su persistencia; la ejecución de las pruebas; la imagen publicada; y el despliegue exitoso en GitHub Actions. No incluyas archivos `.pem`, `.env` ni valores secretos.

> **Nota:** La API y la instancia deben permanecer accesibles durante la revisión. Si cambia la IP pública de EC2, actualiza la URL documentada en el repositorio.
