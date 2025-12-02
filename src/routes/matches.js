const express = require('express');
const router = express.Router();
const MatchNotificationController = require('../controllers/matchNotificationController');

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
