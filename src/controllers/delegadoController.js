const Team = require('../models/Team');
const Player = require('../models/Player');

class DelegadoController {
  /**
   * GET /api/delegado/teams
   * Obtiene todos los equipos donde el delegado está asignado
   */
  static async getMyTeams(req, res) {
    try {
      const { phone } = req.query;

      // Validaciones
      if (!phone) {
        return res.status(400).json({
          error: 'Se requiere el número de teléfono'
        });
      }

      // Buscar todos los equipos donde este número es delegado
      const teams = await Team.find({ delegadoTelefono: phone })
        .populate('tournamentId', 'name status')
        .sort({ createdAt: -1 });

      if (!teams || teams.length === 0) {
        return res.status(404).json({
          error: 'No se encontraron equipos para este delegado',
          teams: []
        });
      }

      // Para cada equipo, obtener sus jugadores
      const teamsWithPlayers = await Promise.all(
        teams.map(async (team) => {
          const players = await Player.find({ teamId: team._id }).sort({ fullName: 1 });
          
          return {
            id: team._id,
            name: team.name,
            position: team.position,
            delegadoNombre: team.delegadoNombre,
            delegadoTelefono: team.delegadoTelefono,
            tournament: {
              id: team.tournamentId._id,
              name: team.tournamentId.name,
              status: team.tournamentId.status
            },
            players: players.map(player => ({
              id: player._id,
              fullName: player.fullName,
              dni: player.dni,
              createdAt: player.createdAt
            })),
            playersCount: players.length,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
          };
        })
      );

      res.json({
        success: true,
        delegado: {
          phone,
          name: teams[0].delegadoNombre
        },
        totalTeams: teamsWithPlayers.length,
        teams: teamsWithPlayers
      });
    } catch (error) {
      console.error('Error getting delegado teams:', error);
      res.status(500).json({ error: 'Error al obtener equipos del delegado' });
    }
  }

  /**
   * GET /api/delegado/teams/:teamId
   * Obtiene un equipo específico con sus jugadores
   */
  static async getTeamDetails(req, res) {
    try {
      const { teamId } = req.params;
      const { phone } = req.query;

      // Validaciones
      if (!phone) {
        return res.status(400).json({
          error: 'Se requiere el número de teléfono'
        });
      }

      // Buscar el equipo y verificar que el delegado tenga acceso
      const team = await Team.findOne({ 
        _id: teamId,
        delegadoTelefono: phone 
      }).populate('tournamentId', 'name status totalTeams');

      if (!team) {
        return res.status(404).json({
          error: 'Equipo no encontrado o no tienes acceso a él'
        });
      }

      // Obtener jugadores del equipo
      const players = await Player.find({ teamId: team._id }).sort({ fullName: 1 });

      res.json({
        success: true,
        team: {
          id: team._id,
          name: team.name,
          position: team.position,
          delegadoNombre: team.delegadoNombre,
          delegadoTelefono: team.delegadoTelefono,
          tournament: {
            id: team.tournamentId._id,
            name: team.tournamentId.name,
            status: team.tournamentId.status,
            totalTeams: team.tournamentId.totalTeams
          },
          players: players.map(player => ({
            id: player._id,
            fullName: player.fullName,
            dni: player.dni,
            createdAt: player.createdAt,
            updatedAt: player.updatedAt
          })),
          playersCount: players.length,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        }
      });
    } catch (error) {
      console.error('Error getting team details:', error);
      res.status(500).json({ error: 'Error al obtener detalles del equipo' });
    }
  }
}

module.exports = DelegadoController;
