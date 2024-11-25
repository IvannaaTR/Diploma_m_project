const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: {
    type: String,
    enum: ['Вода', 'Грунт', 'Відходи'],  
    required: true
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  photos: { type: [String], required: true },
  mark: { type: Number, min: 1, max: 4, required: true },
  area: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    set: () => new Date().toISOString(),
  },
  status: {
    type: String,
    enum: ['Верифіковано', 'Неверифіковано'],
    default: 'Неверифіковано',
  },
  overallRating: {
    type: Number,
    default: 0,
  },
  relevanceRating: {
    type: Number,
    default: 0,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  ratedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }, 
  relevanceRatedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User'}, 
});

const ObservationModel = mongoose.model('Observation', observationSchema);

module.exports = ObservationModel;

