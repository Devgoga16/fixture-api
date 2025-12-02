const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Índice compuesto para optimizar consultas por torneo
teamSchema.index({ tournamentId: 1, position: 1 });

module.exports = mongoose.model('Team', teamSchema);
