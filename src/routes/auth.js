const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Solicitar código OTP por WhatsApp
 *     tags: [Auth]
 *     description: Genera un código OTP de 6 dígitos y lo envía al número de WhatsApp del superadmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del superadmin (formato internacional sin +)
 *                 example: '51999888777'
 *     responses:
 *       200:
 *         description: Código OTP enviado exitosamente
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
 *                   example: Código OTP enviado por WhatsApp
 *                 expiresIn:
 *                   type: string
 *                   example: 5 minutos
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Número de teléfono no registrado
 *       503:
 *         description: Servicio de WhatsApp no disponible
 */
router.post('/request-otp', AuthController.requestOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verificar código OTP y obtener token
 *     tags: [Auth]
 *     description: Verifica el código OTP y retorna un token JWT válido por 24 horas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otpCode
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del superadmin
 *                 example: '51999888777'
 *               otpCode:
 *                 type: string
 *                 description: Código OTP de 6 dígitos recibido por WhatsApp
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 expiresIn:
 *                   type: string
 *                   example: 24 horas
 *       400:
 *         description: Código inválido o expirado
 *       401:
 *         description: Código OTP incorrecto
 *       404:
 *         description: Número de teléfono no registrado
 */
router.post('/verify-otp', AuthController.verifyOTP);

/**
 * @swagger
 * /api/auth/whatsapp-status:
 *   get:
 *     summary: Obtener estado de conexión de WhatsApp
 *     tags: [Auth]
 *     description: Verifica si el servicio de WhatsApp Web está conectado y listo
 *     responses:
 *       200:
 *         description: Estado de WhatsApp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: WhatsApp Web conectado
 */
router.get('/whatsapp-status', AuthController.getWhatsAppStatus);

/**
 * @swagger
 * /api/auth/whatsapp-qr:
 *   get:
 *     summary: Obtener código QR de WhatsApp en base64
 *     tags: [Auth]
 *     description: Obtiene el código QR de WhatsApp en formato base64 para escanear desde la aplicación
 *     responses:
 *       200:
 *         description: Código QR de WhatsApp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Indica si hay un código QR disponible
 *                   example: true
 *                 connected:
 *                   type: boolean
 *                   description: Indica si WhatsApp ya está conectado
 *                   example: false
 *                 qrCode:
 *                   type: string
 *                   nullable: true
 *                   description: Código QR en formato base64 (data URL)
 *                   example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
 *                 message:
 *                   type: string
 *                   example: Escanea el código QR con WhatsApp
 *       500:
 *         description: Error al obtener código QR
 */
router.get('/whatsapp-qr', AuthController.getWhatsAppQR);

/**
 * @swagger
 * /api/auth/delegado/request-otp:
 *   post:
 *     summary: Solicitar código OTP por WhatsApp (Delegados)
 *     tags: [Auth]
 *     description: Genera un código OTP de 6 dígitos y lo envía al número de WhatsApp del delegado de equipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del delegado (formato internacional sin +)
 *                 example: '987654321'
 *     responses:
 *       200:
 *         description: Código OTP enviado exitosamente
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
 *                   example: Código OTP enviado por WhatsApp
 *                 expiresIn:
 *                   type: string
 *                   example: 5 minutos
 *                 teamName:
 *                   type: string
 *                   example: Real Madrid
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Número de teléfono no registrado como delegado
 *       503:
 *         description: Servicio de WhatsApp no disponible
 */
router.post('/delegado/request-otp', AuthController.requestOTPDelegado);

/**
 * @swagger
 * /api/auth/delegado/verify-otp:
 *   post:
 *     summary: Verificar código OTP y obtener token (Delegados)
 *     tags: [Auth]
 *     description: Verifica el código OTP del delegado y retorna un token JWT válido por 24 horas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otpCode
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de teléfono del delegado
 *                 example: '987654321'
 *               otpCode:
 *                 type: string
 *                 description: Código OTP de 6 dígitos recibido por WhatsApp
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     teamName:
 *                       type: string
 *                       example: Real Madrid
 *                     tournamentName:
 *                       type: string
 *                       example: Copa Mundial 2025
 *                     role:
 *                       type: string
 *                       example: delegado
 *                 expiresIn:
 *                   type: string
 *                   example: 24 horas
 *       400:
 *         description: Código inválido o expirado
 *       401:
 *         description: Código OTP incorrecto
 *       404:
 *         description: Número de teléfono no registrado como delegado
 */
router.post('/delegado/verify-otp', AuthController.verifyOTPDelegado);

module.exports = router;
