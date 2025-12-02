const express = require('express');
const router = express.Router();
const PlayerController = require('../controllers/playerController');

/**
 * @swagger
 * /api/dni/{numero}:
 *   get:
 *     summary: Consultar información por DNI
 *     tags: [DNI]
 *     description: Consulta información de una persona usando su número de DNI mediante la API de apis.net.pe
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *         description: Número de DNI (8 dígitos)
 *         example: '72398409'
 *     responses:
 *       200:
 *         description: Información del DNI obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                   description: Nombre completo
 *                   example: MORALES CRUZ GABRIELA ARIANA
 *                 dni:
 *                   type: string
 *                   description: Número de DNI
 *                   example: '72398409'
 *                 firstName:
 *                   type: string
 *                   description: Nombres
 *                   example: GABRIELA ARIANA
 *                 lastName:
 *                   type: string
 *                   description: Apellidos completos
 *                   example: MORALES CRUZ
 *                 apellidoPaterno:
 *                   type: string
 *                   example: MORALES
 *                 apellidoMaterno:
 *                   type: string
 *                   example: CRUZ
 *                 nombres:
 *                   type: string
 *                   example: GABRIELA ARIANA
 *                 tipoDocumento:
 *                   type: string
 *                   example: '1'
 *                 raw:
 *                   type: object
 *                   description: Respuesta completa de la API externa
 *       400:
 *         description: DNI inválido o no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: DNI inválido. Debe contener 8 dígitos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:numero', PlayerController.consultarDni);

module.exports = router;
