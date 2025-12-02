const express = require('express');
const router = express.Router();
const PlayerController = require('../controllers/playerController');

/**
 * @swagger
 * /api/teams/{teamId}/players:
 *   post:
 *     summary: Agregar jugadores a un equipo
 *     tags: [Players]
 *     description: Agrega uno o más jugadores a un equipo específico. Cada jugador debe tener nombre completo y DNI.
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - players
 *             properties:
 *               players:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullName
 *                     - dni
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       description: Nombre completo del jugador
 *                       example: Juan Pérez García
 *                     dni:
 *                       type: string
 *                       description: DNI del jugador
 *                       example: 12345678A
 *     responses:
 *       201:
 *         description: Jugadores agregados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamId:
 *                   type: string
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *       400:
 *         description: Datos inválidos o DNI duplicado
 *       404:
 *         description: Equipo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:teamId/players', PlayerController.addPlayers);

/**
 * @swagger
 * /api/teams/{teamId}/players:
 *   get:
 *     summary: Obtener jugadores de un equipo
 *     tags: [Players]
 *     description: Obtiene la lista completa de jugadores de un equipo específico
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Lista de jugadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamId:
 *                   type: string
 *                 teamName:
 *                   type: string
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 totalPlayers:
 *                   type: integer
 *       404:
 *         description: Equipo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:teamId/players', PlayerController.getPlayersByTeam);

/**
 * @swagger
 * /api/teams/{teamId}/players/{playerId}:
 *   put:
 *     summary: Actualizar información de un jugador
 *     tags: [Players]
 *     description: Actualiza el nombre completo y/o DNI de un jugador
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del jugador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Nuevo nombre completo
 *               dni:
 *                 type: string
 *                 description: Nuevo DNI
 *     responses:
 *       200:
 *         description: Jugador actualizado exitosamente
 *       400:
 *         description: Datos inválidos o DNI duplicado
 *       404:
 *         description: Jugador no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:teamId/players/:playerId', PlayerController.updatePlayer);

/**
 * @swagger
 * /api/teams/{teamId}/players/{playerId}:
 *   delete:
 *     summary: Eliminar un jugador
 *     tags: [Players]
 *     description: Elimina permanentemente un jugador de un equipo
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del jugador
 *     responses:
 *       200:
 *         description: Jugador eliminado exitosamente
 *       404:
 *         description: Jugador no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:teamId/players/:playerId', PlayerController.deletePlayer);

module.exports = router;
