const Match = require('../models/Match');
const Team = require('../models/Team');
const whatsappService = require('../services/whatsappService');

class MatchNotificationController {
  /**
   * POST /api/matches/:matchId/notify
   * Envía notificaciones por WhatsApp a los delegados de los equipos involucrados en el partido
   */
  static async sendMatchNotification(req, res) {
    try {
      const { matchId } = req.params;
      const { notificationType } = req.body;

      // Validaciones
      if (!notificationType) {
        return res.status(400).json({
          error: 'Se requiere el tipo de notificación',
          allowedTypes: ['next_match', 'starting_soon', 'winner_announcement']
        });
      }

      const allowedTypes = ['next_match', 'starting_soon', 'winner_announcement'];
      if (!allowedTypes.includes(notificationType)) {
        return res.status(400).json({
          error: 'Tipo de notificación inválido',
          allowedTypes
        });
      }

      // Verificar que WhatsApp esté conectado
      if (!whatsappService.isClientReady()) {
        return res.status(503).json({
          error: 'Servicio de WhatsApp no disponible',
          message: 'El administrador debe escanear el código QR primero'
        });
      }

      // Buscar el match
      const match = await Match.findById(matchId)
        .populate('tournamentId', 'name')
        .populate('team1Id', 'name delegadoNombre delegadoTelefono')
        .populate('team2Id', 'name delegadoNombre delegadoTelefono')
        .populate('winnerId', 'name delegadoNombre delegadoTelefono');

      if (!match) {
        return res.status(404).json({
          error: 'Partido no encontrado'
        });
      }

      // Validar que el match tenga ambos equipos asignados
      if (!match.team1Id || !match.team2Id) {
        return res.status(400).json({
          error: 'El partido no tiene ambos equipos asignados aún'
        });
      }

      // Para winner_announcement, validar que el partido esté completado
      if (notificationType === 'winner_announcement') {
        if (!match.completed || !match.winnerId) {
          return res.status(400).json({
            error: 'El partido no ha sido completado o no tiene ganador aún'
          });
        }
      }

      // Generar mensajes según el tipo
      let messagesData = [];
      
      switch (notificationType) {
        case 'next_match':
          messagesData = MatchNotificationController._generateNextMatchMessages(match);
          break;
        case 'starting_soon':
          messagesData = MatchNotificationController._generateStartingSoonMessages(match);
          break;
        case 'winner_announcement':
          messagesData = MatchNotificationController._generateWinnerMessages(match);
          break;
      }

      // Enviar mensajes
      const results = [];
      for (const msgData of messagesData) {
        if (!msgData.phone) {
          results.push({
            team: msgData.teamName,
            status: 'skipped',
            reason: 'Delegado sin teléfono registrado'
          });
          continue;
        }

        try {
          // Agregar prefijo 51 si no lo tiene
          const phoneWithCountryCode = msgData.phone.startsWith('51') ? msgData.phone : `51${msgData.phone}`;
          await whatsappService.sendMessage(phoneWithCountryCode, msgData.message);
          
          results.push({
            team: msgData.teamName,
            delegado: msgData.delegadoName,
            phone: msgData.phone,
            status: 'sent'
          });
        } catch (error) {
          console.error(`Error enviando a ${msgData.phone}:`, error);
          results.push({
            team: msgData.teamName,
            delegado: msgData.delegadoName,
            phone: msgData.phone,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        notificationType,
        match: {
          id: match._id,
          round: match.round,
          position: match.position,
          team1: match.team1Id.name,
          team2: match.team2Id.name,
          tournament: match.tournamentId.name
        },
        notifications: results
      });
    } catch (error) {
      console.error('Error sending match notification:', error);
      res.status(500).json({ error: 'Error al enviar notificaciones del partido' });
    }
  }

  /**
   * Genera mensajes para notificar que son el próximo partido
   */
  static _generateNextMatchMessages(match) {
    const roundName = this._getRoundName(match.round);
    const messages = [];

    // Mensaje para equipo 1
    if (match.team1Id.delegadoTelefono) {
      let scheduledTimeText = '';
      if (match.scheduledTime) {
        const utcDate = new Date(match.scheduledTime);
        const peruDate = new Date(utcDate.getTime() - (0 * 60 * 60 * 1000)); // UTC-5
        const hours = peruDate.getUTCHours().toString().padStart(2, '0');
        const minutes = peruDate.getUTCMinutes().toString().padStart(2, '0');
        scheduledTimeText = `\n⏰ *Hora programada:* ${hours}:${minutes}\n`;
      }

      messages.push({
        teamName: match.team1Id.name,
        delegadoName: match.team1Id.delegadoNombre,
        phone: match.team1Id.delegadoTelefono,
        message: `⚽ *${match.tournamentId.name}*\n\n` +
                `Hola ${match.team1Id.delegadoNombre || 'Delegado'},\n\n` +
                `📢 *${match.team1Id.name}* es el próximo en jugar.\n\n` +
                `*Enfrentamiento:*\n` +
                `${match.team1Id.name} vs ${match.team2Id.name}\n` +
                `${roundName}${scheduledTimeText}\n` +
                `Por favor, acércate a la mesa de control para:\n` +
                `✅ Realizar la gestión necesaria\n` +
                `✅ Validar jugadores\n` +
                `✅ Confirmar asistencia\n\n` +
                `¡Dios los bendiga!`
      });
    }

    // Mensaje para equipo 2
    if (match.team2Id.delegadoTelefono) {
      let scheduledTimeText = '';
      if (match.scheduledTime) {
        const utcDate = new Date(match.scheduledTime);
        const peruDate = new Date(utcDate.getTime() - (0 * 60 * 60 * 1000)); // UTC+5
        const hours = peruDate.getUTCHours().toString().padStart(2, '0');
        const minutes = peruDate.getUTCMinutes().toString().padStart(2, '0');
        scheduledTimeText = `\n⏰ *Hora programada:* ${hours}:${minutes}\n`;
      }

      messages.push({
        teamName: match.team2Id.name,
        delegadoName: match.team2Id.delegadoNombre,
        phone: match.team2Id.delegadoTelefono,
        message: `⚽ *${match.tournamentId.name}*\n\n` +
                `Hola ${match.team2Id.delegadoNombre || 'Delegado'},\n\n` +
                `📢 *${match.team2Id.name}* es el próximo en jugar.\n\n` +
                `*Enfrentamiento:*\n` +
                `${match.team1Id.name} vs ${match.team2Id.name}\n` +
                `${roundName}${scheduledTimeText}\n` +
                `Por favor, acércate a la mesa de control para:\n` +
                `✅ Realizar la gestión necesaria\n` +
                `✅ Validar jugadores\n` +
                `✅ Confirmar asistencia\n\n` +
                `¡Dios los bendiga!`
      });
    }

    return messages;
  }

  /**
   * Genera mensajes para notificar que el partido comienza en 5 minutos
   */
  static _generateStartingSoonMessages(match) {
    const roundName = this._getRoundName(match.round);
    const messages = [];

    // Mensaje para equipo 1
    if (match.team1Id.delegadoTelefono) {

      messages.push({
        teamName: match.team1Id.name,
        delegadoName: match.team1Id.delegadoNombre,
        phone: match.team1Id.delegadoTelefono,
        message: `⏰ *${match.tournamentId.name}*\n\n` +
                `Hola ${match.team1Id.delegadoNombre || 'Delegado'},\n\n` +
                `🚨 *¡EL PARTIDO COMIENZA EN 5 MINUTOS!*\n\n` +
                `*Enfrentamiento:*\n` +
                `${match.team1Id.name} vs ${match.team2Id.name}\n` +
                `${roundName}\n` +
                `Por favor, dirígete a la cancha con tu equipo.\n\n` +
                `¡Es hora de darlo todo! 💪⚽`
      });
    }

    // Mensaje para equipo 2
    if (match.team2Id.delegadoTelefono) {

      messages.push({
        teamName: match.team2Id.name,
        delegadoName: match.team2Id.delegadoNombre,
        phone: match.team2Id.delegadoTelefono,
        message: `⏰ *${match.tournamentId.name}*\n\n` +
                `Hola ${match.team2Id.delegadoNombre || 'Delegado'},\n\n` +
                `🚨 *¡EL PARTIDO COMIENZA EN 5 MINUTOS!*\n\n` +
                `*Enfrentamiento:*\n` +
                `${match.team1Id.name} vs ${match.team2Id.name}\n` +
                `${roundName}\n` +
                `Por favor, dirígete a la cancha con tu equipo.\n\n` +
                `¡Es hora de darlo todo! 💪⚽`
      });
    }

    return messages;
  }

  /**
   * Genera mensajes para comunicar y felicitar al ganador
   */
  static _generateWinnerMessages(match) {
    const roundName = this._getRoundName(match.round);
    const messages = [];

    // Determinar ganador y perdedor
    const winnerId = match.winnerId._id.toString();
    const winnerTeam = match.winnerId;
    const loserTeam = match.team1Id._id.toString() === winnerId ? match.team2Id : match.team1Id;

    // Mensaje para el ganador
    if (winnerTeam.delegadoTelefono) {
      messages.push({
        teamName: winnerTeam.name,
        delegadoName: winnerTeam.delegadoNombre,
        phone: winnerTeam.delegadoTelefono,
        message: `🏆 *${match.tournamentId.name}*\n\n` +
                `Hola ${winnerTeam.delegadoNombre || 'Delegado'},\n\n` +
                `🎉 *¡FELICIDADES ${winnerTeam.name}!* 🎉\n\n` +
                `Han ganado el partido contra ${loserTeam.name}\n` +
                `${roundName}\n\n` +
                `*Resultado Final:*\n` +
                `${match.team1Id.name} ${match.score1} - ${match.score2} ${match.team2Id.name}\n\n` +
                `¡Excelente trabajo! Continúan en el torneo. 💪⚽\n\n` +
                `Prepárense para el próximo desafío.`
      });
    }

    // Mensaje para el perdedor
    if (loserTeam.delegadoTelefono) {
      messages.push({
        teamName: loserTeam.name,
        delegadoName: loserTeam.delegadoNombre,
        phone: loserTeam.delegadoTelefono,
        message: `⚽ *${match.tournamentId.name}*\n\n` +
                `Hola ${loserTeam.delegadoNombre || 'Delegado'},\n\n` +
                `Gracias por participar en este partido contra ${winnerTeam.name}\n` +
                `${roundName}\n\n` +
                `*Resultado Final:*\n` +
                `${match.team1Id.name} ${match.score1} - ${match.score2} ${match.team2Id.name}\n\n` +
                `Agradecemos su esfuerzo y dedicación. 👏\n\n` +
                `¡Esperamos verlos en futuros torneos!`
      });
    }

    return messages;
  }

  /**
   * Obtiene el nombre legible de la ronda
   */
  static _getRoundName(round) {
    const roundNames = {
      '-1': 'Fase Previa',
      '0': 'Octavos de Final',
      '1': 'Cuartos de Final',
      '2': 'Semifinal',
      '3': 'Final'
    };
    return roundNames[round] || `Ronda ${round}`;
  }
}

module.exports = MatchNotificationController;
