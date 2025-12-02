const express = require('express');
const router = express.Router();
const TournamentController = require('../controllers/tournamentController');

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Crear un nuevo torneo
 *     tags: [Tournaments]
 *     description: Crea un torneo con los equipos especificados y genera automáticamente el bracket completo. Si el número de equipos no es potencia de 2, se creará una fase previa.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournamentRequest'
 *     responses:
 *       201:
 *         description: Torneo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TournamentWithDetails'
 *       400:
 *         description: Datos inválidos (nombre faltante o menos de 2 equipos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', TournamentController.createTournament);

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Listar todos los torneos
 *     tags: [Tournaments]
 *     description: Obtiene una lista de todos los torneos ordenados por fecha de creación (más recientes primero)
 *     responses:
 *       200:
 *         description: Lista de torneos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', TournamentController.listTournaments);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Obtener un torneo específico
 *     tags: [Tournaments]
 *     description: Obtiene los detalles completos de un torneo, incluyendo su bracket actual y todos sus equipos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del torneo
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Detalles del torneo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TournamentWithDetails'
 *       404:
 *         description: Torneo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', TournamentController.getTournament);

/**
 * @swagger
 * /api/tournaments/{id}/matches/{matchId}:
 *   put:
 *     summary: Actualizar el resultado de un match
 *     tags: [Tournaments]
 *     description: Actualiza el resultado de un match específico. El ganador se propaga automáticamente al siguiente match del bracket. No se permiten empates. Si se actualiza un match que ya tenía resultado, se limpian los matches subsecuentes.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del torneo
 *         example: 507f1f77bcf86cd799439011
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del match
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMatchRequest'
 *     responses:
 *       200:
 *         description: Resultado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bracket:
 *                   $ref: '#/components/schemas/Bracket'
 *                 match:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: Datos inválidos (scores faltantes, match sin ambos equipos, empate, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Torneo o match no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/matches/:matchId', TournamentController.updateMatchResult);

/**
 * @swagger
 * /api/tournaments/{id}/reset:
 *   post:
 *     summary: Resetear un torneo
 *     tags: [Tournaments]
 *     description: Elimina todos los resultados del torneo y regenera el bracket desde cero. Los equipos se mantienen en sus posiciones originales.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del torneo
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Torneo reseteado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bracket:
 *                   $ref: '#/components/schemas/Bracket'
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *                 status:
 *                   type: string
 *                   example: draft
 *       404:
 *         description: Torneo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/reset', TournamentController.resetTournament);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Eliminar un torneo
 *     tags: [Tournaments]
 *     description: Elimina permanentemente un torneo y todos sus datos relacionados (equipos, matches)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del torneo
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Torneo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Torneo eliminado correctamente
 *       404:
 *         description: Torneo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', TournamentController.deleteTournament);

module.exports = router;
