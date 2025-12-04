const Match = require('../models/Match');
const Player = require('../models/Player');

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
   * PUT /api/matches/:matchId/score
   * Actualiza el marcador del partido sin finalizarlo
   */
  static async updateScore(req, res) {
    try {
      const { matchId } = req.params;
      const { score1, score2 } = req.body;

      // Validaciones
      if (score1 === undefined || score2 === undefined) {
        return res.status(400).json({
          error: 'Se requieren ambos marcadores (score1 y score2)'
        });
      }

      if (typeof score1 !== 'number' || typeof score2 !== 'number') {
        return res.status(400).json({
          error: 'Los marcadores deben ser números'
        });
      }

      if (score1 < 0 || score2 < 0) {
        return res.status(400).json({
          error: 'Los marcadores no pueden ser negativos'
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

      // Validar que el match tenga ambos equipos
      if (!match.team1Id || !match.team2Id) {
        return res.status(400).json({
          error: 'El partido no tiene ambos equipos asignados'
        });
      }

      // Actualizar marcadores sin completar el partido
      match.score1 = score1;
      match.score2 = score2;
      // No se actualiza winnerId ni completed

      await match.save();

      res.json({
        success: true,
        message: 'Marcador actualizado',
        match: {
          id: match._id,
          tournament: match.tournamentId.name,
          round: match.round,
          position: match.position,
          team1: match.team1Id.name,
          team2: match.team2Id.name,
          score1: match.score1,
          score2: match.score2,
          status: match.status,
          completed: match.completed,
          updatedAt: match.updatedAt
        }
      });
    } catch (error) {
      console.error('Error updating match score:', error);
      res.status(500).json({ error: 'Error al actualizar marcador del partido' });
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

  /**
   * GET /api/matches/:matchId/full
   * Obtiene detalles completos de un partido incluyendo jugadores de ambos equipos
   */
  static async getMatchFull(req, res) {
    try {
      const { matchId } = req.params;

      const match = await Match.findById(matchId)
        .populate('tournamentId', 'name status totalTeams')
        .populate('team1Id', 'name delegadoNombre delegadoTelefono position')
        .populate('team2Id', 'name delegadoNombre delegadoTelefono position')
        .populate('winnerId', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Obtener jugadores de ambos equipos
      let team1Players = [];
      let team2Players = [];

      if (match.team1Id) {
        team1Players = await Player.find({ teamId: match.team1Id._id }).sort({ fullName: 1 });
      }

      if (match.team2Id) {
        team2Players = await Player.find({ teamId: match.team2Id._id }).sort({ fullName: 1 });
      }

      res.json({
        success: true,
        match: {
          id: match._id,
          tournament: {
            id: match.tournamentId._id,
            name: match.tournamentId.name,
            status: match.tournamentId.status,
            totalTeams: match.tournamentId.totalTeams
          },
          round: match.round,
          roundName: getRoundName(match.round),
          position: match.position,
          team1: match.team1Id ? {
            id: match.team1Id._id,
            name: match.team1Id.name,
            position: match.team1Id.position,
            delegado: {
              nombre: match.team1Id.delegadoNombre,
              telefono: match.team1Id.delegadoTelefono
            },
            players: team1Players.map(player => ({
              id: player._id,
              fullName: player.fullName,
              dni: player.dni,
              createdAt: player.createdAt
            })),
            playersCount: team1Players.length
          } : null,
          team2: match.team2Id ? {
            id: match.team2Id._id,
            name: match.team2Id.name,
            position: match.team2Id.position,
            delegado: {
              nombre: match.team2Id.delegadoNombre,
              telefono: match.team2Id.delegadoTelefono
            },
            players: team2Players.map(player => ({
              id: player._id,
              fullName: player.fullName,
              dni: player.dni,
              createdAt: player.createdAt
            })),
            playersCount: team2Players.length
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
      console.error('Error getting full match details:', error);
      res.status(500).json({ error: 'Error al obtener detalles completos del partido' });
    }
  }
}

/**
 * Helper para obtener nombre legible de la ronda
 */
function getRoundName(round) {
  const roundNames = {
    '-1': 'Fase Previa',
    '0': 'Octavos de Final',
    '1': 'Cuartos de Final',
    '2': 'Semifinal',
    '3': 'Final'
  };
  return roundNames[round] || `Ronda ${round}`;
}

module.exports = MatchController;
