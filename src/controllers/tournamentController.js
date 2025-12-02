const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
const BracketService = require('../services/bracketService');

class TournamentController {
  /**
   * POST /api/tournaments
   * Crea un nuevo torneo con sus equipos y genera el bracket
   */
  static async createTournament(req, res) {
    try {
      const { name, teams } = req.body;

      // Validaciones
      if (!name || !teams || !Array.isArray(teams) || teams.length < 2) {
        return res.status(400).json({
          error: 'Se requiere un nombre y al menos 2 equipos'
        });
      }

      // Crear el torneo
      const tournament = new Tournament({
        name,
        totalTeams: teams.length,
        status: 'draft'
      });
      await tournament.save();

      // Crear los equipos
      const teamDocs = await Team.insertMany(
        teams.map((team, index) => ({
          tournamentId: tournament._id,
          name: team.name,
          position: index,
          delegadoNombre: team.delegadoNombre || null,
          delegadoTelefono: team.delegadoTelefono || null
        }))
      );

      // Generar el bracket
      const bracket = await BracketService.generateBracket(tournament._id, teamDocs);

      // Obtener los equipos formateados
      const teamsFormatted = teamDocs.map(team => ({
        id: team._id,
        name: team.name,
        position: team.position,
        delegadoNombre: team.delegadoNombre,
        delegadoTelefono: team.delegadoTelefono
      }));

      res.status(201).json({
        id: tournament._id,
        name: tournament.name,
        status: tournament.status,
        totalTeams: tournament.totalTeams,
        bracket,
        teams: teamsFormatted
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      res.status(500).json({ error: 'Error al crear el torneo' });
    }
  }

  /**
   * GET /api/tournaments/:id
   * Obtiene un torneo con su bracket y equipos
   */
  static async getTournament(req, res) {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      const bracket = await BracketService.getBracket(tournament._id);
      const teams = await Team.find({ tournamentId: tournament._id }).sort({ position: 1 });

      const teamsFormatted = teams.map(team => ({
        id: team._id,
        name: team.name,
        position: team.position,
        delegadoNombre: team.delegadoNombre,
        delegadoTelefono: team.delegadoTelefono
      }));

      res.json({
        id: tournament._id,
        name: tournament.name,
        status: tournament.status,
        totalTeams: tournament.totalTeams,
        bracket,
        teams: teamsFormatted,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt
      });
    } catch (error) {
      console.error('Error getting tournament:', error);
      res.status(500).json({ error: 'Error al obtener el torneo' });
    }
  }

  /**
   * GET /api/tournaments
   * Lista todos los torneos
   */
  static async listTournaments(req, res) {
    try {
      const tournaments = await Tournament.find().sort({ createdAt: -1 });

      const tournamentsFormatted = tournaments.map(tournament => ({
        id: tournament._id,
        name: tournament.name,
        status: tournament.status,
        totalTeams: tournament.totalTeams,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt
      }));

      res.json(tournamentsFormatted);
    } catch (error) {
      console.error('Error listing tournaments:', error);
      res.status(500).json({ error: 'Error al listar los torneos' });
    }
  }

  /**
   * PUT /api/tournaments/:id/matches/:matchId
   * Actualiza el resultado de un partido
   */
  static async updateMatchResult(req, res) {
    try {
      const { id, matchId } = req.params;
      const { score1, score2 } = req.body;

      // Validaciones
      if (score1 === undefined || score2 === undefined) {
        return res.status(400).json({ error: 'Se requieren ambos scores' });
      }

      if (!Number.isInteger(score1) || !Number.isInteger(score2) || score1 < 0 || score2 < 0) {
        return res.status(400).json({ error: 'Los scores deben ser números enteros positivos' });
      }

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      const bracket = await BracketService.updateMatchResult(id, matchId, score1, score2);

      // Actualizar el estado del torneo si es necesario
      if (tournament.status === 'draft') {
        tournament.status = 'in_progress';
        await tournament.save();
      }

      // Obtener el match actualizado
      const updatedMatch = await Match.findById(matchId)
        .populate('team1Id team2Id winnerId');

      res.json({
        bracket,
        match: {
          id: updatedMatch._id,
          round: updatedMatch.round,
          position: updatedMatch.position,
          team1: updatedMatch.team1Id ? {
            id: updatedMatch.team1Id._id,
            name: updatedMatch.team1Id.name
          } : null,
          team2: updatedMatch.team2Id ? {
            id: updatedMatch.team2Id._id,
            name: updatedMatch.team2Id.name
          } : null,
          score1: updatedMatch.score1,
          score2: updatedMatch.score2,
          winner: updatedMatch.winnerId ? {
            id: updatedMatch.winnerId._id,
            name: updatedMatch.winnerId.name
          } : null,
          completed: updatedMatch.completed
        }
      });
    } catch (error) {
      console.error('Error updating match result:', error);
      res.status(400).json({ error: error.message || 'Error al actualizar el resultado' });
    }
  }

  /**
   * POST /api/tournaments/:id/reset
   * Resetea un torneo (elimina todos los resultados)
   */
  static async resetTournament(req, res) {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      const bracket = await BracketService.resetBracket(id);
      const teams = await Team.find({ tournamentId: id }).sort({ position: 1 });

      tournament.status = 'draft';
      await tournament.save();

      const teamsFormatted = teams.map(team => ({
        id: team._id,
        name: team.name,
        position: team.position,
        delegadoNombre: team.delegadoNombre,
        delegadoTelefono: team.delegadoTelefono
      }));

      res.json({
        bracket,
        teams: teamsFormatted,
        status: tournament.status
      });
    } catch (error) {
      console.error('Error resetting tournament:', error);
      res.status(500).json({ error: 'Error al resetear el torneo' });
    }
  }

  /**
   * DELETE /api/tournaments/:id
   * Elimina un torneo completo
   */
  static async deleteTournament(req, res) {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({ error: 'Torneo no encontrado' });
      }

      // Eliminar todos los datos relacionados
      await Team.deleteMany({ tournamentId: id });
      await Match.deleteMany({ tournamentId: id });
      await tournament.deleteOne();

      res.json({ message: 'Torneo eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      res.status(500).json({ error: 'Error al eliminar el torneo' });
    }
  }
}

module.exports = TournamentController;
