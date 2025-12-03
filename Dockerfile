# Etapa de construcción
FROM node:18-slim AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Etapa de producción
FROM node:18-slim

# Instalar dependencias necesarias para Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar Puppeteer para usar el Chromium instalado del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Crear usuario no-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código de la aplicación
COPY --chown=nodejs:nodejs . .

# Crear directorio para WhatsApp Web.js con permisos correctos
RUN mkdir -p /app/.wwebjs_auth && \
    chown -R nodejs:nodejs /app/.wwebjs_auth && \
    chmod -R 755 /app/.wwebjs_auth

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"]
