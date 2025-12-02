const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fixture API - Tournament Bracket Management',
      version: '1.0.0',
      description: 'API REST para gestionar torneos con sistema de brackets de eliminación simple. Genera automáticamente brackets para cualquier número de equipos, incluye fase previa si no es potencia de 2, y propaga resultados automáticamente.',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://fixture-api-6ds7q1-0d111f-31-97-133-67.traefik.me',
        description: 'Servidor de prod',
      },
    ],
    tags: [
      {
        name: 'Tournaments',
        description: 'Operaciones relacionadas con torneos y brackets',
      },
      {
        name: 'Players',
        description: 'Gestión de jugadores de equipos',
      },
      {
        name: 'DNI',
        description: 'Consulta de información por DNI',
      },
      {
        name: 'Health',
        description: 'Estado del servidor',
      },
    ],
    components: {
      schemas: {
        Tournament: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del torneo',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Nombre del torneo',
              example: 'Copa Mundial 2025',
            },
            status: {
              type: 'string',
              enum: ['draft', 'in_progress', 'completed'],
              description: 'Estado actual del torneo',
              example: 'draft',
            },
            totalTeams: {
              type: 'integer',
              description: 'Número total de equipos',
              example: 8,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        TournamentWithDetails: {
          allOf: [
            { $ref: '#/components/schemas/Tournament' },
            {
              type: 'object',
              properties: {
                bracket: { $ref: '#/components/schemas/Bracket' },
                teams: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Team' },
                },
              },
            },
          ],
        },
        Team: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del equipo',
              example: '507f1f77bcf86cd799439012',
            },
            name: {
              type: 'string',
              description: 'Nombre del equipo',
              example: 'Real Madrid',
            },
            position: {
              type: 'integer',
              description: 'Posición original en el torneo',
              example: 0,
            },
          },
        },
        TeamInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del equipo',
              example: 'Barcelona',
            },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del match',
              example: '507f1f77bcf86cd799439013',
            },
            round: {
              type: 'integer',
              description: 'Número de ronda (-1 para fase previa, 0 para primera ronda, etc.)',
              example: 0,
            },
            position: {
              type: 'integer',
              description: 'Posición dentro de la ronda',
              example: 0,
            },
            team1: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              example: { id: '507f1f77bcf86cd799439012', name: 'Real Madrid' },
            },
            team2: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              example: { id: '507f1f77bcf86cd799439014', name: 'Barcelona' },
            },
            score1: {
              type: 'integer',
              nullable: true,
              description: 'Puntuación del equipo 1',
              example: 3,
            },
            score2: {
              type: 'integer',
              nullable: true,
              description: 'Puntuación del equipo 2',
              example: 1,
            },
            winner: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
              example: { id: '507f1f77bcf86cd799439012', name: 'Real Madrid' },
            },
            completed: {
              type: 'boolean',
              description: 'Indica si el match ha sido completado',
              example: false,
            },
          },
        },
        Bracket: {
          type: 'object',
          properties: {
            rounds: {
              type: 'array',
              description: 'Array de rondas, cada ronda contiene un array de matches',
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Match' },
              },
            },
            totalTeams: {
              type: 'integer',
              description: 'Número total de equipos en el torneo',
              example: 8,
            },
          },
        },
        CreateTournamentRequest: {
          type: 'object',
          required: ['name', 'teams'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del torneo',
              example: 'Copa Mundial 2025',
            },
            teams: {
              type: 'array',
              description: 'Array de equipos (mínimo 2)',
              minItems: 2,
              items: { $ref: '#/components/schemas/TeamInput' },
              example: [
                { name: 'Real Madrid' },
                { name: 'Barcelona' },
                { name: 'Bayern Munich' },
                { name: 'PSG' },
              ],
            },
          },
        },
        UpdateMatchRequest: {
          type: 'object',
          required: ['score1', 'score2'],
          properties: {
            score1: {
              type: 'integer',
              minimum: 0,
              description: 'Puntuación del equipo 1',
              example: 3,
            },
            score2: {
              type: 'integer',
              minimum: 0,
              description: 'Puntuación del equipo 2',
              example: 1,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
              example: 'Torneo no encontrado',
            },
            message: {
              type: 'string',
              description: 'Detalles adicionales del error (solo en desarrollo)',
            },
          },
        },
        Player: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del jugador',
              example: '507f1f77bcf86cd799439020',
            },
            fullName: {
              type: 'string',
              description: 'Nombre completo del jugador',
              example: 'Juan Pérez García',
            },
            dni: {
              type: 'string',
              description: 'DNI del jugador',
              example: '12345678A',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
