const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCodeData = null;
  }

  /**
   * Inicializa el cliente de WhatsApp
   */
  initialize() {
    // Crear directorio de autenticación si no existe
    const authPath = path.join(process.cwd(), '.wwebjs_auth');
    if (!fs.existsSync(authPath)) {
      try {
        fs.mkdirSync(authPath, { recursive: true, mode: 0o755 });
      } catch (error) {
        console.error('Error creando directorio de autenticación:', error);
      }
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: authPath
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', async (qr) => {
      console.log('\n=== Escanea este código QR con WhatsApp ===\n');
      qrcodeTerminal.generate(qr, { small: true });
      console.log('\n==========================================\n');
      
      // Generar QR como base64 para el endpoint
      try {
        this.qrCodeData = await QRCode.toDataURL(qr);
        console.log('✅ Código QR disponible en /api/auth/whatsapp-qr');
      } catch (error) {
        console.error('Error generando QR base64:', error);
      }
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp Web conectado y listo');
      this.isReady = true;
      this.qrCodeData = null; // Limpiar QR cuando está conectado
    });

    this.client.on('authenticated', () => {
      console.log('✅ WhatsApp Web autenticado');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Error de autenticación WhatsApp:', msg);
      this.isReady = false;
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️ WhatsApp desconectado:', reason);
      this.isReady = false;
    });

    this.client.initialize();
  }

  /**
   * Envía un mensaje por WhatsApp
   * @param {string} phone - Número de teléfono en formato internacional sin +
   * @param {string} message - Mensaje a enviar
   */
  async sendMessage(phone, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp Web no está conectado. Escanea el código QR primero.');
    }

    try {
      // Formato: número sin espacios ni caracteres especiales
      // Ejemplo: 51999888777 para Perú
      const chatId = `${phone}@c.us`;
      
      await this.client.sendMessage(chatId, message);
      console.log(`✅ Mensaje enviado a ${phone}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando mensaje WhatsApp:', error);
      throw new Error('Error al enviar mensaje por WhatsApp');
    }
  }

  /**
   * Verifica si el cliente está listo
   */
  isClientReady() {
    return this.isReady;
  }

  /**
   * Obtiene información del estado
   */
  getStatus() {
    return {
      connected: this.isReady,
      message: this.isReady 
        ? 'WhatsApp Web conectado' 
        : 'WhatsApp Web no conectado. Escanea el código QR en la consola.'
    };
  }

  /**
   * Obtiene el código QR en formato base64
   */
  getQRCode() {
    return {
      available: this.qrCodeData !== null,
      connected: this.isReady,
      qrCode: this.qrCodeData,
      message: this.isReady 
        ? 'WhatsApp ya está conectado' 
        : this.qrCodeData 
          ? 'Escanea el código QR con WhatsApp' 
          : 'Esperando código QR...'
    };
  }
}

// Singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
