# Segundo Examen Parcial — Trabajando en la Nube (COM610)
**Universidad San Francisco Xavier de Chuquisaca**  
**Estudiante:** Daniel Ugarte  
**Docente:** Ing. Marcelo Quispe Ortega  
**Semestre:** 2/2026  

---

## 📌 Enlaces del Proyecto y Recursos Desplegados

- **URL Pública de la API (EC2):** [http://44.213.249.174](http://44.213.249.174)
- **Endpoint de Salud:** [http://44.213.249.174/health](http://44.213.249.174/health)
- **Repositorio de GitHub:** [https://github.com/DUA67/segundo-parcial-nube-com610](https://github.com/DUA67/segundo-parcial-nube-com610)
- **Workflow CI Exitoso:** [https://github.com/DUA67/segundo-parcial-nube-com610/actions/workflows/ci.yml](https://github.com/DUA67/segundo-parcial-nube-com610/actions/workflows/ci.yml)
- **Workflow CD Exitoso:** [https://github.com/DUA67/segundo-parcial-nube-com610/actions/workflows/cd.yml](https://github.com/DUA67/segundo-parcial-nube-com610/actions/workflows/cd.yml)

---

## 🏗️ Arquitectura de la Solución en AWS

```
                     Internet
                        │
                        ▼ (Puerto 80 HTTP)
           ┌──────────────────────────────────────────────┐
           │     Amazon EC2: ec2-libros-daniel-ugarte     │
           │     IP Pública: 44.213.249.174               │
           │  ┌────────────────────────────────────────┐  │
           │  │      Nginx (Proxy Inverso :80)         │  │
           │  └───────────────────┬────────────────────┘  │
           │                      │ (127.0.0.1:3000)      │
           │                      ▼                       │
           │  ┌────────────────────────────────────────┐  │
           │  │   Docker: api-libros (:3000 interno)   │  │
           │  └───────────────────┬────────────────────┘  │
           └──────────────────────┼───────────────────────┘
                                  │ (Puerto 3306 - MySQL Privado)
                                  │ (VPC Default: 172.31.0.0/16)
                                  ▼
           ┌──────────────────────────────────────────────┐
           │    Amazon RDS: rds-libros-daniel-ugarte      │
           │    Endpoint: rds-libros-daniel-ugarte...     │
           │    Acceso Público: NO                        │
           │    Motor: MySQL 8.4 / Base: biblioteca_db    │
           └──────────────────────────────────────────────┘
```

### Recursos AWS Utilizados
1. **VPC:** `vpc-00d33161f1c5e2a68` (Región: `us-east-1` N. Virginia).
2. **Amazon EC2 (`ec2-libros-daniel-ugarte`):**
   - **ID de Instancia:** `i-047afe36ab7513f8a`
   - **IP Pública:** `44.213.249.174`
   - **Tipo:** `t3.micro` con Ubuntu 24.04 LTS
   - **Security Group:** `sg-0c9d3515e64b68cbe` (`secgroup-ec2-daniel-ugarte`)
     - HTTP (Puerto 80): Permitido desde cualquier origen (`0.0.0.0/0`).
     - SSH (Puerto 22): Restringido a la IP del estudiante (`166.114.199.91/32`).
     - Puerto 3000: **Cerrado / No expuesto a Internet** (acceso exclusivo mediante Nginx).
3. **Amazon RDS (`rds-libros-daniel-ugarte`):**
   - **Endpoint Privado:** `rds-libros-daniel-ugarte.cinm8ugictv3.us-east-1.rds.amazonaws.com`
   - **Puerto:** `3306`
   - **Acceso Público:** `NO` (deshabilitado).
   - **Motor:** MySQL 8.4
   - **Base de Datos Inicial:** `biblioteca_db` (Tabla `libros`).
   - **Security Group:** `sg-06665bebacee0207f` (`secgroup-rds-daniel-ugarte`)
     - MySQL/Aurora (Puerto 3306): Permitido **únicamente** desde el Security Group de EC2 (`sg-0c9d3515e64b68cbe`).

---

## 🚀 Endpoints de la API y Respuestas HTTP

| Método | Endpoint | Comportamiento | Status HTTP |
|---|---|---|---|
| `GET` | `/health` | Devuelve JSON con status, versión, uptime y estado de RDS | `200 OK` |
| `GET` | `/libros` | Devuelve la lista completa de libros almacenados en RDS | `200 OK` |
| `GET` | `/libros/:id` | Devuelve un libro por su ID; responde `404` si no existe | `200 OK` / `404 Not Found` |
| `POST` | `/libros` | Crea un libro válido; responde `201` con el registro creado | `201 Created` / `400 Bad Request` |
| `PUT` | `/libros/:id` | Actualiza un libro existente; responde `404` si no existe | `200 OK` / `400` / `404` |
| `DELETE` | `/libros/:id` | Elimina un libro existente; responde `404` si no existe | `200 OK` / `404 Not Found` |

---

## 💻 Pruebas Automatizadas (Jest + Supertest)

Las pruebas unitarias y de integración se ejecutan de manera aislada sin requerir una conexión real a RDS mediante mocks de `mysql2/promise`:

```bash
npm test
```

**Resultado:**
- 16 pruebas ejecutadas y aprobadas (100% PASS).
- Cobertura de validaciones de título, autor, año de publicación (positivos, no nulos, no strings), respuestas 404, operaciones CRUD completas y verificación de estado en `/health`.

---

## 🐳 Docker y Nginx Proxy

- **Dockerfile:** Basado en `node:20-alpine`, instalación optimizada con `npm ci --only=production` y `HEALTHCHECK` integrado.
- **Nginx Reverse Proxy:** Escucha en el puerto 80 público y redirige el tráfico hacia `http://127.0.0.1:3000`.

---

## 🔄 Configuración de CI/CD en GitHub Actions

### Secretos Requeridos en GitHub (`Settings > Secrets and variables > Actions`):
- `EC2_HOST`: `44.213.249.174`
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: Contenido de la llave privada `key-daniel-ugarte.pem`.

*Nota: La publicación de imágenes en GitHub Container Registry (GHCR) utiliza automáticamente `secrets.GITHUB_TOKEN` sin requerir credenciales manuales.*

### Flujo de Pipelines:
1. **CI (`.github/workflows/ci.yml`):**
   - Ejecuta `npm ci` y `npm test` en cada `push` y `pull_request` a `main`.
2. **CD (`.github/workflows/cd.yml`):**
   - Solo en `push` a `main`.
   - Etapas secuenciales:
     1. Pruebas automatizadas.
     2. Construcción y publicación de la imagen Docker en GHCR con tag `${{ github.sha }}`.
     3. Despliegue en EC2 vía SSH, verificación de endpoints (`/health` y `/libros`) y **rollback automático** si la verificación no supera los códigos 200.

---

## 🧪 Verificación de Operaciones con cURL en Vivo

```bash
# 1. Comprobar salud del servicio
curl http://44.213.249.174/health

# 2. Consultar catálogo de libros
curl http://44.213.249.174/libros

# 3. Registrar un nuevo libro
curl -X POST http://44.213.249.174/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo": "El Aleph", "autor": "Jorge Luis Borges", "anio_publicacion": 1949}'

# 4. Consultar libro por ID
curl http://44.213.249.174/libros/4

# 5. Actualizar libro
curl -X PUT http://44.213.249.174/libros/4 \
  -H "Content-Type: application/json" \
  -d '{"titulo": "El Aleph (Edicion Especial)", "autor": "Jorge Luis Borges", "anio_publicacion": 1949}'

# 6. Eliminar libro
curl -X DELETE http://44.213.249.174/libros/4

# 7. Validaciones ante datos inválidos (Responde 400 Bad Request)
curl -X POST http://44.213.249.174/libros \
  -H "Content-Type: application/json" \
  -d '{"titulo": "", "autor": "Autor", "anio_publicacion": 2020}'
```
