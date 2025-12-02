const Player = require('../models/Player');
const Team = require('../models/Team');
const DniService = require('../services/dniService');

class PlayerController {
  /**
   * POST /api/teams/:teamId/players
   * Agregar jugadores a un equipo
   */
  static async addPlayers(req, res) {
    try {
      const { teamId } = req.params;
      const { players } = req.body;

      // Validaciones
      if (!players || !Array.isArray(players) || players.length === 0) {
        return res.status(400).json({
          error: 'Se requiere un array de jugadores'
        });
      }

      // Verificar que el equipo existe
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }

      // Validar cada jugador
      for (const player of players) {
        if (!player.fullName || !player.dni) {
          return res.status(400).json({
            error: 'Cada jugador debe tener fullName y dni'
          });
        }
      }

      // Crear los jugadores
      const playerDocs = await Player.insertMany(
        players.map(player => ({
          teamId: teamId,
          fullName: player.fullName,
          dni: player.dni
        }))
      );

      const playersFormatted = playerDocs.map(player => ({
        id: player._id,
        fullName: player.fullName,
        dni: player.dni,
        createdAt: player.createdAt
      }));

      res.status(201).json({
        teamId: teamId,
        players: playersFormatted
      });
    } catch (error) {
      console.error('Error adding players:', error);
      
      // Manejar error de DNI duplicado
      if (error.code === 11000) {
        return res.status(400).json({ 
          error: 'Uno o más DNI ya están registrados en este equipo' 
        });
      }
      
      res.status(500).json({ error: 'Error al agregar jugadores' });
    }
  }

  /**
   * GET /api/teams/:teamId/players
   * Obtener todos los jugadores de un equipo
   */
  static async getPlayersByTeam(req, res) {
    try {
      const { teamId } = req.params;

      // Verificar que el equipo existe
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }

      const players = await Player.find({ teamId }).sort({ createdAt: 1 });

      const playersFormatted = players.map(player => ({
        id: player._id,
        fullName: player.fullName,
        dni: player.dni,
        createdAt: player.createdAt
      }));

      res.json({
        teamId: teamId,
        teamName: team.name,
        players: playersFormatted,
        totalPlayers: playersFormatted.length
      });
    } catch (error) {
      console.error('Error getting players:', error);
      res.status(500).json({ error: 'Error al obtener jugadores' });
    }
  }

  /**
   * DELETE /api/teams/:teamId/players/:playerId
   * Eliminar un jugador de un equipo
   */
  static async deletePlayer(req, res) {
    try {
      const { teamId, playerId } = req.params;

      const player = await Player.findOne({ _id: playerId, teamId });
      if (!player) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
      }

      await player.deleteOne();

      res.json({ message: 'Jugador eliminado correctamente' });
    } catch (error) {
      console.error('Error deleting player:', error);
      res.status(500).json({ error: 'Error al eliminar jugador' });
    }
  }

  /**
   * PUT /api/teams/:teamId/players/:playerId
   * Actualizar información de un jugador
   */
  static async updatePlayer(req, res) {
    try {
      const { teamId, playerId } = req.params;
      const { fullName, dni } = req.body;

      if (!fullName && !dni) {
        return res.status(400).json({ 
          error: 'Debe proporcionar al menos un campo para actualizar' 
        });
      }

      const player = await Player.findOne({ _id: playerId, teamId });
      if (!player) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
      }

      if (fullName) player.fullName = fullName;
      if (dni) player.dni = dni;

      await player.save();

      res.json({
        id: player._id,
        fullName: player.fullName,
        dni: player.dni,
        updatedAt: player.updatedAt
      });
    } catch (error) {
      console.error('Error updating player:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({ 
          error: 'El DNI ya está registrado en este equipo' 
        });
      }
      
      res.status(500).json({ error: 'Error al actualizar jugador' });
    }
  }

  /**
   * GET /api/dni/:numero
   * Consultar información de una persona por DNI
   */
  static async consultarDni(req, res) {
    try {
      const { numero } = req.params;

      // Validar formato de DNI (8 dígitos)
      if (!/^\d{8}$/.test(numero)) {
        return res.status(400).json({
          error: 'DNI inválido. Debe contener 8 dígitos'
        });
      }

      const result = await DniService.consultarDni(numero);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          error: result.error,
          message: result.message
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Error consultando DNI:', error);
      res.status(500).json({ error: 'Error al consultar DNI' });
    }
  }
}

module.exports = PlayerController;
