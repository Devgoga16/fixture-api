const Match = require('../models/Match');

class MatchController {
  /**
   * PUT /api/matches/:matchId/status
   * Actualiza el estado y hora programada de un partido
   */
  static async updateMatchStatus(req, res) {
    try {
      const { matchId } = req.params;
      const { status, scheduledTime } = req.body;

      // Validaciones
      const allowedStatuses = ['created', 'scheduled', 'in_progress', 'finished'];
      if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Estado inválido',
          allowedStatuses
        });
      }

      // Buscar el match
      const match = await Match.findById(matchId)
        .populate('tournamentId', 'name')
        .populate('team1Id', 'name')
        .populate('team2Id', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      

      // Validar scheduledTime si el estado es 'scheduled'
      if (status === 'scheduled' && !scheduledTime) {
        return res.status(400).json({
          error: 'Se requiere scheduledTime cuando el estado es "scheduled"'
        });
      }

      // Actualizar campos
      if (status) {
        match.status = status;
      }

      if (scheduledTime) {
        match.scheduledTime = new Date(scheduledTime);
      }

      // Si cambia a finished, marcar como completed
      if (status === 'finished' && match.winnerId) {
        match.completed = true;
      }

      await match.save();

      res.json({
        success: true,
        match: {
          id: match._id,
          tournament: match.tournamentId ? match.tournamentId.name : null,
          round: match.round,
          position: match.position,
          team1: match.team1Id ? match.team1Id.name : null,
          team2: match.team2Id ? match.team2Id.name : null,
          status: match.status,
          scheduledTime: match.scheduledTime,
          completed: match.completed,
          updatedAt: match.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating match status:', error);
      res.status(500).json({ error: 'Error al actualizar estado del partido' });
    }
  }

  /**
   * GET /api/matches/:matchId
   * Obtiene detalles de un partido
   */
  static async getMatch(req, res) {
    try {
      const { matchId } = req.params;

      const match = await Match.findById(matchId)
        .populate('tournamentId', 'name')
        .populate('team1Id', 'name delegadoNombre delegadoTelefono')
        .populate('team2Id', 'name delegadoNombre delegadoTelefono')
        .populate('winnerId', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      res.json({
        success: true,
        match: {
          id: match._id,
          tournament: {
            id: match.tournamentId._id,
            name: match.tournamentId.name
          },
          round: match.round,
          position: match.position,
          team1: match.team1Id ? {
            id: match.team1Id._id,
            name: match.team1Id.name,
            delegadoNombre: match.team1Id.delegadoNombre,
            delegadoTelefono: match.team1Id.delegadoTelefono
          } : null,
          team2: match.team2Id ? {
            id: match.team2Id._id,
            name: match.team2Id.name,
            delegadoNombre: match.team2Id.delegadoNombre,
            delegadoTelefono: match.team2Id.delegadoTelefono
          } : null,
          score1: match.score1,
          score2: match.score2,
          winner: match.winnerId ? {
            id: match.winnerId._id,
            name: match.winnerId.name
          } : null,
          status: match.status,
          scheduledTime: match.scheduledTime,
          completed: match.completed,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt
        }
      });
    } catch (error) {
      console.error('Error getting match:', error);
      res.status(500).json({ error: 'Error al obtener detalles del partido' });
    }
  }
}

module.exports = MatchController;
