# Imagen base optimizada
FROM node:20-alpine

# Definir directorio de trabajo
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el código fuente
COPY src/ ./src/

# Exponer el puerto interno
EXPOSE 3000

# Variables de entorno por defecto
ENV PORT=3000
ENV NODE_ENV=production

# Comprobación de salud interna
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "src/server.js"]
