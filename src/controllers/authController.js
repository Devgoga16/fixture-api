const SuperAdmin = require('../models/SuperAdmin');
const Team = require('../models/Team');
const whatsappService = require('../services/whatsappService');
const jwt = require('jsonwebtoken');

class AuthController {
  /**
   * POST /api/auth/request-otp
   * Solicita un código OTP y lo envía por WhatsApp
   */
  static async requestOTP(req, res) {
    try {
      const { phone } = req.body;

      // Validaciones
      if (!phone) {
        return res.status(400).json({
          error: 'Se requiere el número de teléfono'
        });
      }

      // Buscar superadmin por teléfono
      const superAdmin = await SuperAdmin.findOne({ phone });
      if (!superAdmin) {
        return res.status(404).json({
          error: 'Número de teléfono no registrado'
        });
      }

      // Verificar que WhatsApp esté conectado
      if (!whatsappService.isClientReady()) {
        return res.status(503).json({
          error: 'Servicio de WhatsApp no disponible',
          message: 'El administrador debe escanear el código QR primero'
        });
      }

      // Generar código OTP de 6 dígitos
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Establecer expiración (5 minutos)
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      // Guardar OTP en la base de datos
      superAdmin.otpCode = otpCode;
      superAdmin.otpExpiry = otpExpiry;
      await superAdmin.save();

      // Enviar código por WhatsApp
      const message = `🔐 *Fixture API - Código de Acceso*\n\nHola ${superAdmin.name},\n\nTu código de acceso es: *${otpCode}*\n\nEste código es válido por 5 minutos.\n\n⚠️ No compartas este código con nadie.`;

      try {
        // Agregar prefijo 51 si no lo tiene
        const phoneWithCountryCode = phone.startsWith('51') ? phone : `51${phone}`;
        await whatsappService.sendMessage(phoneWithCountryCode, message);
        
        res.json({
          success: true,
          message: 'Código OTP enviado por WhatsApp',
          expiresIn: '5 minutos'
        });
      } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        res.status(500).json({
          error: 'Error al enviar código por WhatsApp',
          message: error.message
        });
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      res.status(500).json({ error: 'Error al solicitar código OTP' });
    }
  }

  /**
   * POST /api/auth/verify-otp
   * Verifica el código OTP y genera un token JWT
   */
  static async verifyOTP(req, res) {
    try {
      const { phone, otpCode } = req.body;

      // Validaciones
      if (!phone || !otpCode) {
        return res.status(400).json({
          error: 'Se requiere teléfono y código OTP'
        });
      }

      // Buscar superadmin
      const superAdmin = await SuperAdmin.findOne({ phone });
      if (!superAdmin) {
        return res.status(404).json({
          error: 'Número de teléfono no registrado'
        });
      }

      // Verificar que existe un OTP
      if (!superAdmin.otpCode || !superAdmin.otpExpiry) {
        return res.status(400).json({
          error: 'No hay código OTP activo. Solicita uno nuevo.'
        });
      }

      // Verificar que el OTP no haya expirado
      if (new Date() > superAdmin.otpExpiry) {
        superAdmin.otpCode = null;
        superAdmin.otpExpiry = null;
        await superAdmin.save();
        
        return res.status(400).json({
          error: 'Código OTP expirado. Solicita uno nuevo.'
        });
      }

      // Verificar que el código coincida
      if (superAdmin.otpCode !== otpCode) {
        return res.status(401).json({
          error: 'Código OTP incorrecto'
        });
      }

      // Limpiar el OTP después de usarlo
      superAdmin.otpCode = null;
      superAdmin.otpExpiry = null;
      await superAdmin.save();

      // Generar JWT
      const token = jwt.sign(
        {
          id: superAdmin._id,
          phone: superAdmin.phone,
          name: superAdmin.name
        },
        process.env.JWT_SECRET || 'default-secret-change-in-production',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: superAdmin._id,
          name: superAdmin.name,
          phone: superAdmin.phone
        },
        expiresIn: '24 horas'
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Error al verificar código OTP' });
    }
  }

  /**
   * GET /api/auth/whatsapp-status
   * Obtiene el estado de conexión de WhatsApp
   */
  static async getWhatsAppStatus(req, res) {
    try {
      const status = whatsappService.getStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      res.status(500).json({ error: 'Error al obtener estado de WhatsApp' });
    }
  }

  /**
   * GET /api/auth/whatsapp-qr
   * Obtiene el código QR de WhatsApp en formato base64
   */
  static async getWhatsAppQR(req, res) {
    try {
      const qrData = whatsappService.getQRCode();
      res.json(qrData);
    } catch (error) {
      console.error('Error getting WhatsApp QR:', error);
      res.status(500).json({ error: 'Error al obtener código QR de WhatsApp' });
    }
  }

  /**
   * POST /api/auth/delegado/request-otp
   * Solicita un código OTP para delegado y lo envía por WhatsApp
   */
  static async requestOTPDelegado(req, res) {
    try {
      const { phone } = req.body;

      // Validaciones
      if (!phone) {
        return res.status(400).json({
          error: 'Se requiere el número de teléfono'
        });
      }

      // Buscar delegado por teléfono
      const team = await Team.findOne({ delegadoTelefono: phone }).populate('tournamentId', 'name');
      if (!team) {
        return res.status(404).json({
          error: 'Número de teléfono no registrado como delegado'
        });
      }

      // Verificar que WhatsApp esté conectado
      if (!whatsappService.isClientReady()) {
        return res.status(503).json({
          error: 'Servicio de WhatsApp no disponible',
          message: 'El administrador debe escanear el código QR primero'
        });
      }

      // Generar código OTP de 6 dígitos
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Establecer expiración (5 minutos)
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      // Guardar OTP en la base de datos
      team.otpCode = otpCode;
      team.otpExpiry = otpExpiry;
      await team.save();

      // Enviar código por WhatsApp
      const message = `🔐 *Fixture API - Código de Acceso*\n\nHola ${team.delegadoNombre || 'Delegado'},\n\nTu código de acceso para el equipo *${team.name}* es: *${otpCode}*\n\nTorneo: ${team.tournamentId.name}\n\nEste código es válido por 5 minutos.\n\n⚠️ No compartas este código con nadie.`;

      try {
        // Agregar prefijo 51 si no lo tiene
        const phoneWithCountryCode = phone.startsWith('51') ? phone : `51${phone}`;
        await whatsappService.sendMessage(phoneWithCountryCode, message);
        
        res.json({
          success: true,
          message: 'Código OTP enviado por WhatsApp',
          expiresIn: '5 minutos',
          teamName: team.name
        });
      } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        res.status(500).json({
          error: 'Error al enviar código por WhatsApp',
          message: error.message
        });
      }
    } catch (error) {
      console.error('Error requesting OTP for delegado:', error);
      res.status(500).json({ error: 'Error al solicitar código OTP' });
    }
  }

  /**
   * POST /api/auth/delegado/verify-otp
   * Verifica el código OTP del delegado y genera un token JWT
   */
  static async verifyOTPDelegado(req, res) {
    try {
      const { phone, otpCode } = req.body;

      // Validaciones
      if (!phone || !otpCode) {
        return res.status(400).json({
          error: 'Se requiere teléfono y código OTP'
        });
      }

      // Buscar delegado
      const team = await Team.findOne({ delegadoTelefono: phone }).populate('tournamentId', 'name');
      if (!team) {
        return res.status(404).json({
          error: 'Número de teléfono no registrado como delegado'
        });
      }

      // Verificar que existe un OTP
      if (!team.otpCode || !team.otpExpiry) {
        return res.status(400).json({
          error: 'No hay código OTP activo. Solicita uno nuevo.'
        });
      }

      // Verificar que el OTP no haya expirado
      if (new Date() > team.otpExpiry) {
        team.otpCode = null;
        team.otpExpiry = null;
        await team.save();
        
        return res.status(400).json({
          error: 'Código OTP expirado. Solicita uno nuevo.'
        });
      }

      // Verificar que el código coincida
      if (team.otpCode !== otpCode) {
        return res.status(401).json({
          error: 'Código OTP incorrecto'
        });
      }

      // Limpiar el OTP después de usarlo
      team.otpCode = null;
      team.otpExpiry = null;
      await team.save();

      // Generar JWT
      const token = jwt.sign(
        {
          id: team._id,
          phone: team.delegadoTelefono,
          name: team.delegadoNombre,
          teamName: team.name,
          tournamentId: team.tournamentId._id,
          role: 'delegado'
        },
        process.env.JWT_SECRET || 'default-secret-change-in-production',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: team._id,
          name: team.delegadoNombre,
          phone: team.delegadoTelefono,
          teamName: team.name,
          tournamentName: team.tournamentId.name,
          role: 'delegado'
        },
        expiresIn: '24 horas'
      });
    } catch (error) {
      console.error('Error verifying OTP for delegado:', error);
      res.status(500).json({ error: 'Error al verificar código OTP' });
    }
  }
}

module.exports = AuthController;
