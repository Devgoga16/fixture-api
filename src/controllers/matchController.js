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

      // Populate goals and yellow cards
      await match.populate('goals.playerId', 'fullName dni');
      await match.populate('goals.teamId', 'name');
      await match.populate('yellowCards.playerId', 'fullName dni');
      await match.populate('yellowCards.teamId', 'name');

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
          goals: match.goals.map(goal => ({
            id: goal._id,
            player: {
              id: goal.playerId._id,
              fullName: goal.playerId.fullName,
              dni: goal.playerId.dni
            },
            team: {
              id: goal.teamId._id,
              name: goal.teamId.name
            },
            createdAt: goal.createdAt
          })),
          yellowCards: match.yellowCards.map(card => ({
            id: card._id,
            player: {
              id: card.playerId._id,
              fullName: card.playerId.fullName,
              dni: card.playerId.dni
            },
            team: {
              id: card.teamId._id,
              name: card.teamId.name
            },
            createdAt: card.createdAt
          })),
          sets: match.sets.map(set => ({
            id: set._id,
            set: set.set,
            score1: set.score1,
            score2: set.score2,
            status: set.status
          })),
          sport: match.sport,
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

  /**
   * POST /api/matches/:matchId/goals
   * Registra un gol anotado en el partido
   */
  static async addGoal(req, res) {
    try {
      const { matchId } = req.params;
      const { playerId, teamId } = req.body;

      // Validaciones
      if (!playerId || !teamId) {
        return res.status(400).json({
          error: 'Se requieren playerId y teamId'
        });
      }

      // Buscar el match
      const match = await Match.findById(matchId)
        .populate('team1Id', 'name')
        .populate('team2Id', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Validar que el equipo sea parte del partido
      if (teamId !== match.team1Id._id.toString() && teamId !== match.team2Id._id.toString()) {
        return res.status(400).json({
          error: 'El equipo no pertenece a este partido'
        });
      }

      // Verificar que el jugador existe y pertenece al equipo
      const player = await Player.findOne({ _id: playerId, teamId: teamId });
      if (!player) {
        return res.status(404).json({
          error: 'Jugador no encontrado o no pertenece al equipo especificado'
        });
      }

      // Agregar el gol
      match.goals.push({
        playerId,
        teamId
      });

      // Actualizar el marcador según el equipo que anotó
      if (teamId === match.team1Id._id.toString()) {
        match.score1 = (match.score1 || 0) + 1;
      } else {
        match.score2 = (match.score2 || 0) + 1;
      }

      await match.save();

      // Repoblar para respuesta
      await match.populate('goals.playerId', 'fullName dni');
      await match.populate('goals.teamId', 'name');

      res.json({
        success: true,
        message: 'Gol registrado exitosamente',
        goal: match.goals[match.goals.length - 1],
        totalGoalsInMatch: match.goals.length,
        currentScore: {
          team1: match.score1,
          team2: match.score2
        }
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      res.status(500).json({ error: 'Error al registrar el gol' });
    }
  }

  /**
   * POST /api/matches/:matchId/yellow-cards
   * Registra una tarjeta amarilla en el partido
   */
  static async addYellowCard(req, res) {
    try {
      const { matchId } = req.params;
      const { playerId, teamId } = req.body;

      // Validaciones
      if (!playerId || !teamId) {
        return res.status(400).json({
          error: 'Se requieren playerId y teamId'
        });
      }

      // Buscar el match
      const match = await Match.findById(matchId)
        .populate('team1Id', 'name')
        .populate('team2Id', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Validar que el equipo sea parte del partido
      if (teamId !== match.team1Id._id.toString() && teamId !== match.team2Id._id.toString()) {
        return res.status(400).json({
          error: 'El equipo no pertenece a este partido'
        });
      }

      // Verificar que el jugador existe y pertenece al equipo
      const player = await Player.findOne({ _id: playerId, teamId: teamId });
      if (!player) {
        return res.status(404).json({
          error: 'Jugador no encontrado o no pertenece al equipo especificado'
        });
      }

      // Agregar la tarjeta amarilla
      match.yellowCards.push({
        playerId,
        teamId
      });

      await match.save();

      // Repoblar para respuesta
      await match.populate('yellowCards.playerId', 'fullName dni');
      await match.populate('yellowCards.teamId', 'name');

      res.json({
        success: true,
        message: 'Tarjeta amarilla registrada exitosamente',
        yellowCard: match.yellowCards[match.yellowCards.length - 1],
        totalYellowCardsInMatch: match.yellowCards.length
      });
    } catch (error) {
      console.error('Error adding yellow card:', error);
      res.status(500).json({ error: 'Error al registrar la tarjeta amarilla' });
    }
  }

  /**
   * GET /api/matches/team/:teamId
   * Obtiene todos los partidos de un equipo (pasados, presentes y futuros)
   */
  static async getTeamMatches(req, res) {
    try {
      const { teamId } = req.params;

      // Buscar todos los partidos donde el equipo participa
      const matches = await Match.find({
        $or: [
          { team1Id: teamId },
          { team2Id: teamId }
        ]
      })
        .populate('tournamentId', 'name status')
        .populate('team1Id', 'name')
        .populate('team2Id', 'name')
        .populate('winnerId', 'name')
        .populate('goals.playerId', 'fullName dni')
        .populate('goals.teamId', 'name')
        .populate('yellowCards.playerId', 'fullName dni')
        .populate('yellowCards.teamId', 'name')
        .sort({ scheduledTime: 1, round: 1, position: 1 });

      if (matches.length === 0) {
        return res.json({
          success: true,
          message: 'No se encontraron partidos para este equipo',
          matches: []
        });
      }

      // Formatear respuesta con información completa
      const formattedMatches = matches.map(match => ({
        id: match._id,
        tournament: {
          id: match.tournamentId._id,
          name: match.tournamentId.name,
          status: match.tournamentId.status
        },
        round: match.round,
        roundName: getRoundName(match.round),
        position: match.position,
        team1: match.team1Id ? {
          id: match.team1Id._id,
          name: match.team1Id.name,
          isMyTeam: match.team1Id._id.toString() === teamId
        } : null,
        team2: match.team2Id ? {
          id: match.team2Id._id,
          name: match.team2Id.name,
          isMyTeam: match.team2Id._id.toString() === teamId
        } : null,
        score1: match.score1,
        score2: match.score2,
        winner: match.winnerId ? {
          id: match.winnerId._id,
          name: match.winnerId.name,
          isMyTeam: match.winnerId._id.toString() === teamId
        } : null,
        goals: match.goals.map(goal => ({
          id: goal._id,
          player: {
            id: goal.playerId._id,
            fullName: goal.playerId.fullName,
            dni: goal.playerId.dni
          },
          team: {
            id: goal.teamId._id,
            name: goal.teamId.name,
            isMyTeam: goal.teamId._id.toString() === teamId
          },
          createdAt: goal.createdAt
        })),
        yellowCards: match.yellowCards.map(card => ({
          id: card._id,
          player: {
            id: card.playerId._id,
            fullName: card.playerId.fullName,
            dni: card.playerId.dni
          },
          team: {
            id: card.teamId._id,
            name: card.teamId.name,
            isMyTeam: card.teamId._id.toString() === teamId
          },
          createdAt: card.createdAt
        })),
        status: match.status,
        scheduledTime: match.scheduledTime,
        completed: match.completed,
        result: match.completed ? (
          match.winnerId ? (
            match.winnerId._id.toString() === teamId ? 'won' : 'lost'
          ) : 'draw'
        ) : null,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt
      }));

      res.json({
        success: true,
        teamId: teamId,
        totalMatches: formattedMatches.length,
        matches: formattedMatches
      });
    } catch (error) {
      console.error('Error getting team matches:', error);
      res.status(500).json({ error: 'Error al obtener partidos del equipo' });
    }
  }

  /**
   * GET /api/matches/:matchId/details/:teamId
   * Obtiene información completa del partido desde la perspectiva de un equipo específico
   */
  static async getMatchDetails(req, res) {
    try {
      const { matchId, teamId } = req.params;

      const match = await Match.findById(matchId)
        .populate('tournamentId', 'name status totalTeams')
        .populate('team1Id', 'name delegadoNombre delegadoTelefono position')
        .populate('team2Id', 'name delegadoNombre delegadoTelefono position')
        .populate('winnerId', 'name')
        .populate('goals.playerId', 'fullName dni')
        .populate('goals.teamId', 'name')
        .populate('yellowCards.playerId', 'fullName dni')
        .populate('yellowCards.teamId', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Validar que el equipo pertenece a este partido
      const isTeam1 = match.team1Id && match.team1Id._id.toString() === teamId;
      const isTeam2 = match.team2Id && match.team2Id._id.toString() === teamId;

      if (!isTeam1 && !isTeam2) {
        return res.status(400).json({
          error: 'El equipo especificado no participa en este partido'
        });
      }

      // Determinar mi equipo y el rival
      const myTeam = isTeam1 ? match.team1Id : match.team2Id;
      const rivalTeam = isTeam1 ? match.team2Id : match.team1Id;

      // Obtener jugadores de ambos equipos
      let myPlayers = [];
      let rivalPlayers = [];

      if (myTeam) {
        myPlayers = await Player.find({ teamId: myTeam._id }).sort({ fullName: 1 });
      }

      if (rivalTeam) {
        rivalPlayers = await Player.find({ teamId: rivalTeam._id }).sort({ fullName: 1 });
      }

      // Filtrar goles y tarjetas por equipo
      const myGoals = match.goals.filter(goal => goal.teamId._id.toString() === teamId);
      const rivalGoals = match.goals.filter(goal => goal.teamId._id.toString() !== teamId);
      const myYellowCards = match.yellowCards.filter(card => card.teamId._id.toString() === teamId);
      const rivalYellowCards = match.yellowCards.filter(card => card.teamId._id.toString() !== teamId);

      // Determinar resultado desde mi perspectiva
      let result = null;
      if (match.completed && match.winnerId) {
        result = match.winnerId._id.toString() === teamId ? 'won' : 'lost';
      } else if (match.completed) {
        result = 'draw';
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
          status: match.status,
          scheduledTime: match.scheduledTime,
          completed: match.completed,
          result: result,
          myTeam: {
            id: myTeam._id,
            name: myTeam.name,
            position: myTeam.position,
            score: isTeam1 ? match.score1 : match.score2,
            delegado: {
              nombre: myTeam.delegadoNombre,
              telefono: myTeam.delegadoTelefono
            },
            players: myPlayers.map(player => ({
              id: player._id,
              fullName: player.fullName,
              dni: player.dni,
              createdAt: player.createdAt
            })),
            playersCount: myPlayers.length,
            goals: myGoals.map(goal => ({
              id: goal._id,
              player: {
                id: goal.playerId._id,
                fullName: goal.playerId.fullName,
                dni: goal.playerId.dni
              },
              createdAt: goal.createdAt
            })),
            yellowCards: myYellowCards.map(card => ({
              id: card._id,
              player: {
                id: card.playerId._id,
                fullName: card.playerId.fullName,
                dni: card.playerId.dni
              },
              createdAt: card.createdAt
            }))
          },
          rivalTeam: rivalTeam ? {
            id: rivalTeam._id,
            name: rivalTeam.name,
            position: rivalTeam.position,
            score: isTeam1 ? match.score2 : match.score1,
            delegado: {
              nombre: rivalTeam.delegadoNombre,
              telefono: rivalTeam.delegadoTelefono
            },
            players: rivalPlayers.map(player => ({
              id: player._id,
              fullName: player.fullName,
              dni: player.dni,
              createdAt: player.createdAt
            })),
            playersCount: rivalPlayers.length,
            goals: rivalGoals.map(goal => ({
              id: goal._id,
              player: {
                id: goal.playerId._id,
                fullName: goal.playerId.fullName,
                dni: goal.playerId.dni
              },
              createdAt: goal.createdAt
            })),
            yellowCards: rivalYellowCards.map(card => ({
              id: card._id,
              player: {
                id: card.playerId._id,
                fullName: card.playerId.fullName,
                dni: card.playerId.dni
              },
              createdAt: card.createdAt
            }))
          } : null,
          sport: match.sport,
          sets: match.sets.map(set => ({
            id: set._id,
            set: set.set,
            score1: set.score1,
            score2: set.score2,
            status: set.status
          })),
          createdAt: match.createdAt,
          updatedAt: match.updatedAt
        }
      });
    } catch (error) {
      console.error('Error getting match details:', error);
      res.status(500).json({ error: 'Error al obtener detalles del partido' });
    }
  }

  /**
   * POST /api/matches/:matchId/sets
   * Registra el resultado de un set en el partido (para voleibol)
   */
  static async addSet(req, res) {
    try {
      const { matchId } = req.params;
      const { set, score1, score2, status } = req.body;

      // Validaciones
      if (!set || score1 === undefined || score2 === undefined) {
        return res.status(400).json({
          error: 'Se requieren set, score1 y score2'
        });
      }

      if (typeof set !== 'number' || typeof score1 !== 'number' || typeof score2 !== 'number') {
        return res.status(400).json({
          error: 'Los valores deben ser números'
        });
      }

      if (score1 < 0 || score2 < 0 || set < 1) {
        return res.status(400).json({
          error: 'Los puntajes y el número de set no pueden ser negativos'
        });
      }

      // Validar status si se proporciona
      if (status && !['in_progress', 'finished'].includes(status)) {
        return res.status(400).json({
          error: 'El status debe ser "in_progress" o "finished"'
        });
      }

      // Buscar el match
      const match = await Match.findById(matchId)
        .populate('team1Id', 'name')
        .populate('team2Id', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Validar que el partido sea de voleibol (sport = 2)
      if (match.sport !== 2) {
        return res.status(400).json({
          error: 'Los sets solo pueden registrarse en partidos de voleibol (sport = 2)'
        });
      }

      // Verificar si ya existe este número de set
      const existingSetIndex = match.sets.findIndex(s => s.set === set);
      
      if (existingSetIndex !== -1) {
        // Actualizar el set existente
        match.sets[existingSetIndex].score1 = score1;
        match.sets[existingSetIndex].score2 = score2;
        if (status) {
          match.sets[existingSetIndex].status = status;
        }
      } else {
        // Crear nuevo set
        match.sets.push({
          set,
          score1,
          score2,
          status: status || 'in_progress'
        });
      }

      // Ordenar sets por número
      match.sets.sort((a, b) => a.set - b.set);

      // Actualizar score1 y score2 con el conteo de sets ganados (solo sets finalizados)
      const finishedSets = match.sets.filter(s => s.status === 'finished');
      const setsWonByTeam1 = finishedSets.filter(s => s.score1 > s.score2).length;
      const setsWonByTeam2 = finishedSets.filter(s => s.score2 > s.score1).length;
      
      match.score1 = setsWonByTeam1;
      match.score2 = setsWonByTeam2;

      await match.save();

      res.json({
        success: true,
        message: existingSetIndex !== -1 ? 'Set actualizado exitosamente' : 'Set registrado exitosamente',
        set: match.sets.find(s => s.set === set),
        totalSets: match.sets.length,
        setsScore: {
          team1: setsWonByTeam1,
          team2: setsWonByTeam2
        },
        allSets: match.sets
      });
    } catch (error) {
      console.error('Error adding set:', error);
      res.status(500).json({ error: 'Error al registrar el set' });
    }
  }

  /**
   * PUT /api/matches/:matchId/sets/:setNumber
   * Actualiza el resultado de un set específico
   */
  static async updateSet(req, res) {
    try {
      const { matchId, setNumber } = req.params;
      const { score1, score2, status } = req.body;

      // Validaciones
      if (score1 === undefined || score2 === undefined) {
        return res.status(400).json({
          error: 'Se requieren score1 y score2'
        });
      }

      if (typeof score1 !== 'number' || typeof score2 !== 'number') {
        return res.status(400).json({
          error: 'Los puntajes deben ser números'
        });
      }

      if (score1 < 0 || score2 < 0) {
        return res.status(400).json({
          error: 'Los puntajes no pueden ser negativos'
        });
      }

      // Validar status si se proporciona
      if (status && !['in_progress', 'finished'].includes(status)) {
        return res.status(400).json({
          error: 'El status debe ser "in_progress" o "finished"'
        });
      }

      // Buscar el match
      const match = await Match.findById(matchId)
        .populate('team1Id', 'name')
        .populate('team2Id', 'name');

      if (!match) {
        return res.status(404).json({ error: 'Partido no encontrado' });
      }

      // Validar que el partido sea de voleibol
      if (match.sport !== 2) {
        return res.status(400).json({
          error: 'Los sets solo pueden actualizarse en partidos de voleibol (sport = 2)'
        });
      }

      // Buscar el set
      const setIndex = match.sets.findIndex(s => s.set === parseInt(setNumber));
      if (setIndex === -1) {
        return res.status(404).json({
          error: `Set ${setNumber} no encontrado`
        });
      }

      // Actualizar el set
      match.sets[setIndex].score1 = score1;
      match.sets[setIndex].score2 = score2;
      if (status) {
        match.sets[setIndex].status = status;
      }

      // Recalcular score1 y score2 (solo sets finalizados)
      const finishedSets = match.sets.filter(s => s.status === 'finished');
      const setsWonByTeam1 = finishedSets.filter(s => s.score1 > s.score2).length;
      const setsWonByTeam2 = finishedSets.filter(s => s.score2 > s.score1).length;
      
      match.score1 = setsWonByTeam1;
      match.score2 = setsWonByTeam2;

      await match.save();

      res.json({
        success: true,
        message: 'Set actualizado exitosamente',
        set: match.sets[setIndex],
        setsScore: {
          team1: setsWonByTeam1,
          team2: setsWonByTeam2
        },
        allSets: match.sets
      });
    } catch (error) {
      console.error('Error updating set:', error);
      res.status(500).json({ error: 'Error al actualizar el set' });
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
