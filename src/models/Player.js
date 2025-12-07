const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dni: {
    type: String,
    required: true,
    trim: true
  },
  camiseta: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Índice compuesto para optimizar consultas por equipo
playerSchema.index({ teamId: 1 });

// Índice único para DNI por equipo (evita duplicados en el mismo equipo)
playerSchema.index({ teamId: 1, dni: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);
