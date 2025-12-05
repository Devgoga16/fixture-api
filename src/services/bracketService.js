const Match = require('../models/Match');
const Team = require('../models/Team');

class BracketService {
  /**
   * Genera el bracket completo para un torneo
   * @param {string} tournamentId - ID del torneo
   * @param {Array} teams - Array de equipos del torneo
   * @returns {Object} - Bracket con todas las rondas
   */
  static async generateBracket(tournamentId, teams) {
    const totalTeams = teams.length;
    
    // Si es potencia de 2, no hay fase previa
    if (this._isPowerOf2(totalTeams)) {
      return this._generateStandardBracket(tournamentId, teams);
    }
    
    // Calcular equipos en fase previa
    // Ejemplo: 17 equipos -> nextPowerOf2 = 16 (no 32!)
    const nextPowerOf2 = Math.pow(2, Math.floor(Math.log2(totalTeams)));
    const teamsInPreliminary = (totalTeams - nextPowerOf2) * 2; // Equipos que juegan fase previa
    const preliminaryMatchesCount = teamsInPreliminary / 2;

    let matches = [];
    
    // FASE PREVIA (round -1)
    for (let i = 0; i < preliminaryMatchesCount; i++) {
      matches.push({
        tournamentId,
        round: -1,
        position: i,
        team1Id: teams[i * 2]._id,
        team2Id: teams[i * 2 + 1]._id,
        score1: null,
        score2: null,
        winnerId: null,
        completed: false,
        status: 'created',
        scheduledTime: null
      });
    }

    // PRIMERA RONDA PRINCIPAL (round 0) - nextPowerOf2 / 2 matches
    const firstRoundMatches = nextPowerOf2 / 2;
    
    for (let pos = 0; pos < firstRoundMatches; pos++) {
      const match = {
        tournamentId,
        round: 0,
        position: pos,
        team1Id: null,
        team2Id: null,
        score1: null,
        score2: null,
        winnerId: null,
        completed: false,
        status: 'created',
        scheduledTime: null
      };

      if (pos < preliminaryMatchesCount) {
        // Este match espera al ganador de fase previa
        // team2Id es el equipo que viene después de los equipos de fase previa
        const team2Index = teamsInPreliminary + pos;
        if (team2Index < teams.length) {
          match.team2Id = teams[team2Index]._id;
        }
      } else {
        // Matches con equipos que tienen BYE emparejados entre sí
        const baseIndex = teamsInPreliminary + preliminaryMatchesCount;
        const pairOffset = (pos - preliminaryMatchesCount) * 2;
        
        const team1Index = baseIndex + pairOffset;
        const team2Index = baseIndex + pairOffset + 1;
        
        if (team1Index < teams.length) {
          match.team1Id = teams[team1Index]._id;
        }
        if (team2Index < teams.length) {
          match.team2Id = teams[team2Index]._id;
        }
      }
      
      matches.push(match);
    }

    // RONDAS SIGUIENTES (cuartos, semis, final)
    const remainingRounds = Math.log2(nextPowerOf2) - 1;
    
    for (let round = 1; round <= remainingRounds; round++) {
      const matchesInRound = Math.pow(2, remainingRounds - round);
      
      for (let pos = 0; pos < matchesInRound; pos++) {
        matches.push({
          tournamentId,
          round: round,
          position: pos,
          team1Id: null,
          team2Id: null,
          score1: null,
          score2: null,
          winnerId: null,
          completed: false,
          status: 'created',
          scheduledTime: null
        });
      }
    }

    // Guardar todos los matches en la BD
    const savedMatches = await Match.insertMany(matches);
    
    return this._formatBracket(savedMatches, totalTeams);
  }

  /**
   * Genera un bracket estándar cuando el número de equipos es potencia de 2
   */
  static async _generateStandardBracket(tournamentId, teams) {
    const totalTeams = teams.length;
    const rounds = Math.log2(totalTeams);
    let matches = [];

    for (let round = 0; round < rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round - 1);
      
      for (let pos = 0; pos < matchesInRound; pos++) {
        const match = {
          tournamentId,
          round: round,
          position: pos,
          team1Id: null,
          team2Id: null,
          score1: null,
          score2: null,
          winnerId: null,
          completed: false,
          status: 'created',
          scheduledTime: null
        };

        // Solo la primera ronda tiene equipos asignados
        if (round === 0) {
          const team1Index = pos * 2;
          const team2Index = pos * 2 + 1;
          
          if (team1Index < teams.length) {
            match.team1Id = teams[team1Index]._id;
          }
          if (team2Index < teams.length) {
            match.team2Id = teams[team2Index]._id;
          }
        }

        matches.push(match);
      }
    }

    const savedMatches = await Match.insertMany(matches);
    return this._formatBracket(savedMatches, totalTeams);
  }

  /**
   * Verifica si un número es potencia de 2
   */
  static _isPowerOf2(n) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  /**
   * Obtiene el bracket completo de un torneo desde la BD
   */
  static async getBracket(tournamentId) {
    const matches = await Match.find({ tournamentId })
      .populate('team1Id team2Id winnerId')
      .sort({ round: 1, position: 1 });

    const teams = await Team.find({ tournamentId }).sort({ position: 1 });
    
    return this._formatBracket(matches, teams.length);
  }

  /**
   * Formatea los matches en estructura de rondas
   */
  static _formatBracket(matches, totalTeams) {
    const roundsMap = {};
    
    matches.forEach(match => {
      if (!roundsMap[match.round]) {
        roundsMap[match.round] = [];
      }
      roundsMap[match.round].push(this._formatMatch(match));
    });

    // Convertir a array de rondas ordenado
    const rounds = Object.keys(roundsMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(round => roundsMap[round]);

    return {
      rounds,
      totalTeams
    };
  }

  /**
   * Formatea un match para la respuesta
   */
  static _formatMatch(match) {
    return {
      id: match._id || match.id,
      round: match.round,
      position: match.position,
      team1: match.team1Id ? {
        id: match.team1Id._id || match.team1Id,
        name: match.team1Id.name || null
      } : null,
      team2: match.team2Id ? {
        id: match.team2Id._id || match.team2Id,
        name: match.team2Id.name || null
      } : null,
      score1: match.score1,
      score2: match.score2,
      winner: match.winnerId ? {
        id: match.winnerId._id || match.winnerId,
        name: match.winnerId.name || null
      } : null,
      completed: match.completed,
      status: match.status || 'created',
      scheduledTime: match.scheduledTime || null
    };
  }

  /**
   * Actualiza el resultado de un match y propaga el ganador
   */
  static async updateMatchResult(tournamentId, matchId, score1, score2) {
    const match = await Match.findOne({ _id: matchId, tournamentId });
    
    if (!match) {
      throw new Error('Match no encontrado');
    }

    if (!match.team1Id || !match.team2Id) {
      throw new Error('El match debe tener ambos equipos asignados');
    }

    if (score1 === score2) {
      throw new Error('No se permiten empates');
    }

    // Determinar ganador
    const winnerId = score1 > score2 ? match.team1Id : match.team2Id;

    // Actualizar el match actual
    match.score1 = score1;
    match.score2 = score2;
    match.winnerId = winnerId;
    match.completed = true;
    match.status = 'finished';
    await match.save();

    // Propagar el ganador al siguiente match
    await this._propagateWinner(tournamentId, match, winnerId);

    // Retornar el bracket actualizado
    return this.getBracket(tournamentId);
  }

  /**
   * Propaga el ganador de un match al siguiente match en la ronda siguiente
   */
  static async _propagateWinner(tournamentId, currentMatch, winnerId) {
    // Si es un match de fase previa (round -1)
    if (currentMatch.round === -1) {
      // El ganador va a la primera ronda principal (round 0)
      const nextRound = 0;
      const nextPosition = currentMatch.position; // Mismo position en round 0
      
      const nextMatch = await Match.findOne({
        tournamentId,
        round: nextRound,
        position: nextPosition
      });

      if (nextMatch) {
        // El ganador de fase previa siempre va a team1Id
        nextMatch.team1Id = winnerId;
        
        // Si el siguiente match ya estaba completado, lo reseteamos
        if (nextMatch.completed) {
          nextMatch.score1 = null;
          nextMatch.score2 = null;
          nextMatch.winnerId = null;
          nextMatch.completed = false;
          
          await this._clearSubsequentMatches(tournamentId, nextMatch);
        }
        
        await nextMatch.save();
      }
      return;
    }

    // Para matches de rondas principales
    const nextRound = currentMatch.round + 1;
    const nextPosition = Math.floor(currentMatch.position / 2);

    const nextMatch = await Match.findOne({
      tournamentId,
      round: nextRound,
      position: nextPosition
    });

    if (!nextMatch) {
      // Es la final, no hay siguiente match
      return;
    }

    // Determinar si el ganador va a team1 o team2 del siguiente match
    if (currentMatch.position % 2 === 0) {
      nextMatch.team1Id = winnerId;
    } else {
      nextMatch.team2Id = winnerId;
    }

    // Si el siguiente match ya estaba completado, lo reseteamos
    if (nextMatch.completed) {
      nextMatch.score1 = null;
      nextMatch.score2 = null;
      nextMatch.winnerId = null;
      nextMatch.completed = false;
      
      // Limpiar matches subsecuentes recursivamente
      await this._clearSubsequentMatches(tournamentId, nextMatch);
    }

    await nextMatch.save();
  }

  /**
   * Limpia los matches siguientes cuando se actualiza un resultado anterior
   */
  static async _clearSubsequentMatches(tournamentId, match) {
    const nextRound = match.round + 1;
    const nextPosition = Math.floor(match.position / 2);

    const nextMatch = await Match.findOne({
      tournamentId,
      round: nextRound,
      position: nextPosition
    });

    if (!nextMatch) {
      return;
    }

    // Determinar qué equipo limpiar del siguiente match
    if (match.position % 2 === 0) {
      nextMatch.team1Id = null;
    } else {
      nextMatch.team2Id = null;
    }

    if (nextMatch.completed) {
      nextMatch.score1 = null;
      nextMatch.score2 = null;
      nextMatch.winnerId = null;
      nextMatch.completed = false;
      
      await this._clearSubsequentMatches(tournamentId, nextMatch);
    }

    await nextMatch.save();
  }

  /**
   * Resetea todos los resultados de un torneo
   */
  static async resetBracket(tournamentId) {
    // Obtener todos los matches y equipos
    const matches = await Match.find({ tournamentId }).sort({ round: 1, position: 1 });
    const teams = await Team.find({ tournamentId }).sort({ position: 1 });

    // Eliminar todos los matches existentes
    await Match.deleteMany({ tournamentId });

    // Regenerar el bracket desde cero
    return this.generateBracket(tournamentId, teams);
  }
}

module.exports = BracketService;
