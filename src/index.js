const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const swaggerSpec = require('./config/swagger');
const whatsappService = require('./services/whatsappService');
const tournamentRoutes = require('./routes/tournaments');
const playerRoutes = require('./routes/players');
const dniRoutes = require('./routes/dni');
const superAdminRoutes = require('./routes/superadmins');
const authRoutes = require('./routes/auth');
const delegadoRoutes = require('./routes/delegado');
const matchesRoutes = require('./routes/matches');

// Cargar variables de entorno
require('dotenv').config();

// Inicializar Express
const app = express();

// Conectar a MongoDB
connectDB();

// Inicializar WhatsApp Web
whatsappService.initialize();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Fixture API Documentation'
}));

// Routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', playerRoutes);
app.use('/api/dni', dniRoutes);
app.use('/api/superadmins', superAdminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/delegado', delegadoRoutes);
app.use('/api/matches', matchesRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     description: Verifica que el servidor esté funcionando correctamente
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-12-01T10:30:00.000Z
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     tags: [Health]
 *     description: Obtiene información general sobre la API y sus endpoints disponibles
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fixture API - Tournament Bracket Management
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 documentation:
 *                   type: string
 *                   example: /api-docs
 *                 endpoints:
 *                   type: object
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Fixture API - Tournament Bracket Management',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: 'GET /health',
      auth: {
        superadmin: {
          requestOTP: 'POST /api/auth/request-otp',
          verifyOTP: 'POST /api/auth/verify-otp'
        },
        delegado: {
          requestOTP: 'POST /api/auth/delegado/request-otp',
          verifyOTP: 'POST /api/auth/delegado/verify-otp'
        },
        whatsappStatus: 'GET /api/auth/whatsapp-status'
      },
      delegado: {
        getMyTeams: 'GET /api/delegado/teams?phone=xxx',
        getTeamDetails: 'GET /api/delegado/teams/:teamId?phone=xxx'
      },
      matches: {
        notify: 'POST /api/matches/:matchId/notify'
      },
      tournaments: {
        create: 'POST /api/tournaments',
        list: 'GET /api/tournaments',
        get: 'GET /api/tournaments/:id',
        updateMatch: 'PUT /api/tournaments/:id/matches/:matchId',
        reset: 'POST /api/tournaments/:id/reset',
        delete: 'DELETE /api/tournaments/:id'
      },
      players: {
        add: 'POST /api/teams/:teamId/players',
        list: 'GET /api/teams/:teamId/players',
        update: 'PUT /api/teams/:teamId/players/:playerId',
        delete: 'DELETE /api/teams/:teamId/players/:playerId'
      },
      dni: {
        consult: 'GET /api/dni/:numero'
      },
      superadmins: {
        create: 'POST /api/superadmins',
        list: 'GET /api/superadmins',
        get: 'GET /api/superadmins/:id',
        update: 'PUT /api/superadmins/:id',
        delete: 'DELETE /api/superadmins/:id'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
