const express = require('express');
const router = express.Router();
const DelegadoController = require('../controllers/delegadoController');

/**
 * @swagger
 * /api/delegado/teams:
 *   get:
 *     summary: Obtener todos los equipos del delegado
 *     tags: [Delegados]
 *     description: Obtiene todos los equipos donde el número de teléfono está registrado como delegado, incluyendo los jugadores de cada equipo
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de teléfono del delegado
 *         example: '987654321'
 *     responses:
 *       200:
 *         description: Lista de equipos del delegado con sus jugadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 delegado:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                       example: '987654321'
 *                     name:
 *                       type: string
 *                       example: Juan Pérez
 *                 totalTeams:
 *                   type: integer
 *                   example: 2
 *                 teams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                         example: Real Madrid
 *                       position:
 *                         type: integer
 *                       delegadoNombre:
 *                         type: string
 *                       delegadoTelefono:
 *                         type: string
 *                       tournament:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           status:
 *                             type: string
 *                       players:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             fullName:
 *                               type: string
 *                             dni:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                       playersCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Número de teléfono faltante
 *       404:
 *         description: No se encontraron equipos para este delegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/teams', DelegadoController.getMyTeams);

/**
 * @swagger
 * /api/delegado/teams/{teamId}:
 *   get:
 *     summary: Obtener detalles de un equipo específico
 *     tags: [Delegados]
 *     description: Obtiene los detalles completos de un equipo, incluyendo sus jugadores. Solo accesible para el delegado asignado.
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *         example: 507f1f77bcf86cd799439012
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de teléfono del delegado
 *         example: '987654321'
 *     responses:
 *       200:
 *         description: Detalles del equipo con jugadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 team:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       example: Real Madrid
 *                     position:
 *                       type: integer
 *                     delegadoNombre:
 *                       type: string
 *                     delegadoTelefono:
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
 *                     players:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           dni:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     playersCount:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Número de teléfono faltante
 *       404:
 *         description: Equipo no encontrado o sin acceso
 *       500:
 *         description: Error interno del servidor
 */
router.get('/teams/:teamId', DelegadoController.getTeamDetails);

module.exports = router;
