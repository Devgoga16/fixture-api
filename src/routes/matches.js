const express = require('express');
const router = express.Router();
const MatchNotificationController = require('../controllers/matchNotificationController');
const MatchController = require('../controllers/matchController');

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

module.exports = router;
