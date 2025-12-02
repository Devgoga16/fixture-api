const express = require('express');
const router = express.Router();
const SuperAdminController = require('../controllers/superAdminController');

/**
 * @swagger
 * /api/superadmins:
 *   post:
 *     summary: Crear un nuevo superadmin
 *     tags: [SuperAdmins]
 *     description: Crea un nuevo superadmin con nombre y teléfono
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del superadmin
 *                 example: Carlos Rodríguez
 *               phone:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: '999888777'
 *     responses:
 *       201:
 *         description: Superadmin creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuperAdmin'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', SuperAdminController.createSuperAdmin);

/**
 * @swagger
 * /api/superadmins:
 *   get:
 *     summary: Listar todos los superadmins
 *     tags: [SuperAdmins]
 *     description: Obtiene la lista completa de superadmins ordenados por fecha de creación
 *     responses:
 *       200:
 *         description: Lista de superadmins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SuperAdmin'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', SuperAdminController.listSuperAdmins);

/**
 * @swagger
 * /api/superadmins/{id}:
 *   get:
 *     summary: Obtener un superadmin específico
 *     tags: [SuperAdmins]
 *     description: Obtiene los detalles de un superadmin por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del superadmin
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Detalles del superadmin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuperAdmin'
 *       404:
 *         description: Superadmin no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', SuperAdminController.getSuperAdmin);

/**
 * @swagger
 * /api/superadmins/{id}:
 *   put:
 *     summary: Actualizar un superadmin
 *     tags: [SuperAdmins]
 *     description: Actualiza el nombre y/o teléfono de un superadmin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del superadmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre
 *               phone:
 *                 type: string
 *                 description: Nuevo teléfono
 *     responses:
 *       200:
 *         description: Superadmin actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Superadmin no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', SuperAdminController.updateSuperAdmin);

/**
 * @swagger
 * /api/superadmins/{id}:
 *   delete:
 *     summary: Eliminar un superadmin
 *     tags: [SuperAdmins]
 *     description: Elimina permanentemente un superadmin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del superadmin
 *     responses:
 *       200:
 *         description: Superadmin eliminado exitosamente
 *       404:
 *         description: Superadmin no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', SuperAdminController.deleteSuperAdmin);

module.exports = router;
