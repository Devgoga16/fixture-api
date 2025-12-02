# Fixture API - Tournament Bracket Management

API REST para gestionar torneos con sistema de brackets de eliminación simple.

## 🚀 Características

- ✅ Creación de torneos con cualquier número de equipos
- ✅ Generación automática de brackets (incluye fase previa si no es potencia de 2)
- ✅ Actualización de resultados con propagación automática de ganadores
- ✅ Persistencia en MongoDB
- ✅ Reseteo de torneos
- ✅ CORS habilitado
- ✅ Documentación interactiva con Swagger UI

## 📋 Requisitos

- Node.js 14+
- MongoDB 4.4+
- Docker y Docker Compose (opcional)

## 🛠️ Instalación

### Opción 1: Con Docker (Recomendado)

1. Asegúrate de tener Docker y Docker Compose instalados

2. Inicia los contenedores:
```bash
docker-compose up -d
```

La API estará disponible en `http://localhost:3000` y MongoDB en `localhost:27017`

Para ver los logs:
```bash
docker-compose logs -f api
```

Para detener:
```bash
docker-compose down
```

### Opción 2: Instalación Manual

1. Clona el repositorio e instala dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y agrega tu cadena de conexión de MongoDB
MONGODB_URI=tu_cadena_de_conexion_aqui
```

3. Inicia el servidor:
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor correrá en `http://localhost:3000`

## 📚 Documentación Interactiva

Swagger UI está disponible en: **http://localhost:3000/api-docs**

La documentación interactiva te permite:
- 📖 Ver todos los endpoints disponibles
- 🧪 Probar los endpoints directamente desde el navegador
- 📝 Ver los esquemas de datos y ejemplos
- ✅ Validar requests y responses

## 📡 Endpoints

### 1. Crear Torneo
```http
POST /api/tournaments
Content-Type: application/json

{
  "name": "Torneo de Fútbol 2025",
  "teams": [
    { "name": "Equipo A" },
    { "name": "Equipo B" },
    { "name": "Equipo C" },
    { "name": "Equipo D" }
  ]
}
```

### 2. Listar Torneos
```http
GET /api/tournaments
```

### 3. Obtener Torneo
```http
GET /api/tournaments/:id
```

### 4. Actualizar Resultado de Match
```http
PUT /api/tournaments/:id/matches/:matchId
Content-Type: application/json

{
  "score1": 3,
  "score2": 1
}
```

### 5. Resetear Torneo
```http
POST /api/tournaments/:id/reset
```

### 6. Eliminar Torneo
```http
DELETE /api/tournaments/:id
```

### 7. Health Check
```http
GET /health
```

## 📊 Estructura de Datos

### Tournament
```javascript
{
  id: "string",
  name: "string",
  status: "draft" | "in_progress" | "completed",
  totalTeams: number,
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Team
```javascript
{
  id: "string",
  name: "string",
  position: number
}
```

### Match
```javascript
{
  id: "string",
  round: number, // -1 para fase previa, 0, 1, 2, etc.
  position: number,
  team1: { id: "string", name: "string" } | null,
  team2: { id: "string", name: "string" } | null,
  score1: number | null,
  score2: number | null,
  winner: { id: "string", name: "string" } | null,
  completed: boolean
}
```

### Bracket
```javascript
{
  rounds: Match[][], // Array de rondas, cada ronda es un array de matches
  totalTeams: number
}
```

## 🏗️ Estructura del Proyecto

```
fixture-api/
├── src/
│   ├── config/
│   │   └── database.js      # Configuración de MongoDB
│   ├── controllers/
│   │   └── tournamentController.js  # Lógica de endpoints
│   ├── models/
│   │   ├── Tournament.js    # Schema de Torneo
│   │   ├── Team.js          # Schema de Equipo
│   │   └── Match.js         # Schema de Match
│   ├── routes/
│   │   └── tournaments.js   # Definición de rutas
│   ├── services/
│   │   └── bracketService.js # Lógica de generación de brackets
│   └── index.js             # Punto de entrada
├── .env                     # Variables de entorno (no versionado)
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Ejemplo de Uso

```javascript
// 1. Crear un torneo
const response = await fetch('http://localhost:3000/api/tournaments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Copa 2025',
    teams: [
      { name: 'Real Madrid' },
      { name: 'Barcelona' },
      { name: 'Bayern Munich' },
      { name: 'PSG' },
      { name: 'Liverpool' }
    ]
  })
});

const tournament = await response.json();
console.log(tournament.bracket); // Ver el bracket generado

// 2. Actualizar resultado de un match
const matchId = tournament.bracket.rounds[0][0].id;
await fetch(`http://localhost:3000/api/tournaments/${tournament.id}/matches/${matchId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ score1: 2, score2: 1 })
});
```

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/fixture-api` |

## 🐳 Docker

### Construir imagen
```bash
docker build -t fixture-api .
```

### Ejecutar contenedor
```bash
docker run -d -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/fixture-api \
  --name fixture-api \
  fixture-api
```

### Docker Compose
El archivo `docker-compose.yml` incluye MongoDB y la API configurados:
- MongoDB en puerto 27017
- API en puerto 3000
- Red interna para comunicación
- Volumen persistente para datos

## 📝 Notas

- Los brackets se generan automáticamente para cualquier número de equipos
- Si el número de equipos no es potencia de 2, se crea una fase previa (round -1)
- Los resultados se propagan automáticamente al siguiente match
- No se permiten empates
- Al actualizar un resultado anterior, se limpian los matches subsecuentes

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC
