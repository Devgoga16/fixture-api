const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  round: {
    type: Number,
    required: true,
    // -1 para Fase Previa, 0, 1, 2, etc.
  },
  position: {
    type: Number,
    required: true
  },
  team1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  team2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  score1: {
    type: Number,
    default: null
  },
  score2: {
    type: Number,
    default: null
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['created', 'scheduled', 'in_progress', 'finished'],
    default: 'created'
  },
  scheduledTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índice compuesto para reconstruir el bracket eficientemente
matchSchema.index({ tournamentId: 1, round: 1, position: 1 });

module.exports = mongoose.model('Match', matchSchema);
