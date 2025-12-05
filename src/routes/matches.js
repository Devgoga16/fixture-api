const express = require('express');
const router = express.Router();
const MatchNotificationController = require('../controllers/matchNotificationController');
const MatchController = require('../controllers/matchController');

/**
 * @swagger
 * /api/matches/team/{teamId}:
 *   get:
 *     summary: Obtener todos los partidos de un equipo
 *     tags: [Matches]
 *     description: Obtiene todos los partidos (pasados, presentes y futuros) en los que participa un equipo específico
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Lista de partidos del equipo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 teamId:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439013
 *                 totalMatches:
 *                   type: integer
 *                   example: 5
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       tournament:
 *                         type: object
 *                       round:
 *                         type: integer
 *                       roundName:
 *                         type: string
 *                       team1:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           isMyTeam:
 *                             type: boolean
 *                       team2:
 *                         type: object
 *                       score1:
 *                         type: integer
 *                       score2:
 *                         type: integer
 *                       winner:
 *                         type: object
 *                         nullable: true
 *                       goals:
 *                         type: array
 *                       yellowCards:
 *                         type: array
 *                       status:
 *                         type: string
 *                       scheduledTime:
 *                         type: string
 *                         format: date-time
 *                       completed:
 *                         type: boolean
 *                       result:
 *                         type: string
 *                         enum: [won, lost, draw, null]
 *                         nullable: true
 *       500:
 *         description: Error interno del servidor
 */
router.get('/team/:teamId', MatchController.getTeamMatches);

/**
 * @swagger
 * /api/matches/{matchId}:
 *   get:
 *     summary: Obtener detalles de un partido
 *     tags: [Matches]
 *     description: Obtiene información completa de un partido específico
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Detalles del partido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tournament:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     round:
 *                       type: integer
 *                     position:
 *                       type: integer
 *                     team1:
 *                       type: object
 *                       nullable: true
 *                     team2:
 *                       type: object
 *                       nullable: true
 *                     score1:
 *                       type: integer
 *                       nullable: true
 *                     score2:
 *                       type: integer
 *                       nullable: true
 *                     winner:
 *                       type: object
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum: [created, scheduled, in_progress, finished]
 *                       example: created
 *                     scheduledTime:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     completed:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Partido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:matchId', MatchController.getMatch);

/**
 * @swagger
 * /api/matches/{matchId}/full:
 *   get:
 *     summary: Obtener información completa del partido con jugadores
 *     tags: [Matches]
 *     description: Obtiene todos los detalles del partido incluyendo la lista completa de jugadores de ambos equipos
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Información completa del partido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tournament:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         status:
 *                           type: string
 *                         totalTeams:
 *                           type: integer
 *                     round:
 *                       type: integer
 *                     roundName:
 *                       type: string
 *                       example: Octavos de Final
 *                     position:
 *                       type: integer
 *                     team1:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: Real Madrid
 *                         position:
 *                           type: integer
 *                         delegado:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *                             telefono:
 *                               type: string
 *                         players:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               dni:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                         playersCount:
 *                           type: integer
 *                     team2:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: Barcelona
 *                         position:
 *                           type: integer
 *                         delegado:
 *                           type: object
 *                           properties:
 *                             nombre:
 *                               type: string
 *                             telefono:
 *                               type: string
 *                         players:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                               dni:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                         playersCount:
 *                           type: integer
 *                     score1:
 *                       type: integer
 *                       nullable: true
 *                     score2:
 *                       type: integer
 *                       nullable: true
 *                     winner:
 *                       type: object
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum: [created, scheduled, in_progress, finished]
 *                     scheduledTime:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     completed:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Partido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:matchId/full', MatchController.getMatchFull);

/**
 * @swagger
 * /api/matches/{matchId}/status:
 *   put:
 *     summary: Actualizar estado y hora programada de un partido
 *     tags: [Matches]
 *     description: Actualiza el estado del partido (creado, programado, iniciado, terminado) y opcionalmente la hora programada
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [created, scheduled, in_progress, finished]
 *                 description: |
 *                   Estado del partido:
 *                   - **created**: Partido creado (por defecto)
 *                   - **scheduled**: Partido programado (requiere scheduledTime)
 *                   - **in_progress**: Partido en curso
 *                   - **finished**: Partido finalizado
 *                 example: scheduled
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: Hora programada para el partido (requerido si status es 'scheduled')
 *                 example: '2025-12-03T15:30:00.000Z'
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tournament:
 *                       type: string
 *                       example: Copa Mundial 2025
 *                     round:
 *                       type: integer
 *                     position:
 *                       type: integer
 *                     team1:
 *                       type: string
 *                       example: Real Madrid
 *                     team2:
 *                       type: string
 *                       example: Barcelona
 *                     status:
 *                       type: string
 *                       example: scheduled
 *                     scheduledTime:
 *                       type: string
 *                       format: date-time
 *                     completed:
 *                       type: boolean
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Estado inválido o datos faltantes
 *       404:
 *         description: Partido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:matchId/status', MatchController.updateMatchStatus);

/**
 * @swagger
 * /api/matches/{matchId}/score:
 *   put:
 *     summary: Actualizar marcador del partido sin finalizarlo
 *     tags: [Matches]
 *     description: Actualiza el marcador (score1 y score2) del partido sin marcarlo como completado. Útil para actualizar marcadores en tiempo real durante el partido.
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score1
 *               - score2
 *             properties:
 *               score1:
 *                 type: integer
 *                 minimum: 0
 *                 description: Marcador del equipo 1
 *                 example: 2
 *               score2:
 *                 type: integer
 *                 minimum: 0
 *                 description: Marcador del equipo 2
 *                 example: 1
 *     responses:
 *       200:
 *         description: Marcador actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Marcador actualizado
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tournament:
 *                       type: string
 *                       example: Copa Mundial 2025
 *                     round:
 *                       type: integer
 *                     position:
 *                       type: integer
 *                     team1:
 *                       type: string
 *                       example: Real Madrid
 *                     team2:
 *                       type: string
 *                       example: Barcelona
 *                     score1:
 *                       type: integer
 *                       example: 2
 *                     score2:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: in_progress
 *                     completed:
 *                       type: boolean
 *                       example: false
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos o partido sin equipos asignados
 *       404:
 *         description: Partido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:matchId/score', MatchController.updateScore);

/**
 * @swagger
 * /api/matches/{matchId}/notify:
 *   post:
 *     summary: Enviar notificaciones por WhatsApp a delegados del partido
 *     tags: [Matches]
 *     description: Envía notificaciones personalizadas por WhatsApp a los delegados de los equipos involucrados en un partido específico
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationType
 *             properties:
 *               notificationType:
 *                 type: string
 *                 enum: [next_match, starting_soon, winner_announcement]
 *                 description: |
 *                   Tipo de notificación a enviar:
 *                   - **next_match**: Alerta que son el próximo partido y deben acercarse a mesa para validación de jugadores
 *                   - **starting_soon**: El partido comienza en 5 minutos
 *                   - **winner_announcement**: Comunicar y felicitar al ganador (requiere partido completado)
 *                 example: next_match
 *     responses:
 *       200:
 *         description: Notificaciones enviadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 notificationType:
 *                   type: string
 *                   example: next_match
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     round:
 *                       type: integer
 *                     position:
 *                       type: integer
 *                     team1:
 *                       type: string
 *                       example: Real Madrid
 *                     team2:
 *                       type: string
 *                       example: Barcelona
 *                     tournament:
 *                       type: string
 *                       example: Copa Mundial 2025
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: string
 *                         example: Real Madrid
 *                       delegado:
 *                         type: string
 *                         example: Juan Pérez
 *                       phone:
 *                         type: string
 *                         example: '987654321'
 *                       status:
 *                         type: string
 *                         enum: [sent, failed, skipped]
 *                         example: sent
 *                       error:
 *                         type: string
 *                         description: Mensaje de error (solo si status es 'failed')
 *                       reason:
 *                         type: string
 *                         description: Razón del skip (solo si status es 'skipped')
 *       400:
 *         description: Tipo de notificación inválido o partido sin equipos asignados
 *       404:
 *         description: Partido no encontrado
 *       503:
 *         description: Servicio de WhatsApp no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:matchId/notify', MatchNotificationController.sendMatchNotification);

/**
 * @swagger
 * /api/matches/{matchId}/goals:
 *   post:
 *     summary: Registrar un gol en el partido
 *     tags: [Matches]
 *     description: Registra un gol anotado por un jugador durante el partido
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - teamId
 *             properties:
 *               playerId:
 *                 type: string
 *                 description: ID del jugador que anotó
 *                 example: 507f1f77bcf86cd799439014
 *               teamId:
 *                 type: string
 *                 description: ID del equipo del jugador
 *                 example: 507f1f77bcf86cd799439015
 *     responses:
 *       200:
 *         description: Gol registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Gol registrado exitosamente
 *                 goal:
 *                   type: object
 *                   properties:
 *                     playerId:
 *                       type: object
 *                     teamId:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 totalGoalsInMatch:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Datos inválidos o equipo no pertenece al partido
 *       404:
 *         description: Partido o jugador no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:matchId/goals', MatchController.addGoal);

/**
 * @swagger
 * /api/matches/{matchId}/yellow-cards:
 *   post:
 *     summary: Registrar una tarjeta amarilla en el partido
 *     tags: [Matches]
 *     description: Registra una tarjeta amarilla mostrada a un jugador durante el partido
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - teamId
 *             properties:
 *               playerId:
 *                 type: string
 *                 description: ID del jugador que recibió la tarjeta
 *                 example: 507f1f77bcf86cd799439014
 *               teamId:
 *                 type: string
 *                 description: ID del equipo del jugador
 *                 example: 507f1f77bcf86cd799439015
 *     responses:
 *       200:
 *         description: Tarjeta amarilla registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tarjeta amarilla registrada exitosamente
 *                 yellowCard:
 *                   type: object
 *                   properties:
 *                     playerId:
 *                       type: object
 *                     teamId:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 totalYellowCardsInMatch:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Datos inválidos o equipo no pertenece al partido
 *       404:
 *         description: Partido o jugador no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:matchId/yellow-cards', MatchController.addYellowCard);

/**
 * @swagger
 * /api/matches/{matchId}/sets:
 *   post:
 *     summary: Registrar un set en el partido de voleibol
 *     tags: [Matches]
 *     description: Registra el resultado de un set para partidos de voleibol (sport = 2). Actualiza automáticamente el marcador de sets ganados.
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - set
 *               - score1
 *               - score2
 *             properties:
 *               set:
 *                 type: integer
 *                 description: Número del set (1, 2, 3, etc.)
 *                 example: 1
 *               score1:
 *                 type: integer
 *                 description: Puntaje del equipo 1 en el set
 *                 example: 25
 *               score2:
 *                 type: integer
 *                 description: Puntaje del equipo 2 en el set
 *                 example: 23
 *               status:
 *                 type: string
 *                 enum: [in_progress, finished]
 *                 description: Estado del set (opcional, por defecto "in_progress")
 *                 example: finished
 *     responses:
 *       200:
 *         description: Set registrado o actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Set registrado exitosamente
 *                 set:
 *                   type: object
 *                 totalSets:
 *                   type: integer
 *                   example: 3
 *                 setsScore:
 *                   type: object
 *                   properties:
 *                     team1:
 *                       type: integer
 *                       example: 2
 *                     team2:
 *                       type: integer
 *                       example: 1
 *                 allSets:
 *                   type: array
 *       400:
 *         description: Datos inválidos, set ya existe, o partido no es de voleibol
 *       404:
 *         description: Partido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:matchId/sets', MatchController.addSet);

/**
 * @swagger
 * /api/matches/{matchId}/sets/{setNumber}:
 *   put:
 *     summary: Actualizar el resultado de un set
 *     tags: [Matches]
 *     description: Actualiza el puntaje de un set específico en un partido de voleibol
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *       - in: path
 *         name: setNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número del set a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score1
 *               - score2
 *             properties:
 *               score1:
 *                 type: integer
 *                 description: Nuevo puntaje del equipo 1
 *                 example: 26
 *               score2:
 *                 type: integer
 *                 description: Nuevo puntaje del equipo 2
 *                 example: 24
 *               status:
 *                 type: string
 *                 enum: [in_progress, finished]
 *                 description: Estado del set (opcional)
 *                 example: finished
 *     responses:
 *       200:
 *         description: Set actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Set actualizado exitosamente
 *                 set:
 *                   type: object
 *                 setsScore:
 *                   type: object
 *                 allSets:
 *                   type: array
 *       400:
 *         description: Datos inválidos o partido no es de voleibol
 *       404:
 *         description: Partido o set no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:matchId/sets/:setNumber', MatchController.updateSet);

/**
 * @swagger
 * /api/matches/{matchId}/details/{teamId}:
 *   get:
 *     summary: Obtener detalles completos del partido desde la perspectiva de un equipo
 *     tags: [Matches]
 *     description: Obtiene toda la información del partido organizada desde el punto de vista de un equipo específico, incluyendo jugadores, goles y tarjetas de ambos equipos
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del partido
 *         example: 507f1f77bcf86cd799439013
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo (mi equipo)
 *         example: 507f1f77bcf86cd799439014
 *     responses:
 *       200:
 *         description: Detalles completos del partido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     tournament:
 *                       type: object
 *                     round:
 *                       type: integer
 *                     roundName:
 *                       type: string
 *                     status:
 *                       type: string
 *                     scheduledTime:
 *                       type: string
 *                       format: date-time
 *                     result:
 *                       type: string
 *                       enum: [won, lost, draw, null]
 *                       nullable: true
 *                     myTeam:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         score:
 *                           type: integer
 *                         players:
 *                           type: array
 *                           description: Lista completa de jugadores de mi equipo
 *                         goals:
 *                           type: array
 *                           description: Goles anotados por mi equipo
 *                         yellowCards:
 *                           type: array
 *                           description: Tarjetas amarillas de mi equipo
 *                     rivalTeam:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         score:
 *                           type: integer
 *                         players:
 *                           type: array
 *                           description: Lista completa de jugadores del rival
 *                         goals:
 *                           type: array
 *                           description: Goles anotados por el rival
 *                         yellowCards:
 *                           type: array
 *                           description: Tarjetas amarillas del rival
 *       400:
 *         description: El equipo no participa en este partido
 *       404:
 *         description: Partido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:matchId/details/:teamId', MatchController.getMatchDetails);

module.exports = router;
